import { chromium } from 'playwright';

const URL = 'http://localhost:3000';
const THEMES = ['simple-light', 'simple-dark', 'cyberpunk-dark'];

const run = async () => {
  const browser = await chromium.launch();
  for (const theme of THEMES) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.evaluate((t) => {
      const html = document.documentElement;
      html.setAttribute('data-theme', t);
      html.style.colorScheme = t.includes('dark') ? 'dark' : 'light';
    }, theme);
    await page.waitForFunction(() => {
      const c = document.querySelector('.group');
      return c && c.getBoundingClientRect().width > 0;
    }, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);
    // 截全页
    await page.screenshot({ path: `scripts/shot-${theme}.png`, fullPage: false });
    console.log(`saved scripts/shot-${theme}.png`);
    await ctx.close();
  }
  await browser.close();
};

run().catch((e) => { console.error(e); process.exit(1); });
