# Quick Start - Aneuploidy Annotator Testing

## 30-Second Setup

```bash
# 1. Navigate to project
cd /path/to/Aneuploidy-Annotator

# 2. Install dependencies (one-time, ~2-3 min)
npm install

# 3. Run tests
npm test
```

That's it! ✅

## What Gets Tested?

48 automated tests covering:
- ✓ Session management (create, load, delete)
- ✓ Video/image navigation and playback
- ✓ Event annotation and editing
- ✓ CSV and Trackastra data import
- ✓ Visualization (timeline, brightness, zoom, quartile)
- ✓ Data export to CSV/ZIP

## Expected Output

```
╔════════════════════════════════════════════╗
║  Aneuploidy Annotator - Test Suite         ║
╚════════════════════════════════════════════╝

📋 Running test-sessions.js...
✓ test-sessions.js: 5/5 passed

📋 Running test-navigation.js...
✓ test-navigation.js: 6/6 passed

[... more tests ...]

╔════════════════════════════════════════════╗
║  TEST SUMMARY                              ║
╚════════════════════════════════════════════╝

Total: 48/48 tests passed
Success rate: 100.0%
```

## Individual Test Suites

Run specific tests:

```bash
npm run test:sessions      # Session management (5 tests)
npm run test:navigation    # Frame & event nav (6 tests)
npm run test:annotations   # Event create/edit/delete (7 tests)
npm run test:import        # CSV & Trackastra parsing (6 tests)
npm run test:visualization # Timeline, zoom, etc (9 tests)
npm run test:export        # CSV export & data integrity (7 tests)
```

## Running the App

```bash
# Open in browser directly
open aneuploidy-annotator.html

# OR use local server
npm run serve
# Then open: http://localhost:8080
```

## Common Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Start local server
npm run serve

# Check installed versions
npm list
npm list -g node
node --version
```

## File Structure

```
Aneuploidy-Annotator/
├── aneuploidy-annotator.html   ← Main app
├── package.json                 ← npm scripts & deps
├── SETUP.md                     ← Detailed setup guide
├── QUICK_START.md              ← This file
├── TESTING_SUMMARY.md          ← Testing overview
├── docs/
│   └── USER_FLOWS.md           ← All user flows documented
└── tests/
    ├── README.md               ← Test documentation
    ├── test-runner.js          ← Coordinator
    ├── test-sessions.js        ← Tests
    ├── test-navigation.js      ├─ Tests
    ├── test-annotations.js     ├─ Tests
    ├── test-import.js          ├─ Tests
    ├── test-visualization.js   ├─ Tests
    ├── test-export.js          ← Tests
    └── fixtures/
        ├── sample.csv          ← Test data
        └── trackastra_sample.csv
```

## Troubleshooting

### "Cannot find module 'puppeteer'"
```bash
npm install
```

### "Timeout waiting for Chromium"
Increase timeout in `tests/test-runner.js`:
```javascript
{ waitUntil: 'networkidle2', timeout: 60000 }
```

### "TIFF file not loading"
- Use a different TIFF (some encodings not supported)
- Check browser console for errors

### Tests running slow
- Close other browser tabs
- Check available RAM
- Disable browser extensions

## Next Steps

1. **Read**: USER_FLOWS.md (all features documented)
2. **Explore**: tests/README.md (test details)
3. **Setup**: Follow SETUP.md if issues
4. **Develop**: Make changes, run `npm test` to verify

## Documentation

- **SETUP.md** - Full installation & environment setup
- **TESTING_SUMMARY.md** - Overview of test infrastructure
- **docs/USER_FLOWS.md** - 30+ user flows with test coverage
- **tests/README.md** - Test suite details and debugging

## Requirements

- Node.js 18+ (https://nodejs.org/)
- npm 9+ (comes with Node.js)
- ~500MB disk space
- 2GB+ RAM

---

**All set!** Run `npm test` to verify everything works. 🚀
