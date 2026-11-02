import { addAfterEffect, Canvas, useThree } from "@react-three/fiber";
import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  Color,
  GreaterDepth,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MultiplyBlending,
  NormalBlending,
  NotEqualStencilFunc,
  ReplaceStencilOp,
  type SkinnedMesh,
  type BufferGeometry,
  type InstancedMesh,
  type Material,
} from "three";

import { REDUCED_MOTION, useMediaQuery } from "~/lib/useMediaQuery";
import { readProgress } from "~/features/progress/progress";
import { useActiveTheme } from "~/features/theme/context";
import type { CampusTheme } from "~/features/theme/schema";

import { cameraOffset } from "../camera";
import { advanceScene, sceneLoad, sceneMounted, STAGE, type SceneLoad } from "../hud/sceneLoad";
import { ViewControls } from "../hud/ViewControls";
import { NPC_SPOT, NPCS, SITES } from "../layout";
import { siteLooks, type InteractTarget, type SiteInfoMap } from "../sites";
import type { SceneLook } from "../sky";
import { hubStore } from "../store";
import {
  BLOB_SEGMENTS,
  RING_SEGMENTS,
  TREE_INSTANCES,
  treeMatrix,
  type TreeInstance,
} from "./campus";
import { disposeFigure, loadCast, paintFigure, type CastJson, type CastRole } from "./cast";
import { useCampusGeometry, type CampusGeometry } from "./useCampusGeometry";
import { useDressing } from "./useDressing";
import { castFigures, FIGURE_Y, useHubFrame } from "./useHubFrame";
import { WorldLabels } from "./WorldLabels";

export interface CampusSceneProps {
  sites: SiteInfoMap;
  onInteract: (target: InteractTarget) => void;
  look: SceneLook;
}

const ROUND = TREE_INSTANCES.filter((tree) => tree.kind === "round");
const CYPRESS = TREE_INSTANCES.filter((tree) => tree.kind === "cypress");
const FLAT = -Math.PI / 2;
const BLACK = new Color(0, 0, 0);
const MULTIPLY = {
  vertexColors: true,
  blending: MultiplyBlending,
  premultipliedAlpha: true,
  transparent: true,
  depthWrite: false,
} as const;

export default function CampusScene({ sites, onInteract, look }: CampusSceneProps) {
  const { campus } = useActiveTheme();
  const reducedMotion = useMediaQuery(REDUCED_MOTION);
  const smallOrTouch = useMediaQuery("(pointer: coarse), (max-width: 767.98px)");
  const [countFrames] = useState(
    () => new URLSearchParams(window.location.search).get("debug") === "frames",
  );
  const baked = useDeferredValue(look);
  useLayoutEffect(() => {
    sceneMounted(true);
    return () => sceneMounted(false);
  }, []);

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 z-0 touch-pinch-zoom select-none">
        <Canvas
          orthographic
          flat
          frameloop="demand"
          dpr={[1, smallOrTouch ? 1.5 : 2]}
          gl={{ antialias: true, alpha: true, stencil: true, powerPreference: "high-performance" }}
          camera={{
            near: 0.1,
            far: 200,
            zoom: 30,
            position: cameraOffset(hubStore.getState().view.yaw),
          }}
        >
          <Campus
            campus={campus}
            look={baked}
            sites={sites}
            options={{ reducedMotion, countFrames, rebaking: look !== baked, onInteract }}
          />
          <SceneReady />
        </Canvas>
      </div>
      <WorldLabels sites={sites} />
      <ViewControls />
    </>
  );
}

function SceneReady() {
  const gl = useThree((state) => state.gl);
  useLayoutEffect(() => {
    advanceScene(STAGE.paint);
    const off = addAfterEffect(() => {
      if (gl.info.render.frame === 0) return;
      off();
      requestAnimationFrame(() => advanceScene(STAGE.done));
    });
    return off;
  }, [gl]);
  return null;
}

interface CampusProps {
  campus: CampusTheme;
  look: SceneLook;
  sites: SiteInfoMap;
  options: Omit<Parameters<typeof useHubFrame>[0], "castPending" | "figures">;
}

const painted = (s: SceneLoad) => s.stage >= STAGE.done;

function Campus({ campus, look, sites, options }: CampusProps) {
  const [progress] = useState(readProgress);
  const looks = siteLooks(sites, progress);
  const g = useCampusGeometry(
    campus,
    look.sky,
    look.bake,
    looks.library,
    looks.watchtower,
    looks.market,
  );
  const { preset } = g.palette;
  const sunPosition = useMemo(() => g.palette.light.sun.clone().multiplyScalar(30), [g.palette]);
  const dressing = useDressing(g.palette);
  const [cast, setCast] = useState<CastJson | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    const start = (s: SceneLoad) => {
      if (!painted(s)) return;
      off();
      void loadCast().then((c) => live && setCast(c));
    };
    const off = sceneLoad.subscribe(start);
    start(sceneLoad.getState());
    return () => {
      live = false;
      off();
    };
  }, []);
  const materials = useMemo(
    () => ({
      baked: new MeshBasicMaterial({ vertexColors: true }),
      figure: new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
      tree: new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
      blob: new MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
      xray: new MeshBasicMaterial({ depthFunc: GreaterDepth, depthWrite: false }),
      ring: new MeshBasicMaterial(),
      shadow: new MeshBasicMaterial({
        ...MULTIPLY,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: NotEqualStencilFunc,
        stencilZPass: ReplaceStencilOp,
      }),
      ao: new MeshBasicMaterial(MULTIPLY),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(materials).forEach((material: Material) => material.dispose()),
    [materials],
  );
  const figures = useMemo(() => (cast ? castFigures(cast, materials) : null), [cast, materials]);
  useEffect(
    () => () => {
      if (!figures) return;
      disposeFigure(figures.player.mesh);
      for (const { mesh } of Object.values(figures.people)) disposeFigure(mesh);
    },
    [figures],
  );
  const { player, playerBlob, lan, ring, statics, wake } = useHubFrame({
    ...options,
    figures,
    castPending: cast === undefined,
    rebaking: options.rebaking || dressing === undefined,
  });
  useEffect(() => {
    const pal = g.palette;
    const pool = pal.darkness >= 0.5;
    materials.xray.color.copy(g.base.xray);
    materials.ring.color.copy(pal.ring);
    materials.figure.color.setScalar(pal.figureLift);
    materials.blob.setValues({
      blending: pool ? AdditiveBlending : NormalBlending,
      color: pool ? pal.glow : BLACK,
      opacity: pool ? 1 : 0.18,
    });
    playerBlob.current?.scale.setScalar(pool ? 2.2 : 1);
    wake();
  }, [materials, g.palette, g.base, playerBlob, wake]);
  useEffect(wake, [look, wake]);
  useLayoutEffect(() => {
    if (!figures || !cast) return;
    const pal = g.base;
    const paint = (who: CastRole, mesh: SkinnedMesh, looks: Parameters<typeof paintFigure>[2]) =>
      paintFigure(mesh, cast.roles[who], looks);
    paint("player", figures.player.mesh, { top: pal.player, bottom: pal.pants });
    paint("lan", figures.people.lan.mesh, { top: pal.npc, bottom: pal.lanSkirt });
    for (const { id } of NPCS) {
      const look = campus.npcs[id];
      paint(id, figures.people[id].mesh, {
        top: new Color(look.top),
        bottom: new Color(look.bottom),
        accent: new Color(look.accent),
      });
    }
    wake();
  }, [figures, cast, g.base, campus.npcs, wake]);
  useEffect(() => {
    if (options.countFrames) {
      document.documentElement.dataset.cast =
        cast === undefined ? "loading" : cast ? "ready" : "failed";
    }
    wake();
  }, [cast, options.countFrames, wake]);
  useEffect(() => {
    if (dressing !== undefined) wake();
  }, [dressing, wake]);

  const looksKey = Object.entries(looks)
    .map(([id, look]) => `${id}:${look}`)
    .join(" ");
  useEffect(() => {
    if (options.countFrames) document.documentElement.dataset.looks = looksKey;
  }, [options.countFrames, looksKey]);

  return (
    <>
      <hemisphereLight
        color={preset.sky}
        groundColor={preset.ground}
        intensity={preset.hemisphere}
      />
      <directionalLight color={preset.sun} intensity={preset.sunIntensity} position={sunPosition} />
      <group ref={statics}>
        <mesh geometry={g.terrain} material={materials.baked} />
        <mesh geometry={g.landmark} material={materials.baked} />
        {dressing && <mesh geometry={dressing} material={materials.baked} />}
        {SITES.map(({ id }) => (
          <mesh key={id} geometry={g[id]} material={materials.baked} userData={{ site: id }} />
        ))}
        <Trees geometry={g.roundTree} material={materials.tree} trees={ROUND} g={g} />
        <Trees geometry={g.cypress} material={materials.tree} trees={CYPRESS} g={g} />
      </group>
      <mesh geometry={g.shadow} material={materials.shadow} />
      <mesh geometry={g.ao} material={materials.ao} />

      <group ref={player}>
        {figures ? (
          <primitive object={figures.player.body} />
        ) : (
          <>
            <mesh geometry={g.player} material={materials.xray} renderOrder={1} />
            <mesh geometry={g.player} material={materials.figure} renderOrder={2} />
          </>
        )}
      </group>
      <mesh ref={playerBlob} rotation-x={FLAT} material={materials.blob}>
        <circleGeometry args={[0.36, BLOB_SEGMENTS]} />
      </mesh>

      <group ref={lan} position={[NPC_SPOT.x, FIGURE_Y, NPC_SPOT.z]}>
        {figures ? (
          <primitive object={figures.people.lan.body} />
        ) : (
          <mesh geometry={g.lan} material={materials.figure} />
        )}
      </group>
      {figures ? (
        NPCS.map(({ id }) => <primitive key={id} object={figures.people[id].body} />)
      ) : (
        <mesh geometry={g.npcs} material={materials.figure} />
      )}

      <mesh ref={ring} rotation-x={FLAT} visible={false} material={materials.ring}>
        <ringGeometry args={[0.55, 0.66, RING_SEGMENTS]} />
      </mesh>
    </>
  );
}

const shadeColour = new Color();

function Trees(props: {
  geometry: BufferGeometry;
  material: Material;
  trees: readonly TreeInstance[];
  g: Pick<CampusGeometry, "palette" | "shadedTrees">;
}) {
  const { geometry, material, trees } = props;
  const { palette, shadedTrees } = props.g;
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    trees.forEach((tree, i) => {
      mesh.setMatrixAt(i, treeMatrix(tree));
      shadeColour.setScalar(tree.brightness);
      if (shadedTrees.has(tree)) shadeColour.multiply(palette.shadow);
      mesh.setColorAt(i, shadeColour);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [geometry, trees, palette, shadedTrees]);
  return (
    <instancedMesh ref={ref} args={[geometry, material, trees.length]} frustumCulled={false} />
  );
}
