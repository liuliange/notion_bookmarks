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

    // 找到同时有标签和 3 个按钮的卡片
    const handle = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll('.group'));
      for (const card of cards) {
        const bottom = card.querySelector('.mt-auto');
        if (!bottom) continue;
        const tagWrap = bottom.querySelector('.flex.flex-wrap') || bottom.querySelector('.min-w-0');
        const btnWrap = bottom.querySelector('.shrink-0');
        if (!tagWrap || !btnWrap) continue;
        const tags = tagWrap.querySelectorAll('span');
        const btns = btnWrap.querySelectorAll('button, a');
        if (tags.length > 0 && btns.length >= 3) return card;
      }
      return null;
    });

    const card = await handle.asElement();
    if (!card) {
      console.log(`${theme}: no 3-btn tagged card found`);
      await ctx.close();
      continue;
    }
    await card.screenshot({ path: `scripts/shot-card-${theme}.png`, padding: { top: 10, right: 10, bottom: 10, left: 10 } });
    console.log(`saved scripts/shot-card-${theme}.png`);
    await ctx.close();
  }
  await browser.close();
};

run().catch((e) => { console.error(e); process.exit(1); });
