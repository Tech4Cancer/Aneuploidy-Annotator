# Aneuploidy Annotator - Setup & Testing

## System Requirements

- **Node.js**: 18.0 or later
- **npm**: 9.0 or later
- **Operating Systems**: macOS, Linux, Windows

## Installation

### 1. Install Node.js and npm

**macOS (using Homebrew):**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

**Windows (using Chocolatey):**
```bash
choco install nodejs
```

**Or download from:** https://nodejs.org/

Verify installation:
```bash
node --version
npm --version
```

### 2. Install Project Dependencies

Navigate to the project directory:
```bash
cd /path/to/Aneuploidy-Annotator
npm install
```

This installs:
- **puppeteer**: Headless browser automation for DOM testing
- **jszip**: ZIP file generation (used by app)
- **utif**: TIFF file parsing (used by app)

### 3. Verify Installation

Test that all dependencies are available:
```bash
npm list
```

You should see:
```
aneuploidy-annotator@1.0.0
├── puppeteer@24.15.0
├── jszip@3.10.1
└── utif@3.1.0
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suite
```bash
node tests/test-sessions.js
node tests/test-navigation.js
node tests/test-annotations.js
node tests/test-import.js
node tests/test-visualization.js
node tests/test-export.js
```

### Test with Verbose Output
```bash
node tests/test-runner.js 2>&1 | tee test-results.log
```

## Test Fixtures

Test fixtures are located in `tests/fixtures/`:

- `sample.csv` - Standard CSV format for import testing
- `trackastra_tracks.csv` - Trackastra format with mitosis tracking
- `single-frame.tif` - Single-frame TIFF image
- `multi-frame.tif` - Multi-frame TIFF stack

### Creating Test Fixtures

If you need to create new fixtures:

**Sample CSV:**
```csv
frame,type,x,y,notes
10,Correct division,100,200,Good event
25,Misaligned,150,250,
50,Lagging,200,300,
```

**Trackastra CSV:**
```csv
track_id,frame,y,x,parent,daughters,mitosis
1.0,10.0,100.0,200.0,,"[463, 464]",True
2.0,15.0,150.0,250.0,,"[1000, 1001]",True
```

## Running the App Locally

### Option 1: Direct File Open
```bash
open aneuploidy-annotator.html
```

Or use your preferred browser:
```bash
# Firefox
firefox aneuploidy-annotator.html

# Chrome
google-chrome aneuploidy-annotator.html
```

### Option 2: Local Server (Recommended)

Using Python 3:
```bash
python3 -m http.server 8000
# Then open: http://localhost:8000/aneuploidy-annotator.html
```

Using Node.js:
```bash
npx http-server
# Then open: http://localhost:8080/aneuploidy-annotator.html
```

Using Python 2:
```bash
python -m SimpleHTTPServer 8000
```

## Troubleshooting

### Puppeteer Installation Issues

**Issue**: Puppeteer download fails
```bash
# Try clearing npm cache
npm cache clean --force
npm install
```

**Issue**: Chromium not found
```bash
# Download Chromium explicitly
npx puppeteer browsers install chrome
```

### TIFF Parsing Issues

**Issue**: TIFF file not loading
- Verify the file is a valid TIFF (not corrupted)
- Check file size (very large TIFFs may need more memory)
- Try a different TIFF encoding (LZW, uncompressed, etc)

### Test Timeout

If tests timeout:
```bash
# Increase timeout in test files (milliseconds)
# Edit timeout in test-runner.js: { timeout: 60000 }
```

## Development Workflow

### 1. Make Code Changes
Edit `aneuploidy-annotator.html`

### 2. Run Tests
```bash
npm test
```

### 3. Test in Browser
```bash
open aneuploidy-annotator.html
```

### 4. Commit Changes
```bash
git add -A
git commit -m "Feature: description"
```

## CI/CD Integration

### GitHub Actions (example .github/workflows/test.yml)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

### Running in Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "test"]
```

Build and run:
```bash
docker build -t aneuploidy-annotator-tests .
docker run aneuploidy-annotator-tests
```

## Documentation

- **USER_FLOWS.md**: Detailed user workflows and test coverage map
- **docs/**: Additional documentation files

## Performance Considerations

- **Large TIFF files**: May require increased memory
- **Many events (>1000)**: Timeline rendering may slow down
- **Browser memory**: Close other tabs when working with large videos

## Debugging

Enable browser console for more details:
```bash
# In aneuploidy-annotator.html, uncomment console.log statements
# Or open DevTools (F12) while app is running
```

## Support

For issues:
1. Check logs: `npm test 2>&1 | tee debug.log`
2. Review USER_FLOWS.md for expected behavior
3. Check browser console for JavaScript errors
4. Verify all dependencies installed: `npm list`

## Version Info

Current versions:
- Node.js: 18.x or later
- npm: 9.x or later
- Puppeteer: 24.x
- UTIF: 3.x
- JSZip: 3.x
