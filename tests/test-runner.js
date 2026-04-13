/**
 * Test Runner for Aneuploidy Annotator
 * Runs all test suites and reports results
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const TEST_FILES = [
  'test-sessions.js',
  'test-event-markers.js',
  'test-markers-visual.js',
  'test-marker-alignment.js',
  'test-zoom.js',
  'test-slider-shortcuts.js',
  'test-navigation.js',
  'test-annotations.js',
  'test-import.js',
  'test-visualization.js',
  'test-export.js',
];

const FIXTURE_DIR = path.join(__dirname, 'fixtures');
const APP_PATH = 'file://' + path.resolve(__dirname, '../aneuploidy-annotator.html');

async function runTests() {
  const browser = await puppeteer.launch({ headless: true });
  const results = [];

  console.log('╔════════════════════════════════════════════╗');
  console.log('║  Aneuploidy Annotator - Test Suite         ║');
  console.log('╚════════════════════════════════════════════╝\n');

  for (const testFile of TEST_FILES) {
    const testPath = path.join(__dirname, testFile);
    if (!fs.existsSync(testPath)) {
      console.log(`⚠ ${testFile} not found, skipping...`);
      continue;
    }

    console.log(`\n📋 Running ${testFile}...`);
    const page = await browser.newPage();
    await page.goto(APP_PATH, { waitUntil: 'networkidle2', timeout: 30000 });

    try {
      const testModule = require(testPath);
      const testResults = await testModule.run(page, { FIXTURE_DIR, APP_PATH });
      results.push({ file: testFile, ...testResults });

      const passed = testResults.passed || 0;
      const failed = testResults.failed || 0;
      const total = passed + failed;
      const status = failed === 0 ? '✓' : '✗';
      console.log(`${status} ${testFile}: ${passed}/${total} passed`);

      if (testResults.tests) {
        testResults.tests.forEach(t => {
          const icon = t.pass ? '  ✓' : '  ✗';
          console.log(`${icon} ${t.name}`);
          if (t.error) console.log(`     Error: ${t.error}`);
        });
      }
    } catch (error) {
      console.error(`✗ ${testFile} error:`, error.message);
      results.push({ file: testFile, error: error.message, passed: 0, failed: 1 });
    }

    await page.close();
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  TEST SUMMARY                              ║');
  console.log('╚════════════════════════════════════════════╝');

  const totalPassed = results.reduce((sum, r) => sum + (r.passed || 0), 0);
  const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);
  const totalTests = totalPassed + totalFailed;

  console.log(`\nTotal: ${totalPassed}/${totalTests} tests passed`);
  console.log(`Success rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%\n`);

  results.forEach(r => {
    const status = (r.failed || 0) === 0 ? '✓' : '✗';
    console.log(`${status} ${r.file}: ${r.passed || 0}/${(r.passed || 0) + (r.failed || 0)}`);
  });

  await browser.close();
  process.exit(totalFailed === 0 ? 0 : 1);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
