# Aneuploidy Annotator

A browser-based tool for annotating mitotic abnormalities in microscopy videos and multi-dimensional TIFF files. Built for cell biology research — no installation, no server, runs entirely in the browser.

![Aneuploidy Annotator screenshot](https://raw.githubusercontent.com/Tech4Cancer/Aneuploidy-Annotator/main/screenshot.png)

---

## Features

- **Multi-format support** — MP4/video, multi-frame TIFF, OME-TIFF, ImageJ hyperstacks (Z/T/C dimensions), PNG, JPEG
- **7 annotation types** — Correct division, Misaligned chromosomes, Lagging chromosomes, Anaphase bridge, Multipolar spindles, Micronuclei, Mitosis failure
- **Precise coordinate marking** — Click directly on the image to place annotations; coordinates stored in image-pixel space
- **Hyperstack navigation** — Z-slice, T-frame, and Channel sliders auto-appear for multi-dimensional TIFFs
- **Zoom & pan** — Scroll to zoom (centered on cursor), drag to pan; coordinate mapping stays accurate at any zoom level
- **Session management** — Multiple named sessions, auto-saved in browser storage (IndexedDB); survives page reloads
- **Export** — Downloads a `.zip` containing a CSV of all annotations, a metadata summary, and PNG frame images for selected events
- **Lazy TIFF decoding** — Frames are decoded on demand, making large files (1 GB+) practical to work with

---

## Getting Started

No installation required. Just open the file in a browser:

1. Download [`aneuploidy-annotator.html`](aneuploidy-annotator.html)
2. Open it in **Chrome** (recommended) or any modern browser
3. Click **+ New Session**, give it a name, and upload your file

> For a full walkthrough see [`user-guide.pdf`](user-guide.pdf)

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
| Skip ±1 frame | `Q` / `W` |
| Skip ±5 frames | `A` / `S` |
| Jump between annotated events | `←` / `→` arrows |
| Play / Pause | `Space` |
| Scrub timeline | Click or drag the timeline bar |
| Quick annotate (types 1–7) | `1` – `7` keys |
| Open Add Event panel | `N` |
| Edit event at current frame | `E` |
| Delete event at current frame | `Delete` / `Backspace` |
| Close panel | `Escape` |

### Annotating

**Quick annotate:** Press `1`–`7` to select a type, then click on the image to place a marker with coordinates.

**Add with notes:** Click **+ Add with Notes** to open the event panel. Click **"Click to mark on image"** to pick coordinates by clicking directly on the image — the panel stays open and non-blocking so the image remains fully visible.

### Hyperstack Navigation (TIFF)

When a multi-dimensional TIFF is loaded, sliders appear below the timeline:
- **T** — time frame (synced with the timeline scrubber)
- **Z** — Z-slice (optical depth)
- **C** — channel

The header shows current position: `Frame 5 / 100  |  Z 3/10  C 1/2`

### Zoom & Pan

- **Scroll** to zoom in/out centered on the cursor
- **Click + drag** to pan when zoomed in
- Use the **− +** buttons (bottom-right of image) or **⊡** to reset

### Exporting

1. Check the **checkbox** on any event card to include its frame image in the export
2. Click **Export** (top right)
3. A `.zip` is downloaded containing:
   - `session.csv` — all annotations (Frame, Type, X, Y, Notes, ExportFrame)
   - `session_meta.txt` — session info and statistics
   - `frames/session_frame42_correct-division.png` — PNG images for checked events

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

## Technical Notes

- **Storage** — Sessions (annotations + metadata) are saved in `localStorage`. Video/TIFF files are stored in `IndexedDB` and persist across reloads.
- **Large files** — TIFF IFDs are parsed upfront (metadata only); pixel data is decoded lazily per frame and cached. Practical for files 1 GB+.
- **TIFF formats** — Uses [UTIF.js](https://github.com/photopea/UTIF.js) for parsing. Supports 8-bit grayscale, 16-bit grayscale (auto contrast-stretched), RGB, and RGBA. Reads both ImageJ `ImageDescription` metadata and OME-XML for dimension order (XYZCT / XYZTC etc.).
- **No dependencies to install** — All libraries (UTIF.js, JSZip) are loaded from CDN at runtime.

---

## License

MIT
