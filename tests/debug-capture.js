const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const APP_PATH = 'file://' + path.resolve(__dirname, '../aneuploidy-annotator.html');
const FIXTURE_DIR = path.join(__dirname, 'fixtures');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('DEBUG') || text.includes('BRANCH') || text.includes('Total frames')) {
      logs.push(text);
      console.log('[CAPTURE]', text);
    }
  });

  await page.goto(APP_PATH, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

  // Get fixture files (use specific test files)
  const file1 = path.join(FIXTURE_DIR, 'test1.tif');
  const file2 = path.join(FIXTURE_DIR, 'test2.tif');

  if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
    console.log('Test TIFF files not found in fixtures/');
    await browser.close();
    return;
  }

  const tiffFiles = ['test1.tif', 'test2.tif'];

  console.log(`Using files: ${tiffFiles[0]}, ${tiffFiles[1]}\n`);

  // Read files and simulate multi-part upload
  const blob1 = fs.readFileSync(file1);
  const blob2 = fs.readFileSync(file2);

  await page.evaluate(async (b1, b2) => {
    // Create File objects
    window.partFiles = [
      new File([new Uint8Array(b1.data)], 'file1.tif', { type: 'image/tiff' }),
      new File([new Uint8Array(b2.data)], 'file2.tif', { type: 'image/tiff' })
    ];

    // Set session name and create
    document.getElementById('newSessionNameInput').value = 'Debug Multi-Part';
    console.log('DEBUG: About to call createNewSession');
    await window.createNewSession();
    console.log('DEBUG: createNewSession completed');
  }, blob1, blob2);

  await page.evaluate(() => new Promise(r => setTimeout(r, 2000)));

  const frameCounter = await page.evaluate(() => {
    const el = document.getElementById('frameCounter');
    return el ? el.textContent : 'NOT FOUND';
  });

  console.log('\n=== RESULT ===');
  console.log('Frame Counter:', frameCounter);

  await browser.close();
})();
