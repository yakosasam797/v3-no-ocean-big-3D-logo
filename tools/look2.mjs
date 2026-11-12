import { chromium } from 'file:///D:/vimakh%20logo/src/node_modules/playwright/index.mjs';
const [pg = 'home', w = '1440', h = '900', tag = 'home'] = process.argv.slice(2);
const b = await chromium.launch({ headless: true, executablePath: process.env.CHROME, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; page.on('console', m => m.type() === 'error' && errs.push(m.text())); page.on('pageerror', e => errs.push(e.message));
page.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
const path = pg === 'home' ? '/' : '/work/' + pg + '/'; await page.goto('http://localhost:4180' + path, { timeout: 120000 });
if (path === '/') await page.waitForFunction(() => window.__sea, null, { timeout: 120000 });
await page.waitForTimeout(1500);
// step through the page so scroll-driven waves settle, then full-page capture
const H = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 600) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(60); }
await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
await page.screenshot({ path: `previews/${tag}.png`, fullPage: true, timeout: 120000 });
const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log(tag, 'height', H, 'h-overflow', ov, errs.length ? errs.join(' | ') : 'no errors');
await b.close();
