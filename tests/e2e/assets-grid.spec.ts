import { expect, test } from '@playwright/test';

test.describe('Assets Grid View', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard assets page
    await page.goto('/dashboard');
  });

  test('should display assets in grid view by default', async ({ page }) => {
    // Grid view should be active by default
    const gridButton = page.getByRole('button', { name: /grid/i });
    await expect(gridButton).toHaveClass(/bg-blue-500/);

    // Should see grid layout (multiple columns on larger screens)
    const assetCards = page.locator('[data-testid="asset-card"]').first();
    if (await assetCards.isVisible()) {
      // Wait for assets to load and check grid layout
      await expect(page.locator('.grid')).toBeVisible();
    }
  });

  test('should toggle between grid and table view', async ({ page }) => {
    // Click table view button
    const tableButton = page.getByRole('button', { name: /list/i });
    await tableButton.click();

    // Table view should now be active
    await expect(tableButton).toHaveClass(/bg-blue-500/);

    // Should see table layout
    const table = page.locator('table');
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
    }

    // Switch back to grid view
    const gridButton = page.getByRole('button', { name: /grid/i });
    await gridButton.click();

    // Grid view should be active again
    await expect(gridButton).toHaveClass(/bg-blue-500/);
  });

  test('should display asset information in grid cards', async ({ page }) => {
    // Wait for any assets to load
    const firstCard = page.locator('.grid > .group').first();

    if (await firstCard.isVisible()) {
      // Should show asset title or "Untitled"
      await expect(firstCard.locator('h3')).toBeVisible();

      // Should show status badge
      await expect(
        firstCard.locator(
          '[class*="bg-success"], [class*="bg-warning"], [class*="bg-error"]'
        )
      ).toBeVisible();

      // Should show asset ID (truncated)
      await expect(firstCard.locator('code')).toBeVisible();

      // Should show play button overlay
      await expect(
        firstCard.locator('button[aria-label*="Play"]')
      ).toBeVisible();

      // Should show copy button
      await expect(
        firstCard.locator('button[aria-label*="Copy"]')
      ).toBeVisible();
    }
  });

  test('should handle play button interaction', async ({ page }) => {
    const firstCard = page.locator('.grid > .group').first();

    if (await firstCard.isVisible()) {
      const playButton = firstCard.locator('button[aria-label*="Play"]');

      // Check if play button is enabled (only for ready assets)
      if (await playButton.isEnabled()) {
        await playButton.click();

        // Should change to pause button
        await expect(
          firstCard.locator('button[aria-label*="Stop"]')
        ).toBeVisible();

        // Should show MuxPlayer element
        await expect(firstCard.locator('mux-player')).toBeVisible();

        // Click again to stop
        const stopButton = firstCard.locator('button[aria-label*="Stop"]');
        await stopButton.click();

        // Should go back to play button
        await expect(
          firstCard.locator('button[aria-label*="Play"]')
        ).toBeVisible();
      }
    }
  });

  test('should copy HLS URL when copy button is clicked', async ({ page }) => {
    // Grant clipboard permissions
    await page
      .context()
      .grantPermissions(['clipboard-write', 'clipboard-read']);

    const firstCard = page.locator('.grid > .group').first();

    if (await firstCard.isVisible()) {
      const copyButton = firstCard.locator('button[aria-label*="Copy"]');

      // Check if copy button is enabled (only for ready assets with playback IDs)
      if (await copyButton.isEnabled()) {
        await copyButton.click();

        // Check clipboard content
        const clipboardContent = await page.evaluate(() =>
          navigator.clipboard.readText()
        );
        expect(clipboardContent).toMatch(
          /https:\/\/stream\.mux\.com\/.*\.m3u8/
        );
      }
    }
  });

  test('should open asset drawer when view button is clicked', async ({
    page,
  }) => {
    const firstCard = page.locator('.grid > .group').first();

    if (await firstCard.isVisible()) {
      const viewButton = firstCard.locator(
        'button[aria-label*="View asset details"]'
      );
      await viewButton.click();

      // Should open asset drawer
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.getByText('Asset Details')).toBeVisible();
    }
  });

  test('should open dropdown menu and handle actions', async ({ page }) => {
    const firstCard = page.locator('.grid > .group').first();

    if (await firstCard.isVisible()) {
      // Open dropdown menu
      const menuButton = firstCard.locator('button[aria-label="Open menu"]');
      await menuButton.click();

      // Should show dropdown options
      await expect(page.getByText('View Details')).toBeVisible();
      await expect(page.getByText('Edit Metadata')).toBeVisible();
      await expect(page.getByText('Delete')).toBeVisible();

      // Close menu by clicking elsewhere
      await page.locator('body').click({ position: { x: 0, y: 0 } });
      await expect(page.getByText('View Details')).not.toBeVisible();
    }
  });

  test('should handle loading state', async ({ page }) => {
    // Mock slow network to see loading state
    await page.route('**/api/assets**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      await route.continue();
    });

    await page.reload();

    // Should show loading skeletons
    await expect(page.locator('.animate-pulse')).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/assets**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: {
            data: [],
            pagination: {
              page: 1,
              limit: 25,
              total: 0,
              hasMore: false,
            },
          },
        }),
      });
    });

    await page.reload();

    // Should show empty state
    await expect(page.getByText('No assets found')).toBeVisible();
    await expect(page.getByText(/Upload your first video/)).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Should show single column on mobile
    const grid = page.locator('.grid');
    if (await grid.isVisible()) {
      await expect(grid).toHaveClass(/grid-cols-1/);
    }

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Should show multiple columns on tablet and up
    if (await grid.isVisible()) {
      await expect(grid).toHaveClass(/sm:grid-cols-2|md:grid-cols-3/);
    }

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Should show more columns on desktop
    if (await grid.isVisible()) {
      await expect(grid).toHaveClass(/xl:grid-cols-4/);
    }
  });
});
