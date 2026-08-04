// 测量卡片底部行：标签末元素右边缘 到 按钮区左边缘 的间距
import { chromium } from 'playwright';

const URL = 'http://localhost:3000';
const THEME = process.argv[2] || 'simple-light';

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12 Pro
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
  }, THEME);

  // 等待卡片真正渲染（有宽度）
  await page.waitForFunction(() => {
    const cards = document.querySelectorAll('.group');
    for (const c of cards) {
      if (c.getBoundingClientRect().width > 0) return true;
    }
    return false;
  }, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  const data = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.group'));
    const results = [];
    for (const card of cards) {
      const cardRect = card.getBoundingClientRect();
      if (cardRect.width === 0) continue;
      // 底部行：含 mt-auto 的行
      const rows = card.querySelectorAll(':scope > div > div');
      // 直接找带 'mt-auto' 的底部行
      let bottomRow = null;
      card.querySelectorAll('div').forEach((d) => {
        if (d.className && d.className.includes('mt-auto')) bottomRow = d;
      });
      if (!bottomRow) continue;
      const tagWrap = bottomRow.querySelector('.flex.flex-wrap') || bottomRow.querySelector('.min-w-0');
      const btnWrap = bottomRow.querySelector('.shrink-0.ml-auto') || bottomRow.querySelector('.shrink-0');
      if (!tagWrap || !btnWrap) continue;
      const tagEls = tagWrap.querySelectorAll('span');
      const btnEls = btnWrap.querySelectorAll('button, a');
      if (!tagEls.length || !btnEls.length) continue;
      const tagRect = tagEls[tagEls.length - 1].getBoundingClientRect();
      const btnRect = btnEls[0].getBoundingClientRect();
      if (tagRect.width === 0) continue;
      const gap = btnRect.left - tagRect.right;
      results.push({
        cardW: Math.round(cardRect.width),
        tagText: tagEls[tagEls.length - 1].textContent,
        tagW: Math.round(tagRect.width),
        btnCount: btnEls.length,
        gap: Math.round(gap * 100) / 100,
      });
    }
    return results;
  });

  console.log(`THEME=${THEME}  CARD_COUNT=${data.length}`);
  for (const d of data) {
    console.log(`  cardW=${d.cardW} tag="${d.tagText}" tagW=${d.tagW} btns=${d.btnCount} gap=${d.gap}px`);
  }
  await browser.close();
};

run().catch((e) => { console.error(e); process.exit(1); });
