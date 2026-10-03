import { expect, test } from "@playwright/test";

test("publish preserves local destination and stays open throughout sharing", async ({ page }) => {
	await page.goto("/tests/ui/publish.html");
	await page.getByRole("button", { name: "Publish", exact: true }).click();
	await page.getByRole("row", { name: "Local", exact: true }).click();
	await expect(page.getByRole("button", { name: "Export Video", exact: true })).toBeVisible();
	await page.reload();
	await page.getByRole("button", { name: "Publish", exact: true }).click();
	await expect(page.getByRole("row", { name: "Local", exact: true })).toHaveAttribute(
		"aria-selected",
		"true",
	);
	await page.getByRole("row", { name: "Link", exact: true }).click();
	await page.getByRole("button", { name: "Share", exact: true }).click();
	await expect(page.getByText(/Uploading ·/)).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByText(/Uploading ·/)).toBeVisible();
	await expect(page.getByRole("row", { name: "Local", exact: true })).toHaveAttribute(
		"aria-disabled",
		"true",
	);
	await expect(page.getByRole("button", { name: "Copy link", exact: true })).toBeVisible({
		timeout: 20000,
	});
});

test("a full cloud quota prevents starting preparation", async ({ page }) => {
	await page.goto("/tests/ui/publish.html?full");
	await page.getByRole("button", { name: "Publish", exact: true }).click();
	await expect(
		page.getByText(
			"You have 5 cloud recordings. Delete one from Shared before sharing another.",
		),
	).toBeVisible();
	await expect(page.getByRole("button", { name: "Share", exact: true })).toBeDisabled();
});

test("shared cards open ready links and delete incomplete uploads", async ({ page }) => {
	await page.goto("/tests/ui/shared-recordings.html");
	await page.getByRole("button", { name: "Product walkthrough", exact: true }).click();
	await expect(page.getByRole("status")).toHaveText("Opened https://example.test/s/demo1");
	await expect(
		page.getByRole("button", { name: "An interrupted upload", exact: true }),
	).toBeDisabled();
	await page
		.getByRole("button", { name: "Options for An interrupted upload", exact: true })
		.click();
	page.once("dialog", (dialog) => dialog.dismiss());
	await page.getByRole("menuitem", { name: "Delete recording", exact: true }).click();
	await expect(
		page.getByRole("button", { name: "An interrupted upload", exact: true }),
	).toHaveCount(1);
	await page
		.getByRole("button", { name: "Options for An interrupted upload", exact: true })
		.click();
	page.once("dialog", (dialog) => dialog.accept());
	await page.getByRole("menuitem", { name: "Delete recording", exact: true }).click();
	await expect(
		page.getByRole("button", { name: "An interrupted upload", exact: true }),
	).toHaveCount(0);
	await page.getByRole("textbox", { name: "Search projects" }).fill("missing");
	await expect(page.getByText("No matching projects", { exact: true })).toBeVisible();
});

test("switching accounts clears the previous account's cloud quota", async ({ page }) => {
	await page.goto("/tests/ui/publish.html?full&switch");
	await page.getByRole("button", { name: "Publish", exact: true }).click();
	await expect(
		page.getByText(
			"You have 5 cloud recordings. Delete one from Shared before sharing another.",
		),
	).toBeVisible();
	await page
		.getByRole("button", { name: "Fixture sign out", exact: true })
		.evaluate((button: HTMLButtonElement) => button.click());
	await expect(
		page.getByText(
			"You have 5 cloud recordings. Delete one from Shared before sharing another.",
		),
	).toHaveCount(0);
	await page
		.getByRole("button", { name: "Fixture switch account", exact: true })
		.evaluate((button: HTMLButtonElement) => button.click());
	await expect(page.getByRole("button", { name: "Share", exact: true })).toBeEnabled();
});
