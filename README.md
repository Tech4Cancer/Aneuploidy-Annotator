# Aneuploidy Annotator

A browser-based tool for annotating mitotic abnormalities in microscopy videos and multi-dimensional TIFF files. Built for cell biology research — no installation, no server, runs entirely in the browser.

---

## Features

- **Multi-format support** — MP4/video, multi-frame TIFF, OME-TIFF, ImageJ hyperstacks (Z/T/C dimensions), PNG, JPEG
- **7 annotation types** — Correct division, Misaligned chromosomes, Lagging chromosomes, Anaphase bridge, Multipolar spindles, Micronuclei, Mitosis failure
- **Precise coordinate marking** — Click directly on the image to place annotations; coordinates stored in image-pixel space
- **Cursor position display** — Live X/Y coordinates at bottom-left of viewer in image space
- **Hyperstack navigation** — Z-slice, T-frame, and Channel sliders auto-appear for multi-dimensional TIFFs
- **Zoom & pan** — Scroll to zoom (centered on cursor), drag to pan; coordinate mapping stays accurate at any zoom level
- **Quartile view** — Crop to any exact quarter of the image (TL/TR/BL/BR) for close inspection; zoom and pan within the cropped view
- **Brightness control** — Non-destructive brightness slider with reset
- **Playback speed** — Clickable speed indicator opens a slider (0.0625× – 16×)
- **Rep. Image tool** — Select rectangular regions on the image to capture and export as PNG
- **Color-coded events** — Visual event indicators with auto-assigned distinct colors; event counter shows labeled vs total (X/Y)
- **Session management** — Multiple named sessions, auto-saved in browser storage (IndexedDB); survives page reloads
- **CSV/Trackastra import** — Import annotations from CSV files with optional quote-aware parsing; Trackastra format with `mitosis=True` filtering
- **Export** — Downloads a `.zip` containing a CSV of all annotations, a metadata summary, and PNG frame images for selected events
- **Lazy TIFF decoding** — Frames are decoded on demand, making large files (1 GB+) practical to work with

---

## Getting Started

No installation required. Just open the file in a browser:

1. Download [`aneuploidy-annotator.html`](aneuploidy-annotator.html)
2. Open it in **Chrome** (recommended) or any modern browser
3. Click **+ New Session**, give it a name, and upload your file

---

## Usage

### Loading Files

| Format | Notes |
|---|---|
| MP4 / video | Standard browser-supported video formats |
| `.tif` / `.tiff` | Multi-frame TIFF, ImageJ hyperstack, OME-TIFF |
| `.png` / `.jpg` | Single-frame images |

To reload a video after a page refresh, click the image area — it will prompt you to re-select the file (annotations are preserved).

### Navigation

| Action | Key / Control |
|---|---|
| Jump between annotated events | `←` / `→` arrows |
| Skip ±1 frame | `<` / `>` |
| Play / Pause | `Space` |
| Scrub timeline | Click or drag the timeline bar |
| Quick annotate (types 1–7) | `1` – `7` keys |
| Open Add Event panel | `N` |
| Edit event at current frame | `E` |
| Delete event at current frame | `Delete` / `Backspace` |
| Close panel | `Escape` |

### Annotating

**Quick annotate:** Press `1`–`7` to select a type, then click on the image to place a marker with coordinates. A distinct color is auto-assigned to each event.

**Add with panel:** Click **+ Add** to open the event panel. Click **"Click to mark on image"** to pick coordinates by clicking directly on the image — the panel stays open and non-blocking so the image remains fully visible. Optionally add notes before marking.

**Rep. Image:** Click the **Rep. Image** button to enter rectangle selection mode. Click and drag to select a rectangular region — the selection is captured and added to the event list with a unique visual style. Rep. Image regions are exported as cropped PNG images.

### Hyperstack Navigation (TIFF)

When a multi-dimensional TIFF is loaded, sliders appear below the timeline:
- **T** — time frame (synced with the timeline scrubber)
- **Z** — Z-slice (optical depth)
- **C** — channel

The header shows current position: `Frame 5 / 100  |  Z 3/10  C 1/2`

### Zoom & Pan

- **Scroll** to zoom in/out centered on the cursor (minimum 100%)
- **Click + drag** to pan when zoomed in
- Use the **− +** buttons (bottom-right of image) or **⊡** to reset
- **Quartile buttons** (↖ ↗ ↙ ↘) crop to the exact image quarter for close inspection — zoom and pan work within the cropped view; click the same button again to exit

### Brightness

Click the **☀** slider (bottom-right overlay) to adjust brightness non-destructively. Click **↺** to reset.

### Playback Speed

Click the **speed indicator** (e.g. `1x`) next to the frame counter to open a speed slider. Range: 0.0625× to 16× in powers of 2.

### Importing

1. Click **Import** to load a CSV file
2. For standard CSV: columns must include `frame`, `type`, and optionally `x`, `y`, `notes`
3. For Trackastra format: automatically filters rows where `mitosis=True` and deduplicates by track ID (first frame per track)
4. Imported events are added to the current session with empty type labels until manually annotated

### Exporting

1. Check the **checkbox** on any event card to include its frame image in the export
2. Click **Export** (top right)
3. A `.zip` is downloaded containing:
   - `session.csv` — all annotations (Frame, Type, X, Y, Width, Height, Notes, ExportFrame)
   - `session_meta.txt` — session info and statistics
   - `frames/session_frame42_correct-division.png` — PNG images for checked events (cropped for Rep. Image regions)

---

## Annotation Types

| Key | Type |
|---|---|
| 1 | Correct division |
| 2 | Misaligned chromosomes |
| 3 | Lagging chromosomes |
| 4 | Anaphase bridge |
| 5 | Multipolar spindles |
| 6 | Micronuclei |
| 7 | Mitosis failure |

---

## Testing

39 automated headless DOM tests covering all major user flows:

```bash
cd tests
npm install        # one-time, ~2-3 min
npm test          # run all 39 tests
npm run test:sessions      # session management (5 tests)
npm run test:navigation    # navigation (6 tests)
npm run test:annotations   # annotations (7 tests)
npm run test:import        # CSV/Trackastra import (5 tests)
npm run test:visualization # visualization features (9 tests)
npm run test:export        # export to ZIP (7 tests)
```

See [`tests/README.md`](tests/README.md) for details on test structure and debugging. Full documentation in [`etc/docs/USER_FLOWS.md`](etc/docs/USER_FLOWS.md) covers 30+ user flows with test coverage maps.

---

## Project Structure

```
Aneuploidy-Annotator/
├── aneuploidy-annotator.html    ← Main app (single file, no build)
├── README.md                     ← This file
├── tests/                        ← All testing files & configuration
│   ├── package.json             ← npm scripts & test dependencies
│   ├── test-runner.js           ← Test coordinator
│   ├── test-*.js                ← Individual test suites (6 suites, 39 tests)
│   ├── fixtures/                ← Test data (CSV samples, test TIFF)
│   ├── README.md                ← Test suite documentation
│   ├── QUICK_START.md           ← 30-second setup guide
│   ├── SETUP.md                 ← Full environment setup
│   └── TESTING_SUMMARY.md       ← Testing infrastructure overview
└── etc/                          ← Documentation & reference
    └── docs/
        └── USER_FLOWS.md        ← 30+ detailed user flows with test mapping
```

---

## Technical Notes

- **Storage** — Sessions (annotations + metadata) are saved in `localStorage`. Video/TIFF files are stored in `IndexedDB` and persist across reloads.
- **Large files** — TIFF IFDs are parsed upfront (metadata only); pixel data is decoded lazily per frame and cached. Practical for files 1 GB+.
- **TIFF formats** — Uses [UTIF.js](https://github.com/photopea/UTIF.js) for parsing. Supports 8-bit grayscale, 16-bit grayscale (auto contrast-stretched), RGB, and RGBA. Reads both ImageJ `ImageDescription` metadata and OME-XML for dimension order (XYZCT / XYZTC etc.).
- **No dependencies to install** — All libraries (UTIF.js, JSZip) are loaded from CDN at runtime.

---

## License

MIT
