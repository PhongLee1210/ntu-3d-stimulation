import { readText } from "../app/features/workbench/test-fixtures";
import { expect, mockWorkbenchApi, test } from "./fixtures";

const W1 = "/play/watchtower/direct-injection";
const stream = (name: "starter" | "reference") => readText("e2e", "data", `run-w1-${name}.sse`);

test.describe("watchtower W1", () => {
  test("is reached from the zone page, where the levels still coming have no way in", async ({
    page,
    consoleErrors,
  }) => {
    await mockWorkbenchApi(page, { events: () => stream("starter") });
    await page.goto("/play/watchtower");
    const coming = page.locator('[data-level-status="coming_soon"]');
    await expect(coming).toHaveCount(2);
    await expect(coming.getByRole("link")).toHaveCount(0);
    await page.getByRole("link", { name: "Vào màn Cổng thành" }).click();
    await expect(page).toHaveURL(W1);
    await expect(page.locator("[data-scene-total]")).toHaveText(/HOÀN TIỀN 5\.000\.000 đ/);
    expect(consoleErrors).toEqual([]);
  });

  test("builds the desk's fences with the toys and reads the ledger of a run", async ({
    page,
    consoleErrors,
  }) => {
    await mockWorkbenchApi(page, { events: () => stream("starter") });
    await page.goto(W1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("[data-scene-total]")).toHaveText(/HOÀN TIỀN 5\.000\.000 đ/);

    const branch = page.locator("[data-pipe-branch]");
    await expect(branch).toHaveCount(2);
    for (const pipe of await branch.all())
      await expect(pipe).toHaveAttribute("data-pipe", "unguarded");

    await page.getByRole("switch", { name: "Gắn Lưới cụm từ" }).check();
    const phrase = page.getByRole("button", { name: "quản trị viên", exact: true });
    await phrase.click();
    await expect(phrase).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-gauge-phrase]")).toHaveCount(1);

    await page.getByRole("button", { name: "Gắn Chuông duyệt" }).click();
    for (const pipe of await branch.all()) await expect(pipe).toHaveAttribute("data-pipe", "gated");

    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Kết quả ca tối nay" })).toBeFocused();
    await expect(page.getByText("0/3 sao", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Anh Quân chẩn đoán" })).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("hears anh Quân's win line after a three-star run", async ({ page, consoleErrors }) => {
    await mockWorkbenchApi(page, { events: () => stream("reference") });
    await page.goto(W1);
    await page.getByRole("button", { name: "Mở ca" }).click();
    await expect(page.getByText("3/3 sao", { exact: true })).toBeVisible();
    await expect(page.getByText(/Không chặn nhầm ai, không hỏi thừa ai/)).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});
