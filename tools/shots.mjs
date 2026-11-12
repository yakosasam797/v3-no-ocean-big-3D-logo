import { chromium } from 'file:///D:/vimakh%20logo/src/node_modules/playwright/index.mjs';
const b = await chromium.launch({ headless: true, executablePath: process.env.CHROME, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const errs = [];
async function run(w, h, tag, stops) {
  const page = await b.newPage({ viewport: { width: w, height: h } });
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await page.goto('http://localhost:4180/', { timeout: 120000 }); await page.waitForFunction(() => window.__sea); await page.waitForTimeout(2500);
  for (const [i, sel] of stops.entries()) {
    if (sel) await page.evaluate(s => document.querySelector(s).scrollIntoView({ behavior: 'instant' }), sel);
    await page.waitForTimeout(1300); await page.screenshot({ path: `previews/${tag}-${i}.png` });
  }
  if (tag === 'd') { await page.evaluate(() => scrollTo(0, 0)); for (let k = 0; k < 3; k++) { await page.waitForTimeout(700); await page.screenshot({ path: `previews/swing-${k}.png`, clip: { x: 0, y: 0, width: 440, height: 400 } }); } }
  await page.close();
}
await run(1440, 900, 'd', [null, '#premise', '#work', '#studio', '#contact']);
await run(390, 844, 'm', [null, '#work']);
console.log(errs.length ? errs.join(' | ') : 'no errors'); await b.close();
