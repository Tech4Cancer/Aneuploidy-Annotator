# Aneuploidy Annotator - Quick Start Guide

## Getting Started

1. **Create Session**: Click "+ New Session" to start a new annotation session
2. **Load Media**: Select a video file, image sequence (TIFF), PNG, JPG
3. **Navigate**: Use arrow keys to move frame-by-frame, and `< >` keys to jump between events

## Annotation Features

### Quick Annotate (Left Panel)
- **1-8 Keys**: Press number keys to tag events, then click on its location in the image:
  - 1: Correct division
  - 2: Misaligned chromosomes
  - 3: Lagging chromosomes
  - 4: Anaphase bridge
  - 5: Multipolar spindles
  - 6: Micronuclei
  - 7: Mitotic failure
  - 8: Abberation

- **Add Rep. Image**: Mark representative images with a selection box to be exported as images

### Event List
- **Click event**: Select to view in main area
- **Edit button (✎)**: Edit event type and notes
- **Delete button (×)**: Remove event from list
- **Checkbox**: Mark events to include as images in export


## Exporting

Click **Export** to download:
- **CSV**: All event metadata with frame numbers, types, coordinates, notes
- **Metadata**: Session info and event statistics
- **Representative Images**: Folder with marked rep images as PNG snapshots
- **Frames**: Folder with events checked in the list


## Viewer Controls

### Playback
- **Space**: Play/Pause video
- **-5 / -1 / +1 / +5**: Jump frames
- **← Prev Event / Next Event →**: Navigate between annotated events

### Video/Image Adjustment
- **Brightness slider**: Adjust image brightness (100% is neutral position)
- **Zoom buttons**: +/-, Reset (⊡)
- **Quartile zoom**: ↖ ↗ ↙ ↘ buttons to zoom into image corners
- **Scroll to zoom**: Use mouse wheel to zoom, centered on cursor position

### Timeline
- **Click slider**: Jump to frame
- **Event markers**: Colored dots show annotated events
- **Frame counter**: Shows current position

## Keyboard Shortcuts
- **Arrows**: ±1 frame navigation
- **< >**: Jump to previous/next event
- **Space**: Play/Pause
- **1-8**: Quick annotate with type
- **Delete**: Remove current frame's event

