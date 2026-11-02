import AxeBuilder from "@axe-core/playwright";

import { frame, sseText } from "../app/features/workbench/test-fixtures";

import { expect, mockWorkbenchApi, sse, test } from "./fixtures";

const L1 = "/play/library/grounded-citation";

test("opens hint 1 on request and hint 2 only after a free look", async ({
  page,
  consoleErrors,
}) => {
  await mockWorkbenchApi(page, { events: () => sse.sample(false) });
  await page.goto(L1);
  await page.getByRole("button", { name: "Mở ca" }).click();
  await expect(page.getByRole("heading", { name: "Kết quả lượt mẫu" })).toBeVisible();

  const hints = page.getByRole("region", { name: "Gợi ý" });
  await expect(hints.getByText("Gợi ý nhắm vào sao 1.", { exact: false })).toBeVisible();
  await hints.getByRole("button", { name: "Xem gợi ý 1" }).click();
  await expect(hints.getByText("câu #1", { exact: false }).first()).toBeVisible();
  await expect(hints.getByRole("button", { name: "Xem gợi ý 2" })).toHaveCount(0);
  await expect(hints.getByText("Gợi ý 2 mở sau khi bạn nhìn thêm", { exact: false })).toBeVisible();

  await hints.getByRole("button", { name: "Xem câu #1" }).click();
  await expect(page.getByText("Đang theo dõi: câu #1", { exact: false })).toBeVisible();
  await hints.getByRole("button", { name: "Xem gợi ý 2" }).click();
  await expect(hints.locator('[data-hint="2"]')).toBeVisible();
  await expect(hints.getByRole("button", { name: /Xem gợi ý/ })).toHaveCount(0);

  const log = await page.evaluate(
    () =>
      (
        JSON.parse(window.localStorage.getItem("vg.hints.v1.grounded-citation") ?? "{}") as {
          log: { n: number; star: number }[];
        }
      ).log,
  );
  expect(log.map((entry) => [entry.n, entry.star])).toEqual([
    [1, 1],
    [2, 1],
  ]);
  expect(consoleErrors).toEqual([]);
});

test("says one line the first time a toy is touched, and never again", async ({ page }) => {
  await mockWorkbenchApi(page);
  await page.goto(L1);
  const dome = page.getByRole("switch", { name: "Gắn Vòm Sao" });
  await dome.check();
  const line = page.locator('[data-first-touch="vector_search"]');
  await expect(line).toBeVisible();
  await expect(line).toContainText("Vòm Sao");

  await page.reload();
  await page.getByRole("switch", { name: "Gắn Vòm Sao" }).check();
  await expect(page.locator("[data-first-touch]")).toHaveCount(0);
});

test("keeps the hints off the projector (R3)", async ({ page }) => {
  await mockWorkbenchApi(page, { events: () => sse.sample(false) });
  await page.goto(`${L1}?chieu=1`);
  await page.getByRole("button", { name: "Mở ca" }).click();
  await page.getByRole("button", { name: "Mở kết quả" }).click();
  await expect(page.getByRole("heading", { name: "Kết quả lượt mẫu" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Gợi ý" })).toBeHidden();
});

for (const viewport of [
  { width: 375, height: 812 },
  { width: 1280, height: 800 },
] as const) {
  test(`reads clean with both hints open at ${viewport.width} px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await mockWorkbenchApi(page, { events: () => sse.sample(false) });
    await page.goto(L1);
    await page.getByRole("switch", { name: "Gắn Vòm Sao" }).check();
    await page.getByRole("button", { name: "Mở ca" }).click();
    const hints = page.getByRole("region", { name: "Gợi ý" });
    await hints.getByRole("button", { name: "Xem gợi ý 1" }).click();
    await hints.getByRole("button", { name: "Xem câu #1" }).click();
    await hints.getByRole("button", { name: "Xem gợi ý 2" }).click();

    const { violations } = await new AxeBuilder({ page })
      .include("#wb-hints")
      .include("[data-first-touch]")
      .analyze();
    expect(violations.map((v) => v.id)).toEqual([]);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("opens the worked example once the pool cannot pay for another try (X28)", async ({
  page,
}) => {
  await mockWorkbenchApi(page, { events: () => sse.sample(false) });
  let asked = 0;
  await page.route(
    (url) => url.pathname === "/api/quota",
    (route) => {
      asked += 1;
      return route.fulfill({
        json: {
          cap: 500,
          used: 0,
          remaining: asked === 1 ? 500 : 2,
          resets_at: "2026-11-02T00:00:00+00:00",
          estimate: true,
          reserve_left: 17,
          learner_daily: 13,
        },
      });
    },
  );
  await page.goto(L1);
  await page.getByRole("button", { name: "Mở ca" }).click();
  await expect(page.getByRole("heading", { name: "Kết quả lượt mẫu" })).toBeVisible();
  await expect(page.getByText("Còn 2 lời gọi hôm nay", { exact: false })).toBeVisible();

  const hints = page.getByRole("region", { name: "Gợi ý" });
  await hints.getByRole("button", { name: "Xem gợi ý 1" }).click();
  await hints.getByRole("button", { name: "Xem câu #1" }).first().click();
  await hints.getByRole("button", { name: "Xem gợi ý 2" }).click();
  await expect(hints.getByText("Gợi ý 3 là lời giải mẫu.", { exact: false })).toBeVisible();
  await expect(hints.getByText("(hiện là 1)", { exact: false })).toBeVisible();

  await hints.getByRole("button", { name: "Xem câu #1" }).last().click();
  await hints.getByRole("button", { name: "Xem gợi ý 3" }).click();
  await expect(hints.locator('[data-hint="3"]')).toContainText("Gợi ý 3 · lời giải mẫu");
  await expect(hints.getByRole("button", { name: /Xem gợi ý/ })).toHaveCount(0);
});

test("keeps the worked example shut while the pool still pays for a try", async ({ page }) => {
  await mockWorkbenchApi(page, { events: () => sse.sample(false) });
  await page.goto(L1);
  await page.getByRole("button", { name: "Mở ca" }).click();
  const hints = page.getByRole("region", { name: "Gợi ý" });
  await hints.getByRole("button", { name: "Xem gợi ý 1" }).click();
  await hints.getByRole("button", { name: "Xem câu #1" }).first().click();
  await hints.getByRole("button", { name: "Xem gợi ý 2" }).click();
  await hints.getByRole("button", { name: "Xem câu #1" }).last().click();
  await expect(hints.getByRole("button", { name: "Xem gợi ý 3" })).toHaveCount(0);
  await expect(hints.getByText("Gợi ý 3 là lời giải mẫu.", { exact: false })).toBeVisible();
});

const variantRun = (passed: boolean) =>
  sseText([
    frame(1, "run.started", {
      scope: "bien_the",
      level: "grounded-citation",
      ingestion: [],
      cases: [
        {
          id: "lib-l1-r01",
          role: "review",
          vai: "su-kien",
          question: "Một lần bảo lưu được tối đa bao lâu, tổng cộng được mấy kỳ ạ?",
        },
      ],
    }),
    frame(2, "case.graded", {
      case: "lib-l1-r01",
      status: passed ? "ok" : "fail",
      passed,
      counted: true,
      criteria: {},
      labels: [],
    }),
    frame(3, "run.finished", {
      scope: "bien_the",
      report: { gold: {}, diagnosis: [] },
      models: {},
    }),
  ]);

test("runs the variant after the worked example, and keeps the ladder (N16)", async ({ page }) => {
  const mock = await mockWorkbenchApi(page, {
    events: (n) => (n === 1 ? sse.sample(false) : variantRun(true)),
  });
  let asked = 0;
  await page.route(
    (url) => url.pathname === "/api/quota",
    (route) => {
      asked += 1;
      return route.fulfill({
        json: {
          cap: 500,
          used: 0,
          remaining: asked === 1 ? 500 : 2,
          resets_at: "2026-11-02T00:00:00+00:00",
          estimate: true,
          reserve_left: 17,
          learner_daily: 13,
        },
      });
    },
  );
  await page.goto(L1);
  await page.getByRole("button", { name: "Mở ca" }).click();
  const hints = page.getByRole("region", { name: "Gợi ý" });
  await hints.getByRole("button", { name: "Xem gợi ý 1" }).click();
  await hints.getByRole("button", { name: "Xem câu #1" }).first().click();
  await hints.getByRole("button", { name: "Xem gợi ý 2" }).click();
  await hints.getByRole("button", { name: "Xem câu #1" }).last().click();
  await hints.getByRole("button", { name: "Xem gợi ý 3" }).click();

  const posted = page.waitForRequest((r) => r.url().includes("scope=bien_the"));
  await hints.getByRole("button", { name: "Chạy câu biến thể" }).click();
  expect((await posted).url()).toContain("case=lib-l1-r01");
  expect(mock.posts.map((p) => p.scope)).toEqual(["mau", "bien_the"]);

  const result = page.getByRole("heading", { name: "Kết quả câu biến thể" });
  await expect(result).toBeFocused();
  await expect(
    page.getByText("Một lần bảo lưu được tối đa bao lâu", { exact: false }).first(),
  ).toBeVisible();
  await expect(page.locator('[data-variant="passed"]')).toBeVisible();
  await expect(hints.locator('[data-hint="3"]')).toBeVisible();
  await expect(page.getByText("Còn 2 lời gọi hôm nay", { exact: false })).toBeVisible();
  const seen = await page.evaluate(() =>
    window.localStorage.getItem("vg.variants.v1.grounded-citation"),
  );
  expect(JSON.parse(seen ?? "{}")).toEqual({ "lib-l1-r01": 1 });
});
