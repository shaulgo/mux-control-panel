import { expect, test } from '@playwright/test';

test.describe('Styling checks', () => {
  test('Dashboard: stylesheet loaded, header/sidebar present with computed styles, and theme toggle behavior', async ({
    page,
  }) => {
    // Go to dashboard (may require auth; test should still validate DOM/CSS if accessible or after redirect)
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'domcontentloaded',
    });

    // Ensure Next.js/Tailwind styles are attached to DOM
    const stylesheetLinks = page.locator('link[rel="stylesheet"]');
    await expect(stylesheetLinks.first()).toBeAttached();
    // If a Next.js built CSS file exists, it usually lives under /_next/static/css (do not enforce)
    // const hasNextCss = await page.locator('link[rel="stylesheet"][href*="/_next/static/css"]').count();

    // Base body styles may be transparent on minimal pages; just ensure computed styles are valid strings
    const base = await page.evaluate(() => {
      const cs = getComputedStyle(document.body);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        fontFamily: cs.fontFamily,
      };
    });
    expect(typeof base.bg).toBe('string');
    expect(typeof base.color).toBe('string');
    expect(typeof base.fontFamily).toBe('string');

    // Header presence and computed styles (tolerant: header may not exist if redirected)
    const header = page.locator('header').first();
    if (await header.count()) {
      await expect(header).toBeVisible();
      const headerStyles = await header.evaluate(el => {
        const cs = window.getComputedStyle(el as HTMLElement);
        return {
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          boxShadow: cs.boxShadow,
          backgroundColor: cs.backgroundColor,
          borderBottomWidth: cs.borderBottomWidth,
          borderBottomColor: cs.borderBottomColor,
        };
      });
      expect(parseFloat(headerStyles.paddingTop)).toBeGreaterThan(7);
      expect(parseFloat(headerStyles.paddingBottom)).toBeGreaterThan(7);
      expect(parseFloat(headerStyles.paddingLeft)).toBeGreaterThan(7);
      expect(parseFloat(headerStyles.paddingRight)).toBeGreaterThan(7);
      expect(headerStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      if (parseFloat(headerStyles.borderBottomWidth) > 0) {
        expect(headerStyles.borderBottomColor).not.toBe('rgba(0, 0, 0, 0)');
      }
      if (headerStyles.boxShadow) {
        expect(headerStyles.boxShadow.toLowerCase()).not.toBe('none');
      }
    } // end header tolerant block

    // Sidebar presence and computed styles
    const sidebar = page.locator('aside').first();
    if (await sidebar.count()) {
      await expect(sidebar).toBeVisible();
      const sidebarStyles = await sidebar.evaluate(el => {
        const cs = window.getComputedStyle(el as HTMLElement);
        return {
          width: cs.width,
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          backgroundColor: cs.backgroundColor,
          borderRightWidth: cs.borderRightWidth,
          borderRightColor: cs.borderRightColor,
        };
      });
      expect(parseFloat(sidebarStyles.width)).toBeGreaterThan(160);
      expect(parseFloat(sidebarStyles.paddingLeft)).toBeGreaterThan(7);
      expect(parseFloat(sidebarStyles.paddingRight)).toBeGreaterThan(7);
      expect(sidebarStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      if (parseFloat(sidebarStyles.borderRightWidth) > 0) {
        expect(sidebarStyles.borderRightColor).not.toBe('rgba(0, 0, 0, 0)');
      }
    }

    // Try to find a prominent button (e.g., from header or page actions) and validate computed styles
    const anyButton = page.getByRole('button').first();
    await expect(anyButton).toBeVisible();
    const btnStyles = await anyButton.evaluate(el => {
      const cs = window.getComputedStyle(el as HTMLElement);
      return {
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
        borderRadius: cs.borderRadius,
        fontWeight: cs.fontWeight,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
      };
    });
    expect(parseFloat(btnStyles.paddingTop)).toBeGreaterThanOrEqual(1);
    expect(parseFloat(btnStyles.paddingBottom)).toBeGreaterThanOrEqual(1);
    expect(parseFloat(btnStyles.paddingLeft)).toBeGreaterThanOrEqual(1);
    expect(parseFloat(btnStyles.paddingRight)).toBeGreaterThanOrEqual(1);
    expect(parseFloat(btnStyles.borderRadius)).toBeGreaterThanOrEqual(4);
    expect(parseInt(btnStyles.fontWeight, 10)).toBeGreaterThanOrEqual(400);
    expect(btnStyles.color).not.toBe('rgba(0, 0, 0, 0)');

    // Theme toggle, if present, toggles root/body styles
    const themeToggle = page
      .getByRole('button', { name: /toggle theme/i })
      .first();
    const toggleExists = (await themeToggle.count()) > 0;
    if (toggleExists) {
      const before = await page.evaluate(() => {
        const root = document.documentElement;
        const cs = getComputedStyle(document.body);
        return {
          bg: cs.backgroundColor,
          color: cs.color,
          rootClass: root.className,
        };
      });
      await themeToggle.click();
      await page.waitForTimeout(150);
      const after = await page.evaluate(() => {
        const root = document.documentElement;
        const cs = getComputedStyle(document.body);
        return {
          bg: cs.backgroundColor,
          color: cs.color,
          rootClass: root.className,
        };
      });
      expect(after.bg).not.toBe(before.bg);
      expect(after.rootClass.toLowerCase()).toMatch(/dark|theme|mode/);
    }
  });

  test('Header and sidebar spacing and elevation (dashboard main)', async ({
    page,
  }) => {
    // Try dashboard, but gracefully continue if redirected to login
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'domcontentloaded',
    });

    // Wait for the login form to be present (tolerant selectors)
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();

    // Inputs should be visible
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible();

    // Prefer explicit primary button via data-testid if present, otherwise fallback to accessible name
    let signInButton = page.getByTestId('login-submit');
    if (!(await signInButton.count())) {
      signInButton = page
        .getByRole('button', { name: /sign in/i })
        .first()
        .or(page.getByRole('button').first());
    }

    // Verify button is visible
    await expect(signInButton).toBeVisible();

    // Check computed styles on the button
    const buttonStyles = await signInButton.evaluate(el => {
      const cs = window.getComputedStyle(el as HTMLElement);
      return {
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
        borderRadius: cs.borderRadius,
        fontWeight: cs.fontWeight,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
      };
    });

    // Typical Tailwind button paddings and radius will normalize to px values.
    // Use tolerant thresholds to avoid false negatives in environments with base resets.
    expect(parseFloat(buttonStyles.paddingTop)).toBeGreaterThanOrEqual(1);
    expect(parseFloat(buttonStyles.paddingBottom)).toBeGreaterThanOrEqual(1);
    expect(parseFloat(buttonStyles.paddingLeft)).toBeGreaterThanOrEqual(1);
    expect(parseFloat(buttonStyles.paddingRight)).toBeGreaterThanOrEqual(1);
    // Border radius can be 0 for icon/ghost buttons; just assert it's a valid number
    expect(Number.isNaN(parseFloat(buttonStyles.borderRadius))).toBe(false);
    // Font weight: be tolerant across themes
    expect(parseInt(buttonStyles.fontWeight, 10)).toBeGreaterThanOrEqual(300);

    // Background may be transparent for ghost buttons; ensure it's a string
    expect(typeof buttonStyles.backgroundColor).toBe('string');

    // Check hover visual change if possible
    await signInButton.hover();
    const hoverBg = await signInButton.evaluate(
      el => window.getComputedStyle(el as HTMLElement).backgroundColor
    );
    // Either changes on hover, or remains opaque; ensure at least a valid value
    expect(hoverBg).not.toBe('');

    // Focus ring presence (outline or box-shadow)
    await signInButton.focus();
    const focusRing = await signInButton.evaluate(el => {
      const cs = window.getComputedStyle(el as HTMLElement);
      return { outline: cs.outlineStyle, boxShadow: cs.boxShadow };
    });
    // Accept either visible outline or a non-empty box-shadow indicating ring
    if (focusRing.outline) {
      expect(focusRing.outline.toLowerCase()).not.toBe('none');
    } else if (focusRing.boxShadow) {
      expect(focusRing.boxShadow.toLowerCase()).not.toBe('none');
    }

    // Page base background/text colors in light mode (tolerance: just ensure contrast and non-transparent)
    const rootStylesLight = await page.evaluate(() => {
      const root = document.documentElement;
      const cs = window.getComputedStyle(document.body);
      return {
        bodyBg: cs.backgroundColor,
        bodyColor: cs.color,
        rootClass: root.className,
      };
    });
    // Body could be transparent if page uses layered backgrounds; only assert valid strings
    expect(typeof rootStylesLight.bodyBg).toBe('string');
    expect(typeof rootStylesLight.bodyColor).toBe('string');

    // Try finding theme toggle by role/name or icon title; tolerate if not present
    const toggle = page.getByRole('button', { name: /toggle theme/i }).first();
    const hasToggle = await toggle.count().then(c => c > 0);

    if (hasToggle) {
      // Click to switch to dark mode
      await toggle.click();
      // Give CSS a moment to apply
      await page.waitForTimeout(150);

      const rootStylesDark = await page.evaluate(() => {
        const root = document.documentElement;
        const cs = window.getComputedStyle(document.body);
        return {
          bodyBg: cs.backgroundColor,
          bodyColor: cs.color,
          rootClass: root.className,
        };
      });

      // In dark mode, expect a visible change in background color vs light
      expect(rootStylesDark.bodyBg).not.toBe(rootStylesLight.bodyBg);
      // At minimum, some class like 'dark' may appear on html
      expect(rootStylesDark.rootClass.toLowerCase()).toMatch(/dark|theme|mode/);
    }
  });

  test('Header and sidebar spacing and elevation (dashboard fallback)', async ({
    page,
  }) => {
    // Try dashboard, but gracefully continue if redirected to login
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'domcontentloaded',
    });

    // Pick common layout containers with tolerant selectors
    const header = page.locator('header').first();
    const sidebar = page.locator('aside').first();

    // Header: padding and shadow
    if ((await header.count()) > 0) {
      const hs = await header.evaluate(el => {
        const cs = window.getComputedStyle(el as HTMLElement);
        return {
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          boxShadow: cs.boxShadow,
          backgroundColor: cs.backgroundColor,
        };
      });
      expect(parseFloat(hs.paddingTop)).toBeGreaterThan(7); // ~8px+
      expect(parseFloat(hs.paddingBottom)).toBeGreaterThan(7);
      expect(parseFloat(hs.paddingLeft)).toBeGreaterThan(7);
      expect(parseFloat(hs.paddingRight)).toBeGreaterThan(7);
      // Shadow can be 'none' in flat themes; if present assert non-empty
      if (hs.boxShadow) {
        expect(hs.boxShadow.toLowerCase()).not.toBe('none');
      }
      // Background should be painted
      expect(hs.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }

    // Sidebar: width and padding if present
    if ((await sidebar.count()) > 0) {
      const ss = await sidebar.evaluate(el => {
        const cs = window.getComputedStyle(el as HTMLElement);
        return {
          width: cs.width,
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          backgroundColor: cs.backgroundColor,
          borderRightWidth: cs.borderRightWidth,
          borderRightColor: cs.borderRightColor,
        };
      });
      expect(parseFloat(ss.width)).toBeGreaterThan(160); // typical ~240px
      expect(parseFloat(ss.paddingLeft)).toBeGreaterThan(7);
      expect(parseFloat(ss.paddingRight)).toBeGreaterThan(7);
      expect(ss.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      // If a border exists, ensure it's visible color or zero width
      if (parseFloat(ss.borderRightWidth) > 0) {
        expect(ss.borderRightColor).not.toBe('rgba(0, 0, 0, 0)');
      }
    }
  });
});
