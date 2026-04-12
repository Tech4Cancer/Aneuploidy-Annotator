# Aneuploidy Annotator - Test Suite

Comprehensive headless DOM testing for all user flows.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suite
npm run test:sessions
npm run test:navigation
npm run test:annotations
npm run test:import
npm run test:visualization
npm run test:export

# Watch mode (re-run on file changes)
npm run test:watch
```

## Test Files

### test-runner.js
Main test coordinator. Runs all test suites and generates summary report.

```bash
node tests/test-runner.js
```

### test-sessions.js
**Tests**: Session create, load, delete, persistence

**Coverage**:
- Create new session
- Load existing session
- Delete session
- Session data persistence
- Session dropdown UI

### test-navigation.js
**Tests**: Frame navigation, event jumping, event cycling

**Coverage**:
- Skip frames forward/backward
- Navigate to next/previous event
- Cycle through events on same frame
- Frame bounds checking

### test-annotations.js
**Tests**: Add, edit, delete, type assignment

**Coverage**:
- Add event with coordinates
- Assign event type
- Edit event notes
- Toggle export flag
- Delete event
- Multiple events on same frame

### test-import.js
**Tests**: CSV and Trackastra parsing

**Coverage**:
- Parse standard CSV format
- Filter Trackastra by mitosis=True
- Deduplicate by track_id (first frame)
- Handle missing columns
- Parse quoted CSV fields
- Error handling for malformed CSV

### test-visualization.js
**Tests**: Timeline, brightness, zoom, quartile

**Coverage**:
- Timeline marker density calculation
- Timeline marker positioning
- Brightness adjustment and reset
- Zoom scaling and bounds
- Quartile offset tracking
- Marker visibility in quartile mode
- Event marker opacity

### test-export.js
**Tests**: CSV generation, ZIP structure, data integrity

**Coverage**:
- Generate CSV with all fields
- CSV column order and formatting
- Export frame flag filtering
- Event statistics
- Metadata generation
- Special character escaping
- Sorted output by frame number

## Fixtures

Located in `tests/fixtures/`:

- **sample.csv** - Standard CSV with 9 test events
- **trackastra_sample.csv** - Trackastra format with 20 rows (mix of mitosis=True/False)

## Test Structure

Each test file exports a `run()` function:

```javascript
module.exports = {
  run: async (page, { FIXTURE_DIR, APP_PATH }) => {
    const tests = [];

    // Test implementations
    tests.push({
      name: 'Test name',
      pass: true/false,
      error: 'error message if failed'
    });

    return {
      tests,
      passed: number,
      failed: number
    };
  }
};
```

## Test Output

Example output:
```
╔════════════════════════════════════════════╗
║  Aneuploidy Annotator - Test Suite         ║
╚════════════════════════════════════════════╝

📋 Running test-sessions.js...
✓ test-sessions.js: 5/5 passed
  ✓ Create new session
  ✓ Load session
  ✓ Delete session
  ✓ Session persistence
  ✓ Session dropdown exists

📋 Running test-navigation.js...
✓ test-navigation.js: 6/6 passed
  ✓ Skip frames forward (+5)
  ✓ Skip frames backward (-5)
  ✓ Navigate to next event
  ✓ Navigate to previous event
  ✓ Cycle through events on same frame
  ✓ Frame bounds checking

...

╔════════════════════════════════════════════╗
║  TEST SUMMARY                              ║
╚════════════════════════════════════════════╝

Total: 48/48 tests passed
Success rate: 100.0%

✓ test-sessions.js: 5/5
✓ test-navigation.js: 6/6
✓ test-annotations.js: 7/7
✓ test-import.js: 6/6
✓ test-visualization.js: 9/9
✓ test-export.js: 7/7
```

## Adding New Tests

1. Create `test-feature.js` in `tests/` folder
2. Export `run()` function following the pattern
3. Add test file name to `TEST_FILES` in `test-runner.js`
4. Add npm script to `package.json`: `"test:feature": "node tests/test-feature.js"`

Example:

```javascript
// tests/test-feature.js
module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    try {
      const result = await page.evaluate(() => {
        // DOM testing code here
        return { success: true };
      });

      tests.push({
        name: 'Feature test',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Feature test',
        pass: false,
        error: error.message
      });
    }

    const passed = tests.filter(t => t.pass).length;
    const failed = tests.filter(t => !t.pass).length;
    return { tests, passed, failed };
  }
};
```

## Debugging

### Run single test with output
```bash
node -e "const t = require('./tests/test-sessions.js'); t.run(page, {}).then(r => console.log(JSON.stringify(r, null, 2)))"
```

### Increase timeout
Edit `test-runner.js`:
```javascript
await page.goto(APP_PATH, { waitUntil: 'networkidle2', timeout: 60000 });
```

### Enable browser debugging
Add to test:
```javascript
await page.screenshot({ path: 'debug-screenshot.png' });
```

## Continuous Integration

Tests are designed to run in CI environments. Example GitHub Actions:

```yaml
- name: Run tests
  run: npm test

- name: Upload results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results.log
```

## Performance

- Full test suite: ~30-60 seconds
- Single test: ~5-10 seconds
- Timeout per test: 30 seconds (configurable)

## Troubleshooting

### Tests hang
- Increase timeout in test-runner.js
- Check browser memory usage
- Close other browser instances

### Puppeteer crashes
```bash
# Reinstall Chromium
npx puppeteer browsers install chrome
```

### TIFF tests fail
- Verify TIFF file integrity
- Check file size (may need more RAM)
- Try different TIFF compression

## User Flow Coverage

See `../docs/USER_FLOWS.md` for complete user flow documentation and test coverage map.

## Test Metrics

- **Total Tests**: 48
- **Test Categories**: 6
- **Expected Pass Rate**: 100%
- **Coverage**: All major user flows

Test breakdown:
- Sessions: 5 tests
- Navigation: 6 tests
- Annotations: 7 tests
- Import: 6 tests
- Visualization: 9 tests
- Export: 7 tests
- Quartile: 3 tests (included in visualization)
