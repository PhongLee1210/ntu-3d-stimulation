import { expect, mockApi, test, zoneList } from "./fixtures";

test.describe("QA regressions", () => {
  test("a viewer with a saved non-default theme loads pages without a hydration error", async ({
    page,
    consoleErrors,
  }) => {
    await mockApi(page);
    await page.addInitScript(() => window.localStorage.setItem("vg-theme", "town"));
    for (const path of ["/", "/play", "/play/library"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "town");
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await expect(page.locator("html")).not.toHaveClass(/vg-theme-loading/);
    }
    expect(consoleErrors).toEqual([]);
  });

  test("retrying the zone list keeps focus inside the open panel", async ({ page }) => {
    let fail = true;
    await mockApi(page, {
      list: () => (fail ? { status: 500 } : { status: 200, body: zoneList() }),
    });
    await page.goto("/play");
    await page.getByRole("button", { name: "Các khu" }).click();
    await page.getByRole("button", { name: "Thử lại" }).focus();
    fail = false;
    await page.keyboard.press("Enter");
    await expect(page.getByRole("link", { name: "Vào Thư viện" })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.getElementById("hub-zone-list")?.contains(document.activeElement) ?? false,
      ),
    ).toBe(true);
  });

  test("a focus ring shows in its own colour at once, without fading in", async ({ page }) => {
    await mockApi(page);
    await page.goto("/play/library");
    const back = page.getByRole("banner").getByRole("link").first();
    await back.focus();
    expect(await back.evaluate((el) => getComputedStyle(el).transitionProperty)).not.toMatch(
      /outline/,
    );
  });
});
