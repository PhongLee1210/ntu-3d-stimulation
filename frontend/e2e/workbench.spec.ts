import http from "node:http";
import type { AddressInfo } from "node:net";

import type { Page } from "@playwright/test";

import { fillDefaults } from "../app/features/workbench/bench";
import type { Graph } from "../app/features/workbench/schema";
import { levelFile, parseSse, sseText, testEnv } from "../app/features/workbench/test-fixtures";
import { bundleReport, expect, mockWorkbenchApi, runId, sse, test } from "./fixtures";

const L1 = "/play/library/grounded-citation";
const L3 = "/play/library/article-number-lookup";
const fmt = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

interface Score {
  stars: number;
  normal_passed: number;
  normal_total: number;
  traps_passed: number;
  traps_total: number;
  tokens: number;
  budget: number;
}

function referenceFacts() {
  const frames = parseSse(sse.reference());
  const data = (event: string) =>
    frames
      .filter((f) => f.event === event)
      .map((f) => JSON.parse(f.data) as Record<string, unknown>);
  const score = data("run.scored")[0]?.score as Score;
  const finished = data("run.finished")[0] as {
    report: { diagnosis: unknown[] };
    models: Record<string, number>;
  };
  const cases = (data("run.started")[0]?.cases as unknown[]).length;
  return { score, finished, cases };
}

const SSE_HEADERS = { "content-type": "text/event-stream", "cache-control": "no-store" };

async function sseServer(reply: (n: number, response: http.ServerResponse) => void) {
  const lastEventIds: (string | null)[] = [];
  const server = http.createServer((request, response) => {
    const last = request.headers["last-event-id"];
    lastEventIds.push(typeof last === "string" ? last : null);
    reply(lastEventIds.length, response);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    lastEventIds,
    attach: (page: Page) =>
      page.route("**/api/runs/*/events", (route) =>
        route.continue({ url: `http://127.0.0.1:${port}/events` }),
      ),
    close: () => server.close(),
  };
}

test.describe("workbench", () => {
  test("plays L1 from the zone page to stars, then keeps the graph", async ({
    page,
    consoleErrors,
  }) => {
    const mock = await mockWorkbenchApi(page, { events: () => sse.reference() });
    const requested: string[] = [];
    page.on("request", (request) => requested.push(new URL(request.url()).pathname));

    await page.goto("/play/library");
    await page.getByRole("link", { name: "Vào màn Thôi bịa điều luật" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Thôi bịa điều luật" })).toBeFocused();

    await page.getByRole("switch", { name: "Gắn Vòm Sao" }).check();
    await page.getByRole("slider", { name: /Móc kéo/ }).fill("3");
    await page.getByRole("button", { name: "Thùng Context: Chưa chạy" }).click();
    await page.getByRole("switch", { name: /Máy đóng tem/ }).check();
    await page.getByRole("button", { name: "Bộ Óc: Chưa chạy" }).click();
    for (const name of [/^Khe 1: thẻ/, /^Khe 2: thẻ/]) {
      await page.getByRole("button", { name }).click();
    }
    const deck = page.getByRole("list", { name: "Thẻ dặn dò" });
    for (const key of ["G1", "G2", "G3"]) {
      await deck.getByRole("button", { name: new RegExp(`^${key}`) }).click();
    }
    await expect(page.getByRole("button", { name: /^Khe 3: thẻ G3/ })).toBeVisible();
    await page.getByRole("button", { name: "Mở ca" }).click();

    const results = page.getByRole("heading", { level: 2, name: "Kết quả ca tối nay" });
    await expect(results).toBeFocused();
    await expect(page.locator("#slot-out").getByText("Đạt", { exact: true })).toBeVisible();
    const post = mock.posts[0];
    expect(post?.contentType).toBe("application/json");
    expect(post?.key).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
    const env = testEnv("grounded-citation");
    expect(fillDefaults(env.blocks, JSON.parse(post?.body ?? "{}") as Graph)).toEqual(
      fillDefaults(env.blocks, levelFile("grounded-citation").reference_graph),
    );

    const { score, finished, cases } = referenceFacts();
    await expect(page.getByText(`${score.stars}/3 sao`, { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        `${score.normal_passed}/${score.normal_total} câu thường đạt · câu #1 (Minh): `,
      ),
    ).toBeVisible();
    await expect(page.getByText(`${fmt(score.tokens)}/${fmt(score.budget)} token`)).toBeVisible();
    await expect(
      page.getByText(`${score.traps_passed}/${score.traps_total} câu bẫy đạt · `),
    ).toBeVisible();
    await expect(page.locator("article[id^='cau-']")).toHaveCount(cases);
    const diagnosis = page.getByRole("heading", { name: "Cô Lan chẩn đoán" });
    await expect(diagnosis).toBeVisible();
    if (finished.report.diagnosis.length === 0) {
      await expect(page.getByText("Không có câu nào cần chẩn đoán.")).toBeVisible();
    }
    const [model, calls] = Object.entries(finished.models)[0] ?? ["", 0];
    await expect(page.getByText(`${model} (${calls} lời gọi)`)).toBeVisible();

    const history = await page.evaluate(() =>
      window.localStorage.getItem("vg.history.v1.grounded-citation"),
    );
    const kept = JSON.parse(history ?? "null") as { runs?: { cases?: unknown[] }[] } | null;
    expect(kept?.runs).toHaveLength(1);
    expect(kept?.runs?.[0]?.cases).toHaveLength(cases);

    await page.locator('input[name="debrief-next"]').first().check();
    const afterDebrief = await page.evaluate(() => {
      const raw = window.localStorage.getItem("vg.history.v1.grounded-citation");
      return JSON.parse(raw ?? "null") as { runs?: { next?: unknown }[] } | null;
    });
    expect(afterDebrief?.runs?.[0]?.next).toBeDefined();

    await expect(page.getByRole("heading", { name: "Các lượt trước" })).toBeVisible();
    await expect(page.locator("[data-run-row]")).toHaveCount(1);

    const wide = page.viewportSize();
    await page.setViewportSize({ width: 375, height: 812 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0);
    expect(
      await page
        .locator('[data-vg-viz="table"] [role="region"]')
        .evaluate((el) => el.scrollWidth > el.clientWidth),
    ).toBe(true);
    if (wide) await page.setViewportSize(wide);

    await page.getByRole("button", { name: "Nhân bản cấu hình của lượt 1" }).click();
    const afterDuplicate = await page.evaluate(() => {
      const raw = window.localStorage.getItem("vg.history.v1.grounded-citation");
      return (JSON.parse(raw ?? "null") as { runs?: unknown[] } | null)?.runs?.length ?? 0;
    });
    expect(afterDuplicate).toBe(1);

    for (const details of await page.locator("details").all()) {
      await details.evaluate((element) => element.setAttribute("open", ""));
    }
    const figures = page.locator("[data-vg-viz]");
    const count = await figures.count();
    expect(count).toBeGreaterThan(0);
    const STAMPS = [
      "Đo từ lượt của bạn",
      "Đo từ nhãn của bạn",
      "Tính sẵn từ chỉ mục",
      "Minh hoạ",
      "Lượt chạy đã ghi",
      "Mô phỏng",
      "Dữ liệu ghi sẵn",
    ];
    for (let i = 0; i < count; i++) {
      const figure = figures.nth(i);
      await expect(figure.locator("figcaption")).not.toBeEmpty();
      const text = (await figure.textContent()) ?? "";
      expect(STAMPS.filter((stamp) => text.includes(stamp))).toHaveLength(1);
      const toggle = figure.getByRole("button", { name: /^Xem dạng (bảng|hình)$/ });
      if ((await figure.getAttribute("data-vg-viz")) === "table") {
        await expect(figure.locator("table")).toHaveCount(1);
        await expect(toggle).toHaveCount(0);
      } else {
        await expect(toggle).toBeVisible();
        const before = await figure.locator("table").count();
        await toggle.click();
        await expect(figure.locator("table")).toHaveCount(before === 0 ? 1 : 0);
        await toggle.click();
      }
    }

    await page.getByRole("button", { name: "Chỉnh rồi chạy lại" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Bàn thợ" })).toBeFocused();
    await page.getByRole("button", { name: /^Vòm Sao:/ }).click();
    await expect(page.getByRole("slider", { name: /Móc kéo/ })).toHaveValue("3");
    await page.reload();
    await expect(page.getByRole("slider", { name: /Móc kéo/ })).toHaveValue("3");
    await expect(page.getByText("Đã lưu cấu hình trên máy này.")).toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(
      requested.filter((path) => bundleReport.threeChunks.some((c) => path.endsWith(c))),
    ).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test("checks an invalid L3 graph before sending, then shows the server's 422 on its slot", async ({
    page,
  }) => {
    const mock = await mockWorkbenchApi(page, {
      post: () => ({
        status: 422,
        body: {
          detail: "Đồ thị chưa chạy được. Sửa các lỗi bên dưới rồi thử lại.",
          issues: [
            {
              code: "G06",
              severity: "error",
              node: "rr",
              port: null,
              message_vi: "top_n của *Xếp hạng lại* là 9 nhưng phía trước chỉ lấy 3 đoạn.",
              concept_ref: "N8.top_n",
            },
          ],
        },
      }),
    });
    await page.goto(L3);
    await page.getByRole("switch", { name: "Gắn Phễu" }).check();
    const funnel = page.locator("#slot-fu");
    await expect(funnel).toContainText("Hợp nhất kết quả gộp từ 2 đến 3 danh sách, đang có 1.");
    await expect(funnel).toContainText("Gắn thêm Tủ ngăn kéo hoặc tháo Phễu.");

    await page.getByRole("button", { name: "Mở ca" }).click();
    const summary = page
      .getByRole("alert")
      .filter({ hasText: "Còn 1 lỗi cần sửa trước khi mở ca." });
    await expect(summary).toBeFocused();
    expect(mock.posts).toHaveLength(0);
    await summary.getByRole("button", { name: /^Phễu:/ }).click();
    await expect(page.getByRole("switch", { name: "Gắn Tủ ngăn kéo" })).toBeFocused();

    await page.getByRole("switch", { name: "Gắn Tủ ngăn kéo" }).check();
    await expect(funnel).not.toContainText("gộp từ 2 đến 3 danh sách");
    await page.getByRole("switch", { name: "Gắn Kính lúp" }).check();
    await page.getByRole("button", { name: "Mở ca" }).click();

    const serverSummary = page
      .getByRole("alert")
      .filter({ hasText: "Đồ thị chưa chạy được. Sửa các lỗi bên dưới rồi thử lại." });
    await expect(serverSummary).toBeFocused();
    await expect(page.locator("#slot-rr")).toContainText(
      "top_n của Xếp hạng lại là 9 nhưng phía trước chỉ lấy 3 đoạn.",
    );
    await serverSummary.getByRole("button", { name: /^Kính lúp:/ }).click();
    await expect(page.locator("#slot-rr").getByRole("slider")).toBeFocused();
  });

  test("answers 429 with the server's words and retries with the same key", async ({ page }) => {
    const mock = await mockWorkbenchApi(page, {
      post: (n) =>
        n === 1
          ? { status: 429, body: { detail: "Đang có nhiều lượt chạy, bạn thử lại sau ít phút." } }
          : undefined,
    });
    await page.goto(L1);
    await page.getByRole("button", { name: "Mở ca" }).click();
    const busy = page.getByRole("alert").filter({ hasText: "Máy chủ đang bận" });
    await expect(busy).toBeFocused();
    await expect(busy).toContainText("Đang có nhiều lượt chạy, bạn thử lại sau ít phút.");
    await expect(busy).not.toContainText("giây");

    await busy.getByRole("button", { name: "Thử lại" }).click();
    await expect(page.getByRole("heading", { name: "Kết quả ca tối nay" })).toBeFocused();
    expect(mock.posts).toHaveLength(2);
    expect(mock.posts[1]?.key).toBe(mock.posts[0]?.key);
    expect(mock.posts[1]?.body).toBe(mock.posts[0]?.body);

    await page.getByRole("button", { name: "Chỉnh rồi chạy lại" }).click();
    await page.getByRole("switch", { name: "Gắn Vòm Sao" }).check();
    await page.getByRole("slider", { name: /Móc kéo/ }).fill("4");
    await expect(page.getByText("Kết quả của cấu hình trước khi bạn chỉnh.")).toBeVisible();
    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect.poll(() => mock.posts.length).toBe(3);
    expect(mock.posts[2]?.key).not.toBe(mock.posts[0]?.key);
  });

  test("reconnects with Last-Event-ID and never counts an event twice", async ({ page }) => {
    const frames = parseSse(sse.short());
    const cut = 9;
    let release: () => void = () => undefined;
    const seen = new Promise<void>((resolve) => {
      release = resolve;
    });
    const server = await sseServer((n, response) => {
      response.writeHead(200, SSE_HEADERS);
      if (n === 1) return response.end(`retry: 1000\n\n${sseText(frames.slice(0, cut))}`);
      void seen.then(() => response.end(sseText(frames)));
    });
    try {
      await mockWorkbenchApi(page);
      await server.attach(page);
      await page.goto(L1);
      await page.getByRole("button", { name: "Mở ca" }).click();
      await expect(page.getByText("Mất kết nối, đang nối lại…")).toBeVisible();
      release();

      await expect(page.getByRole("heading", { name: "Kết quả ca tối nay" })).toBeVisible();
      expect(server.lastEventIds).toEqual([null, String(cut)]);
      await expect(page.locator("#cau-1")).toContainText(`${fmt(1180 + 150)} token`);
      await expect(page.locator("#cau-2")).toContainText(`${fmt(1020 + 40)} token`);
    } finally {
      release();
      server.close();
    }
  });

  test("follows a lost run again from a full replay, counting nothing twice", async ({ page }) => {
    const frames = parseSse(sse.short());
    const cut = 9;
    const server = await sseServer((n, response) => {
      if (n === 2) return response.writeHead(404).end();
      response.writeHead(200, SSE_HEADERS);
      response.end(n === 1 ? `retry: 300\n\n${sseText(frames.slice(0, cut))}` : sseText(frames));
    });
    try {
      await mockWorkbenchApi(page);
      await server.attach(page);
      await page.goto(L1);
      await page.getByRole("button", { name: "Mở ca" }).click();
      const lost = page
        .getByRole("alert")
        .filter({ hasText: "Không theo dõi được lượt chạy nữa." });
      await expect(lost).toBeFocused();
      await lost.getByRole("button", { name: "Thử nối lại" }).click();

      await expect(page.getByRole("heading", { name: "Kết quả ca tối nay" })).toBeFocused();
      expect(server.lastEventIds).toEqual([null, String(cut), null]);
      await expect(page.locator("article[id^='cau-']")).toHaveCount(2);
      await expect(page.locator("#cau-1")).toContainText(`${fmt(1180 + 150)} token`);
      await expect(page.locator("#cau-2")).toContainText(`${fmt(1020 + 40)} token`);
    } finally {
      server.close();
    }
  });

  test("stops a run on request, and cancels a run the player walks away from", async ({ page }) => {
    let cancelled: () => void = () => undefined;
    const cancelSeen = new Promise<void>((resolve) => {
      cancelled = resolve;
    });
    let failFirst: () => void = () => undefined;
    const firstHeld = new Promise<void>((resolve) => {
      failFirst = resolve;
    });
    const frames = parseSse(sse.short());
    const started = frames.slice(0, 2);
    const stop = (id: number) => [
      {
        id,
        event: "step.finished",
        data: JSON.stringify({
          type: "step.finished",
          run: runId(1),
          case: "lib-l1-v01",
          node: "q",
          block: "input",
          status: "cancelled",
          summary: "Bước này bị huỷ.",
          tokens: { in: 0, out: 0 },
          ms: 3,
          facts: [],
        }),
      },
      {
        id: id + 1,
        event: "run.failed",
        data: JSON.stringify({
          type: "run.failed",
          run: runId(1),
          code: "cancelled",
          message_vi: "Lượt chạy bị dừng giữa chừng. Bạn thử chạy lại nhé.",
        }),
      },
    ];
    const mock = await mockWorkbenchApi(page, {
      events: async (n) => {
        if (n === 1) {
          await cancelSeen;
          return sseText([...started, ...stop(3)]);
        }
        return `retry: 60000\n\n${sseText(frames.slice(0, 1))}`;
      },
      cancel: async (n) => {
        if (n === 1) {
          await firstHeld;
          return 500;
        }
        cancelled();
        return 202;
      },
    });

    await page.goto(L1);
    await page.getByRole("button", { name: "Mở ca" }).click();
    const stopButton = page.getByRole("button", { name: "Dừng ca" });
    await stopButton.click();
    await expect(
      page.getByText("Dừng lượt chạy này? Các câu đã gọi AI vẫn bị tính."),
    ).toBeFocused();
    await page.getByRole("button", { name: "Chạy tiếp" }).click();
    await expect(stopButton).toBeFocused();
    await stopButton.click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Chạy tiếp" })).toHaveCount(0);
    await expect(stopButton).toBeFocused();
    await stopButton.click();
    await page.getByRole("button", { name: "Dừng lượt chạy" }).click();
    await expect(page.getByText("Đang dừng lượt chạy…")).toBeVisible();
    failFirst();
    await expect(page.getByText("Chưa dừng được lượt chạy. Bấm Dừng ca lần nữa.")).toBeVisible();
    await expect(stopButton).toBeFocused();
    await stopButton.click();
    await page.getByRole("button", { name: "Dừng lượt chạy" }).click();
    const stopped = page.getByRole("status").filter({ hasText: "Đã dừng lượt chạy" });
    await expect(stopped).toBeFocused();
    await expect(stopped).toContainText("Bạn đã dừng lượt chạy. Các câu đã chấm vẫn ở bảng câu.");
    expect(mock.cancels).toEqual([runId(1), runId(1)]);
    await expect(stopped.getByRole("button", { name: "Chạy lại" })).toBeVisible();
    await expect(page.getByRole("switch", { name: "Gắn Vòm Sao" })).toBeEnabled();
    await expect(page.getByText("Cấu hình này giống hệt lượt vừa rồi")).toHaveCount(0);

    const restore = page.getByRole("button", { name: "Khôi phục cấu hình khởi đầu" });
    await restore.click();
    await expect(
      page.getByText("Cấu hình hiện tại sẽ được thay bằng cấu hình khởi đầu của màn."),
    ).toBeFocused();
    await page.getByRole("button", { name: "Giữ cấu hình" }).click();
    await expect(restore).toBeFocused();
    await restore.click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Giữ cấu hình" })).toHaveCount(0);
    await expect(restore).toBeFocused();

    await stopped.getByRole("button", { name: "Chạy lại" }).click();
    await expect(page.getByText("Bàn thợ khóa trong lúc chạy.")).toBeVisible();
    await expect(page.getByRole("button", { name: /^#1 · Câu mẫu/ })).toBeVisible();
    await page.getByRole("banner").getByRole("link", { name: "Về danh sách màn" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Thư viện" })).toBeVisible();
    await expect.poll(() => mock.cancels).toEqual([runId(1), runId(1), runId(2)]);
  });

  test("cancels a run whose start answers after the player left", async ({ page }) => {
    let release: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const mock = await mockWorkbenchApi(page, {
      post: async () => {
        await held;
        return undefined;
      },
    });
    await page.goto(L1);
    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect.poll(() => mock.posts.length).toBe(1);
    await page.getByRole("banner").getByRole("link", { name: "Về danh sách màn" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Thư viện" })).toBeVisible();
    release();
    await expect.poll(() => mock.cancels).toEqual([runId(1)]);
    expect(mock.streams).toBe(0);
  });

  test("recovers from a lost stream when the new run cannot start", async ({ page }) => {
    const mock = await mockWorkbenchApi(page, {
      post: (n) =>
        n === 3
          ? { status: 503, body: { detail: "Chỉ mục chưa dựng xong.", code: "index_missing" } }
          : undefined,
    });
    await page.route("**/api/runs/*/events", (route) =>
      route.fulfill({ status: 404, json: { detail: "Không tìm thấy lượt chạy." } }),
    );
    await page.goto(L1);
    await page.getByRole("button", { name: "Mở ca" }).click();
    const lost = page.getByRole("alert").filter({ hasText: "Không theo dõi được lượt chạy nữa." });
    await expect(lost).toBeFocused();
    await lost.getByRole("button", { name: "Chỉnh cấu hình" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Bàn thợ" })).toBeFocused();
    await expect(page.getByRole("switch", { name: "Gắn Vòm Sao" })).toBeEnabled();
    expect(mock.posts).toHaveLength(1);
    await expect.poll(() => mock.cancels).toEqual([runId(1)]);

    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect(lost).toBeFocused();
    await expect(lost).toContainText("Chạy lại sẽ hủy lượt này và mở ca mới");
    await lost.getByRole("button", { name: "Thử nối lại" }).click();
    await expect(lost).toBeFocused();

    await lost.getByRole("button", { name: "Chạy lại" }).click();
    const notReady = page.getByRole("alert").filter({ hasText: "Máy chủ chưa sẵn sàng chạy" });
    await expect(notReady).toBeFocused();
    await expect(notReady).toContainText("Chỉ mục chưa dựng xong.");
    expect(mock.cancels).toEqual([runId(1), runId(2)]);
    expect(mock.posts).toHaveLength(3);
    await expect(page.getByRole("switch", { name: "Gắn Vòm Sao" })).toBeEnabled();
  });

  test("groups cô Lan's diagnosis by lesson and points at the knob to turn", async ({ page }) => {
    const diagnosis = [
      {
        case: "lib-l1-v01",
        flag: "ret.gold_rank:vector_search",
        message_vi: "Đoạn đúng của câu #1 đứng hạng 4 ở Vòm Sao, mà Móc kéo chỉ kéo 3 sao.",
      },
      {
        case: "lib-l1-t01",
        flag: "ret.gold_rank:vector_search",
        message_vi: "Đoạn đúng của câu #2 đứng hạng 6 ở Vòm Sao, mà Móc kéo chỉ kéo 3 sao.",
      },
    ];
    await mockWorkbenchApi(page, {
      events: () =>
        sse.short().replace('"diagnosis":[]', `"diagnosis":${JSON.stringify(diagnosis)}`),
    });
    await page.goto(L1);
    await page.getByRole("switch", { name: "Gắn Vòm Sao" }).check();
    await page.getByRole("button", { name: "Mở ca" }).click();

    const lessons = page.getByRole("list", { name: "Cô Lan chẩn đoán" });
    await expect(lessons.getByRole("listitem")).toHaveCount(1);
    await expect(lessons).toContainText("câu #1 đứng hạng 4");
    await expect(lessons).not.toContainText("hạng 6");
    await expect(lessons.getByRole("link", { name: "câu #2" })).toHaveAttribute("href", "#cau-2");
    await lessons.getByRole("button", { name: "Xem ở Vòm Sao" }).click();
    await expect(page.getByRole("slider", { name: /Móc kéo/ })).toBeFocused();
  });

  test("comes back to the diagnosis after 'Xem câu', with focus left alone", async ({ page }) => {
    const diagnosis = [
      { case: "lib-l1-v01", flag: "llm.cite_missing", message_vi: "Câu #1 không trích nguồn." },
    ];
    await mockWorkbenchApi(page, {
      events: () =>
        sse.reference().replace('"diagnosis": []', `"diagnosis":${JSON.stringify(diagnosis)}`),
    });
    await page.goto("/play/library");
    await page.getByRole("link", { name: "Vào màn Thôi bịa điều luật" }).click();
    const title = page.getByRole("heading", { level: 1, name: "Thôi bịa điều luật" });
    await expect(title).toBeFocused();
    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect(page.getByRole("heading", { name: "Kết quả ca tối nay" })).toBeFocused();

    const link = page.getByRole("link", { name: "Xem câu #1" });
    await link.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(100);
    await link.click();
    await expect(page).toHaveURL(/#cau-1$/);
    await page.goBack();
    await expect(page).toHaveURL(/grounded-citation$/);
    await expect
      .poll(() => page.evaluate((y) => Math.abs(window.scrollY - y), before))
      .toBeLessThan(5);
    await expect(title).not.toBeFocused();
  });

  test("says a level is loading, then moves focus to it, also after a failed load", async ({
    page,
  }) => {
    await mockWorkbenchApi(page);
    let release: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    let releaseRetry: () => void = () => undefined;
    const retryHeld = new Promise<void>((resolve) => {
      releaseRetry = resolve;
    });
    let loads = 0;
    await page.route("**/api/levels/*", async (route) => {
      loads += 1;
      if (loads === 1) {
        await held;
        return route.fulfill({ status: 500, json: { detail: "Lỗi" } });
      }
      await retryHeld;
      return route.fallback();
    });
    await page.goto("/play/library");
    await page.getByRole("link", { name: "Vào màn Thôi bịa điều luật" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Đang tải trang…" })).toBeAttached();
    await expect(page.getByRole("main")).toHaveAttribute("aria-busy", "true");
    release();

    const retry = page.getByRole("button", { name: "Thử lại" });
    await expect(
      page.getByRole("heading", { level: 1, name: "Chưa tải được màn này." }),
    ).toBeFocused();
    await expect(page.getByRole("main")).not.toHaveAttribute("aria-busy", "true");
    await retry.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status").filter({ hasText: "Đang tải trang…" })).toBeAttached();
    await expect(page.getByRole("main")).toHaveAttribute("aria-busy", "true");
    releaseRetry();
    await expect(page.getByRole("heading", { level: 1, name: "Thôi bịa điều luật" })).toBeFocused();
  });

  test("sends an L3 dense-only rank lesson to the keyword drawer, not to a hook at its limit", async ({
    page,
  }) => {
    const diagnosis = [
      {
        case: "lib-l1-v01",
        flag: "ret.gold_rank:vector_search",
        message_vi:
          "Đoạn Điều 47 khoản 2 đứng hạng 9 ở Vòm Sao. Điều 12 và Điều 30 chiếm chỗ trên nó.",
      },
    ];
    const note = "Xếp hạng lại giữ 3/3 đoạn nên không đổi thứ tự, nhưng vẫn tốn thời gian.";
    await mockWorkbenchApi(page, {
      post: (n) => ({
        status: 202,
        body: {
          run_id: runId(n),
          created: true,
          issues: [
            { code: "W_RERANK_NOOP", severity: "info", node: "rr", port: null, message_vi: note },
          ],
        },
      }),
      events: () =>
        sse.short().replace('"diagnosis":[]', `"diagnosis":${JSON.stringify(diagnosis)}`),
    });
    await page.goto(L3);
    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect(page.getByRole("heading", { name: "Kết quả ca tối nay" })).toBeFocused();
    await expect(page.getByText(note)).toBeVisible();

    const lessons = page.getByRole("list", { name: "Cô Lan chẩn đoán" });
    await lessons.getByRole("button", { name: "Thử gắn Tủ ngăn kéo" }).click();
    const drawer = page.getByRole("switch", { name: "Gắn Tủ ngăn kéo" });
    await expect(drawer).toBeFocused();
    await drawer.check();
    await expect(page.getByText(note)).toHaveCount(0);
  });

  test("keeps 'Đang chạy ca' on a 375 px screen once the run has started", async ({ page }) => {
    let release: () => void = () => undefined;
    const focused = new Promise<void>((resolve) => {
      release = resolve;
    });
    const frames = parseSse(sse.reference());
    const started = frames.slice(
      0,
      frames.findIndex((frame) => frame.event === "run.scored"),
    );
    await mockWorkbenchApi(page, {
      events: async () => {
        await focused;
        return `retry: 60000\n\n${sseText(started)}`;
      },
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(L1);
    await page.getByRole("button", { name: "Mở ca" }).click();
    const running = page.getByRole("heading", { level: 2, name: "Đang chạy ca" });
    await expect(running).toBeFocused();
    await expect(running).toBeInViewport({ ratio: 1 });
    release();
    await expect(page.getByRole("button", { name: /^#1 · Câu mẫu/ })).toBeVisible();
    await expect(running).toBeInViewport({ ratio: 1 });
    await expect(page.getByText("10/10 câu đã chấm")).toBeInViewport();
  });

  test("keeps 375 px free of sideways scroll with the JSON and the run numbers open", async ({
    page,
  }) => {
    await mockWorkbenchApi(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(L1);
    const overflow = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
    await page.getByText("Xem cấu hình JSON").click();
    expect(await overflow()).toBeLessThanOrEqual(0);

    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect(page.getByRole("heading", { name: "Kết quả ca tối nay" })).toBeFocused();
    const closed = page.locator("details:not([open]) > summary");
    while ((await closed.count()) > 0) await closed.first().click();
    expect(await overflow()).toBeLessThanOrEqual(0);
    await page.getByRole("link", { name: "Đổi câu ở bảng câu" }).click();
    await expect(page.getByRole("heading", { name: "Bảng câu" })).toBeInViewport();
  });

  test("comes back to the diagnosis after 'Xem câu' on a level opened by its own link", async ({
    page,
  }) => {
    const diagnosis = [
      { case: "lib-l1-v01", flag: "llm.cite_missing", message_vi: "Câu #1 không trích nguồn." },
    ];
    await mockWorkbenchApi(page, {
      events: () =>
        sse.reference().replace('"diagnosis": []', `"diagnosis":${JSON.stringify(diagnosis)}`),
    });
    await page.goto(L1);
    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect(page.getByRole("heading", { name: "Kết quả ca tối nay" })).toBeFocused();
    const link = page.getByRole("link", { name: "Xem câu #1" });
    await link.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    await link.click();
    await expect(page).toHaveURL(/#cau-1$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).not.toBe(before);
    await page.goBack();
    await expect(page).toHaveURL(/grounded-citation$/);
    await expect
      .poll(() => page.evaluate((y) => Math.abs(window.scrollY - y), before))
      .toBeLessThan(5);
  });

  test("keeps 'Khôi phục' shut while the graph is being sent", async ({ page }) => {
    let release: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const mock = await mockWorkbenchApi(page, {
      post: async () => {
        await held;
        return undefined;
      },
    });
    await page.goto(L1);
    await page.getByRole("button", { name: "Khôi phục cấu hình khởi đầu" }).click();
    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect.poll(() => mock.posts.length).toBe(1);
    await expect(page.getByRole("button", { name: "Đang gửi cấu hình…" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Khôi phục", exact: true })).toBeDisabled();
    release();
    await expect(page.getByRole("heading", { level: 2, name: "Kết quả ca tối nay" })).toBeFocused();
    expect(mock.posts).toHaveLength(1);
  });

  test("drops the discarded-config notice once the bench saves again", async ({ page }) => {
    await mockWorkbenchApi(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(["vg", "bench", "v1", "grounded-citation"].join("."), "{broken");
    });
    await page.goto(L1);
    const discarded = page.getByText("Cấu hình đã lưu không còn hợp với màn này");
    await expect(discarded).toBeVisible();
    await page.getByRole("switch", { name: "Gắn Vòm Sao" }).check();
    await expect(page.getByText("Đã lưu cấu hình trên máy này.")).toBeVisible();
    await expect(discarded).toHaveCount(0);
  });

  test("shows the loading bar on screen after 'Vào màn' far down the zone page", async ({
    page,
  }) => {
    await mockWorkbenchApi(page);
    let release: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/api/levels/article-number-lookup", async (route) => {
      await held;
      return route.fallback();
    });
    await page.goto("/play/library");
    const enter = page.getByRole("link", { name: "Vào màn Hỏi bằng số điều" });
    await enter.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 2000);
    await enter.click();
    const bar = page.locator("[data-page-loading]");
    await expect(bar).toBeInViewport();
    await page.emulateMedia({ reducedMotion: "reduce" });
    const width = page.viewportSize()?.width ?? 0;
    await expect
      .poll(async () => (await bar.locator("div").boundingBox())?.width ?? 0)
      .toBeGreaterThanOrEqual(width - 1);
    release();
    await expect(page.getByRole("heading", { level: 1, name: "Hỏi bằng số điều" })).toBeFocused();
  });

  test("grades the guess slip after the run, with a surprise for a sure call gone wrong", async ({
    page,
    consoleErrors,
  }) => {
    await mockWorkbenchApi(page, { events: () => sse.short() });
    await page.goto(L1);
    await page.getByRole("switch", { name: "Gắn Vòm Sao" }).check();
    await expect(page.locator("#slot-vs [data-state]")).toHaveText("Trạng thái khối: Chưa chạy");

    const disclosure = page.locator("details", {
      has: page.locator("summary", { hasText: "Đoán trước khi mở ca" }),
    });
    await expect(disclosure).not.toHaveAttribute("open", "");
    const openSlip = () => disclosure.evaluate((d) => d.setAttribute("open", ""));
    await openSlip();
    const slip = page.getByRole("region", { name: "Đoán trước khi mở ca" });
    await slip.getByRole("group", { name: "Đạt mấy/10?" }).getByText("2", { exact: true }).click();
    const first = slip.getByRole("group", { name: "Câu #1 · Câu mẫu" });
    await first.getByText("Trượt", { exact: true }).click();
    await first.getByText("Chắc", { exact: true }).click();
    await slip.getByRole("group", { name: "Câu nào trượt?" }).getByText("#9").click();
    await page.reload();
    await openSlip();
    await expect(first.getByRole("radio", { name: "Chắc", exact: true })).toBeChecked();
    await expect(slip.getByRole("checkbox", { name: "Câu #9" })).toBeChecked();

    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Kết quả ca tối nay" })).toBeFocused();
    const result = page.getByRole("region", { name: "Phiếu đoán của bạn" });
    await expect(result).toContainText("Bạn đoán 2 câu đạt; thực tế 2/2 câu đạt. Khớp.");
    await expect(result).toContainText("Đoán sai · câu #1: bạn đoán trượt (chắc).");
    await expect(result.getByText("Bất ngờ ở câu #1")).toBeVisible();
    await expect(result).toContainText("Bạn chắc câu này sẽ trượt, nhưng nó đạt.");
    await expect(result.getByRole("link", { name: "Xem bằng chứng ở câu #1" })).toHaveAttribute(
      "href",
      "#cau-1",
    );
    await openSlip();
    await expect(slip.getByRole("radio", { name: "2", exact: true })).not.toBeChecked();
    await expect(slip.getByRole("radio", { name: "Chắc" })).toHaveCount(0);
    expect(
      await page.evaluate(() => window.localStorage.getItem("vg.guess.v1.grounded-citation")),
    ).toBeNull();

    const row = page.getByRole("region", { name: "Bảng câu" }).getByRole("button").first();
    expect(await row.evaluate((el) => getComputedStyle(el).animationName)).toBe("vg-flip");
    await expect(page.locator("[aria-live]")).toHaveCount(1);

    await expect(page.locator("#slot-vs [data-state]")).toHaveText("Trạng thái khối: Đạt");
    await page.getByRole("slider", { name: /Móc kéo/ }).fill("4");
    await expect(page.locator("#slot-vs [data-state]")).toHaveText("Trạng thái khối: Cần chạy lại");
    await expect(page.locator("#slot-out [data-state]")).toHaveText(
      "Trạng thái khối: Cần chạy lại",
    );
    expect(consoleErrors).toEqual([]);
  });

  test("asks why case #1 failed before cô Lan's diagnosis (L1 §11)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const diagnosis = [
      {
        case: "lib-l1-v01",
        flag: "llm.cite_missing",
        message_vi: "Câu #1 nói đúng ý, nhưng không chỉ ra lấy từ đâu.",
      },
    ];
    const passed =
      '"case":"lib-l1-v01","status":"ok","passed":true,"counted":true,"criteria":{"points":true,"cited":true,"no_fabrication":true,"no_forbidden":true},"labels":[]';
    const failed =
      '"case":"lib-l1-v01","status":"ok","passed":false,"counted":true,"criteria":{"points":true,"cited":false,"no_fabrication":true,"no_forbidden":true},"labels":["cite_missing"]';
    await mockWorkbenchApi(page, {
      events: () =>
        sse
          .short()
          .replace(passed, failed)
          .replace('"diagnosis":[]', `"diagnosis":${JSON.stringify(diagnosis)}`),
    });
    await page.goto(L1);
    await page.getByRole("switch", { name: "Gắn Vòm Sao" }).check();
    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect(page.getByRole("heading", { name: "Kết quả ca tối nay" })).toBeFocused();

    await expect(page.locator("#slot-out [data-state]")).toHaveText("Trạng thái khối: Lỗi");
    const row = page.getByRole("region", { name: "Bảng câu" }).getByRole("button").first();
    await expect(row).toContainText("Trượt");
    expect(await row.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");

    const menu = page.getByRole("group", { name: "Vì sao câu #1 sai?" });
    const lessons = page.getByRole("list", { name: "Cô Lan chẩn đoán" });
    await expect(menu).toBeVisible();
    await expect(lessons).toHaveCount(0);
    await menu.getByText("Các đoạn trong thùng không mang mã, nên không có gì để trích").click();
    await expect(page.getByText("Đúng lý do.")).toBeFocused();
    await expect(lessons).toContainText("không chỉ ra lấy từ đâu");
  });
});

test.describe("the cheap try (B5)", () => {
  test("Mở ca runs the samples first, then the star run on the very same graph", async ({
    page,
    consoleErrors,
  }) => {
    const mock = await mockWorkbenchApi(page, {
      events: (n) => (n === 1 ? sse.sample() : sse.reference()),
    });

    await page.goto("/play/library/grounded-citation");
    await page.getByRole("switch", { name: "Gắn Vòm Sao" }).check();
    await page.getByRole("button", { name: "Mở ca" }).click();

    await expect(page.getByRole("heading", { name: "Kết quả lượt mẫu" })).toBeVisible();
    await expect(page.getByText("3/3 câu mẫu đạt.", { exact: false })).toBeVisible();
    await expect(page.getByText("Lượt mẫu không tính sao.", { exact: false })).toBeVisible();

    await expect(page.getByRole("heading", { level: 2, name: "Kết quả ca tối nay" })).toBeFocused();
    expect(mock.posts.map((p) => p.scope)).toEqual(["mau", null]);
    expect(mock.posts[1]?.body).toBe(mock.posts[0]?.body);
    expect(mock.posts[1]?.key).not.toBe(mock.posts[0]?.key);
    await expect(
      page.getByText(`${referenceFacts().score.stars}/3 sao`, { exact: true }),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("holds the star run back when a sample case failed, and spends nothing more", async ({
    page,
  }) => {
    const mock = await mockWorkbenchApi(page, { events: () => sse.sample(false) });

    await page.goto("/play/library/grounded-citation");
    await page.getByRole("button", { name: "Mở ca" }).click();

    const summary = page.getByRole("heading", { name: "Kết quả lượt mẫu" });
    await expect(summary).toBeFocused();
    await expect(page.getByText("0/3 câu mẫu đạt.", { exact: false })).toBeVisible();
    await expect(
      page.getByText("Run chấm sao chỉ mở khi cả 3 câu mẫu đạt.", { exact: false }),
    ).toBeVisible();

    expect(mock.posts.map((p) => p.scope)).toEqual(["mau"]);
    await expect(page.getByRole("heading", { name: "Kết quả ca tối nay" })).toBeHidden();
  });

  test("plays the recorded run with the API down", async ({ page }) => {
    await mockWorkbenchApi(page, {
      post: () => ({ status: 503, body: { detail: "Máy chủ đang ngủ." } }),
    });

    await page.goto("/play/library/grounded-citation");
    await page.getByRole("button", { name: "Xem lượt đã ghi" }).click();

    await expect(page.getByRole("heading", { level: 2, name: "Kết quả ca tối nay" })).toBeVisible();
    await expect(page.getByText("Lượt chạy đã ghi", { exact: false })).toBeVisible();
    await expect(page.locator("article[id^='cau-']")).toHaveCount(10);

    const kept = await page.evaluate(() => ({
      progress: window.localStorage.getItem("vg-progress-v1"),
      history: window.localStorage.getItem("vg.history.v1.grounded-citation"),
    }));
    expect(kept.progress).toBeNull();
    expect(kept.history).toBeNull();
  });

  test("walks the recorded run case by case with the scrub bar", async ({ page }) => {
    await mockWorkbenchApi(page);
    await page.goto("/play/library/grounded-citation");
    await page.getByRole("button", { name: "Xem lượt đã ghi" }).click();

    await expect(page.getByText("Câu #1/10")).toBeVisible();
    await page.getByRole("button", { name: "Tới câu sau" }).click();
    await expect(page.getByText("Câu #2/10")).toBeVisible();
    await page.getByRole("slider", { name: "Tua qua từng câu của lượt này" }).fill("7");
    await expect(page.getByText("Câu #7/10")).toBeVisible();
  });
});

test.describe("the blade's own strip (B6 N22)", () => {
  const L2 = "/play/library/chunk-tuning";

  const strip = (page: Page, dieu: number) =>
    page.getByRole("figure").filter({ hasText: `Dải đoạn Điều ${dieu}` });

  const asTable = async (figure: ReturnType<typeof strip>) => {
    const toTable = figure.getByRole("button", { name: "Xem dạng bảng" });
    if (await toTable.isVisible()) await toTable.click();
    return figure.getByRole("table");
  };

  test("draws the favoured article's real cuts, and follows the blade", async ({
    page,
    consoleErrors,
  }) => {
    await mockWorkbenchApi(page);
    await page.goto(L2);

    await expect(strip(page, 10)).toBeVisible();
    await expect(strip(page, 10)).toContainText("văn bản hết hiệu lực");
    const torn = await asTable(strip(page, 10));
    await expect(torn).toContainText("«");
    await expect(torn.getByRole("row")).toHaveCount(4);

    const pick = (group: RegExp, option: string) =>
      page.getByRole("group", { name: group }).getByText(option, { exact: true }).click();
    await pick(/Cách chia/, "Bám điều, khoản");
    const blade = page.getByRole("slider", { name: /Cỡ đoạn/ });
    await blade.focus();
    await blade.press("Home");
    await blade.press("ArrowRight");
    await blade.press("ArrowRight");
    await expect(blade).toHaveAttribute("aria-valuetext", "512 token");
    await pick(/Chồng lấp/, "10 %");
    await expect(strip(page, 12)).toBeVisible();
    await expect(strip(page, 12)).not.toContainText("văn bản hết hiệu lực");
    const whole = await asTable(strip(page, 12));
    await expect(whole.getByRole("row")).toHaveCount(2);
    await expect(whole).not.toContainText("«");
    await expect(whole).toContainText("Không");

    await expect(page.getByText("Tính sẵn từ chỉ mục", { exact: false }).first()).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("keeps the level usable when the static data is not there", async ({ page }) => {
    await mockWorkbenchApi(page);
    await page.route("**/viz/*.json", (route) => route.fulfill({ status: 404, body: "" }));
    await page.goto(L2);

    await expect(page.getByRole("button", { name: "Mở ca" })).toBeVisible();
    await expect(page.getByRole("figure").filter({ hasText: "Dải đoạn" })).toHaveCount(0);
  });
});
