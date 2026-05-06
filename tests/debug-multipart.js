/**
 * Debug script: Create multi-part session and capture console logs
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const APP_PATH = 'file://' + path.resolve(__dirname, '../aneuploidy-annotator.html');

async function debug() {
  const browser = await puppeteer.launch({ headless: false }); // Visible browser
  const page = await browser.newPage();

  // Capture all console messages
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log(`[BROWSER LOG] ${msg.text()}`);
    }
  });

  // Get fixture TIFF files
  const fixtureDir = path.join(__dirname, 'fixtures');
  const tiffFiles = fs.readdirSync(fixtureDir).filter(f => f.endsWith('.tif') || f.endsWith('.tiff')).slice(0, 2);

  if (tiffFiles.length < 2) {
    console.error('Need at least 2 TIFF files in fixtures/');
    await browser.close();
    return;
  }

  const file1Path = path.join(fixtureDir, tiffFiles[0]);
  const file2Path = path.join(fixtureDir, tiffFiles[1]);

  console.log(`Using files: ${tiffFiles[0]}, ${tiffFiles[1]}\n`);

  await page.goto(APP_PATH, { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for app to load
  await page.waitForTimeout(1000);

  // Open the "Create New Session" modal
  console.log('\n=== Opening Create New Session modal ===');
  await page.click('button:contains("New Session")');
  await page.waitForTimeout(500);

  // Enter session name
  await page.type('#newSessionNameInput', 'Debug Multi-Part Session');

  // Add first file
  console.log('\n=== Adding first TIFF file ===');
  const fileInput1 = await page.$('#fileInput');
  await fileInput1.uploadFile(file1Path);
  await page.waitForTimeout(500);

  // Add second file by clicking the Add Part button
  console.log('\n=== Adding second TIFF file ===');
  await page.click('#addPartBtn');
  await page.waitForTimeout(300);

  const fileInput2 = await page.$('input[type="file"]:not([style*="display: none"])');
  await fileInput2.uploadFile(file2Path);
  await page.waitForTimeout(500);

  // Create session
  console.log('\n=== Clicking Create Session ===');
  await page.click('button:contains("Create Session")');

  // Wait for session to be created and file to load
  console.log('\n=== Waiting for session creation and file loading ===');
  await page.waitForTimeout(3000);

  // Get the frame counter value
  const frameCounter = await page.$eval('#frameCounter', el => el.textContent);
  console.log(`\n=== Frame Counter: ${frameCounter} ===`);

  // Keep browser open for inspection
  console.log('\nBrowser is open. Check console for debug logs. Press Ctrl+C to exit.');
  await page.waitForFunction(() => false, { timeout: 60000 }).catch(() => {});

  await browser.close();
}

debug().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
