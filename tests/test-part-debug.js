const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  
  const APP_PATH = 'file://' + path.resolve(__dirname, '../aneuploidy-annotator.html');
  await page.goto(APP_PATH, { waitUntil: 'networkidle2', timeout: 30000 });

  const result = await page.evaluate(() => {
    window.currentSessionId = 'boundary-test';
    if (!window.sessions) window.sessions = {};
    window.sessions['boundary-test'] = {
      videoParts: [
        { name: 'part1.tiff', size: 100, frameCount: 100, frameOffset: 0 },
        { name: 'part2.tiff', size: 100, frameCount: 100, frameOffset: 100 }
      ],
      totalFrames: 200
    };

    const res100 = window.getPartForFrame(100);
    
    return res100;
  });

  console.log('Frame 100:', result);

  await browser.close();
  process.exit(0);
})();
