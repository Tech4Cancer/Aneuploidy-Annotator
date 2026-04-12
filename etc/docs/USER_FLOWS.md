# Aneuploidy Annotator - User Flows

## 1. Session Management

### 1.1 Create New Session
**Flow**: User creates a new session to organize annotations for a video/image
- Click "+ New Session" button
- Enter session name in modal
- Click confirm
- **Expected**: Session added to dropdown, automatically selected, all UI resets (no video, no events)

### 1.2 Load Session
**Flow**: User switches between existing sessions
- Click session dropdown
- Select a session
- Click "Load"
- **Expected**: All session data loaded (video, events, current frame, annotations)

### 1.3 Delete Session
**Flow**: User removes a session
- Select session from dropdown
- Click delete button (trash icon)
- Confirm deletion
- **Expected**: Session removed from list and local storage

### 1.4 Session Persistence
**Flow**: Session data survives app reload
- Create session with video and annotations
- Reload page
- **Expected**: Session still exists with all data intact

---

## 2. Media Upload & Loading

### 2.1 Upload Video
**Flow**: User uploads a video file
- Click on placeholder or load button
- Select .mp4, .webm, or other video format
- Wait for upload completion
- **Expected**: Video displays in canvas, frame counter shows "Frame 1 / [total]"

### 2.2 Upload TIFF/Image Stack
**Flow**: User uploads multi-frame TIFF file
- Click on placeholder
- Select .tif/.tiff file
- Wait for parsing (UTIF library decodes frames)
- **Expected**: Image displays, Z/T/C sliders appear if applicable (multi-layer)

### 2.3 Video Loading from IndexedDB
**Flow**: System reloads video from local storage on session load
- Load a session with previously uploaded video
- **Expected**: Video loads from IndexedDB without re-uploading

### 2.4 Failed Video Load
**Flow**: User tries to load session but video is missing from IndexedDB
- Load session after clearing IndexedDB
- **Expected**: Placeholder shows "Video: [name]", prompt to click to reload

---

## 3. Navigation

### 3.1 Frame Navigation
**Flow**: User navigates through video frames
- Use arrow buttons (-5, +5, next event, prev event)
- Use timeline slider
- **Expected**: Canvas updates to new frame, timeline marker moves

### 3.2 Event-Based Navigation
**Flow**: User jumps between events
- Click event card in sidebar
- **Expected**: Canvas jumps to that frame, crosshair appears at event x/y

### 3.3 Event List Scrolling
**Flow**: Selected event card scrolls to top of event list
- Click an event far down the list
- **Expected**: Event list scrolls so selected card appears at top

### 3.4 Speed Control
**Flow**: User adjusts playback speed
- Move speed slider
- **Expected**: Playback rate changes without affecting annotations

---

## 4. Annotations & Events

### 4.1 Quick Annotate
**Flow**: User quickly marks an event type using keyboard/buttons
- Click event type button (1-7) in sidebar
- **Expected**: Modal appears to add notes, or event created with type

### 4.2 Add Event with Coordinates
**Flow**: User manually adds an event at a specific location
- Click "+ Add with Notes"
- Click "Pick Coords" button
- Click on canvas at desired location
- Select event type
- Enter notes (optional)
- Click "Add"
- **Expected**: Event added to list, crosshair appears at coordinates

### 4.3 Edit Event
**Flow**: User modifies an existing event
- Click edit button (✎) on event card
- Change type or notes
- Click "Save"
- **Expected**: Event updated in list and canvas

### 4.4 Delete Event
**Flow**: User removes an event
- Click delete button (×) on event card
- **Expected**: Event removed from list, crosshair disappears

### 4.5 Annotate Event Type
**Flow**: User assigns a type to an untyped event
- Select event (card has no type label, shows 1-7 buttons)
- Click type button (1-7)
- **Expected**: Type assigned, button highlighted as active

### 4.6 Mark for Export
**Flow**: User marks event's frame for export
- Click checkbox on event card
- **Expected**: Checkbox checked, event flagged for frame export

---

## 5. Import

### 5.1 Import Standard CSV
**Flow**: User imports annotations from standard CSV (Frame, Type, X, Y, Notes)
- Click "Import CSV"
- Select CSV file
- **Expected**: Events parsed and added, success message shows count

### 5.2 Import Trackastra CSV
**Flow**: User imports tracked cell division data from Trackastra
- Click "Import Trackastra CSV"
- Select trackastra_tracks.csv
- **Expected**:
  - Only rows with mitosis=True imported
  - First occurrence per track_id selected
  - Events created with empty type (requires manual annotation)
  - Success message shows count

### 5.3 CSV Parse Error
**Flow**: User imports malformed CSV
- Click "Import CSV"
- Select invalid CSV
- **Expected**: Alert shows error, no events added

---

## 6. Visualization & Display

### 6.1 Event Timeline
**Flow**: User sees visual markers of all events on timeline
- After adding/importing events
- **Expected**: Timeline shows markers, density-based opacity (more events = darker)

### 6.2 Brightness Control
**Flow**: User adjusts image brightness
- Move brightness slider
- Click reset button
- **Expected**: Canvas brightness changes, then resets to 100%

### 6.3 Zoom & Pan
**Flow**: User zooms into canvas for detail
- Scroll to zoom in/out
- Drag to pan when zoomed
- **Expected**: Canvas scales and pans smoothly

### 6.4 Quartile Crop
**Flow**: User focuses on one quarter of the image
- Click TL/TR/BL/BR button
- **Expected**:
  - Canvas crops to that quarter
  - Zoom resets
  - Event crosshair adjusts to cropped coordinates (or disappears if outside quarter)

### 6.5 Exit Quartile
**Flow**: User exits quartile mode
- Click same quartile button again
- **Expected**: Full image restored, crosshair back at original position

---

## 7. Export

### 7.1 Export as ZIP
**Flow**: User exports all session data
- Click "Export"
- Choose format
- **Expected**: ZIP file downloaded containing:
  - CSV with all events (Frame, Type, X, Y, Notes, ExportFrame)
  - Metadata file (session info, timestamps, event counts)
  - Frame images (only for checked events)

### 7.2 Export Frame Images
**Flow**: User exports only frames marked for export
- Mark events with checkbox
- Click "Export"
- **Expected**: ZIP contains PNG images of marked frames

### 7.3 Export CSV Only
**Flow**: User needs just the CSV data
- Open downloaded ZIP
- Extract CSV file
- **Expected**: CSV in standard format, ready for analysis tools

---

## 8. Settings & UI

### 8.1 T/Z/C Slider (TIFF Multi-Layer)
**Flow**: User navigates multi-channel or multi-slice TIFF
- Move T (time/frame) slider
- Move Z (slice) slider
- Move C (channel) slider
- **Expected**: Canvas updates to show requested layer/slice/channel

### 8.2 Event Card Display
**Flow**: User sees all event information in sidebar
- For event with type: shows type label + 1-7 buttons (with active button highlighted) + coords + notes
- For event without type: shows 1-7 buttons (for quick assign) + coords
- **Expected**: All info clearly visible and functional

### 8.3 Play/Pause
**Flow**: User plays video automatically
- Click play button
- Click pause button
- **Expected**: Video frames advance automatically at set speed

---

## Test Coverage Map

| Flow | Test File | Status |
|------|-----------|--------|
| Session Create | test-sessions.js | ✓ |
| Session Load | test-sessions.js | ✓ |
| Session Delete | test-sessions.js | ✓ |
| Session Persistence | test-sessions.js | ✓ |
| Video Upload | test-upload.js | ✓ |
| TIFF Upload | test-upload.js | ✓ |
| Navigation | test-navigation.js | ✓ |
| Event Add | test-annotations.js | ✓ |
| Event Edit | test-annotations.js | ✓ |
| Event Delete | test-annotations.js | ✓ |
| Event Type Assign | test-annotations.js | ✓ |
| Import CSV | test-import.js | ✓ |
| Import Trackastra | test-import.js | ✓ |
| Timeline Display | test-visualization.js | ✓ |
| Zoom/Pan | test-visualization.js | ✓ |
| Quartile Mode | test-quartile.js | ✓ |
| Export ZIP | test-export.js | ✓ |
| TIFF Navigation | test-tiff.js | ✓ |
