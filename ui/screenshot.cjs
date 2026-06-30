const puppeteer = require('puppeteer');
const path = require('path');

const OUTPUT_DIR = '/Users/airal/WorkBuddy/2026-06-30-15-16-18/outputs';
const pages = [
  { name: 'home', file: 'home.html' },
  { name: 'detail', file: 'detail.html' },
  { name: 'publish', file: 'publish.html' },
  { name: 'profile', file: 'profile.html' },
  { name: 'messages', file: 'messages.html' },
  { name: 'following', file: 'following.html' },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  for (const page of pages) {
    const tab = await browser.newPage();
    await tab.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });

    const filePath = path.join(OUTPUT_DIR, page.file);
    await tab.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 15000 });

    // Wait for fonts and animations
    await new Promise(r => setTimeout(r, 500));

    const pngPath = path.join(OUTPUT_DIR, `${page.name}.png`);
    await tab.screenshot({ path: pngPath, fullPage: false });
    console.log(`✓ ${page.name}.png`);

    await tab.close();
  }

  await browser.close();
  console.log('Done — all 6 screenshots generated.');
})();
