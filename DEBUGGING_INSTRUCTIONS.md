# Multi-Part Frame Count Debugging Guide

## Issue
When creating a multi-part session with 2 TIFF files (54 frames each), the total frame count displays as **54** instead of **108**.

## Root Cause (Unknown)
- Session creation correctly calculates `totalFrames = 108`
- But after `loadPartFile(0)` is called, `totalFrames` resets to **54**
- This suggests the `opts.partSwitch` flag logic in `loadTiffFile()` is not working correctly

## How to Debug (User Instructions)

### Step 1: Open Browser Developer Tools
1. Open `/Users/yair/Documents/claude/T4C/Aneuploidy-Annotator/aneuploidy-annotator.html` in your browser
2. Open DevTools: Press **F12** or **Cmd+Option+I** (macOS)
3. Go to the **Console** tab
4. Clear any previous logs: Press **Ctrl+L** or type `clear()`

### Step 2: Create a Multi-Part Session
1. Click **"New Session"** button
2. Enter a session name (e.g., "Debug Test")
3. Click **"Add Part"** button
4. Select the first TIFF file: `MCF7_D_L_14.02.24_C3_3_Green-merged.tif` (54 frames)
5. The file should appear in the list as "Part 1 of 5"
6. Click **"Add Part"** button again
7. Select the second TIFF file: `MCF7_D_L_14.02.24_C3_3_Green-merged copy.tif` (54 frames)
8. The file should appear as "Part 2 of 5"
9. Click **"Create Session"** button
10. **IMMEDIATELY** look at the console logs (don't close DevTools)

### Step 3: Look for These Specific Console Logs

You should see logs that include:

```
DEBUG START: isPartSwitch=true, ijFrames=54, currentSessionId=<timestamp>, hasSession=true
[BRANCH B] PART SWITCH MODE: Using session.totalFrames=108
DEBUG END: totalFrames NOW SET TO 108
```

**OR** (if the bug still exists):

```
DEBUG START: isPartSwitch=false, ijFrames=54, currentSessionId=<timestamp>, hasSession=true
[BRANCH A] SINGLE FILE MODE: set totalFrames = ijFrames=54
DEBUG END: totalFrames NOW SET TO 54
```

### Step 4: What The Logs Tell Us

**If you see "BRANCH B"**: The fix worked! `totalFrames` should be 108.
- Check if the frame counter displays "Frame 1 / 108"
- If it still shows "Frame 1 / 54", there's another place resetting it

**If you see "BRANCH A"**: The bug is confirmed - `isPartSwitch` is `false` when it should be `true`
- This means `opts.partSwitch` is not being passed correctly
- Or `currentSessionId` is not set when `loadPartFile()` is called

**If you see something else entirely**: Please share the exact console output with line numbers

### Step 5: Share Your Results

Copy and paste ALL console logs from the session creation, starting from:
```
Multi-part files stored in IndexedDB for new session
```

And ending with:
```
[updateUI] totalFrames=...
```

Include:
1. All "DEBUG" logs
2. The "BRANCH" log (A or B)
3. The final frame counter value displayed in the UI

## Files Modified in This Debugging Round

- `aneuploidy-annotator.html` (lines 2296-2310)
  - Restructured `loadTiffFile()` totalFrames logic
  - Added detailed console logging throughout

- All 87 tests still pass ✓

## Expected Behavior (After Fix)

1. Create session with 2 × 54-frame TIFFs
2. Session creation logs: "Total frames calculated: 108"
3. loadPartFile logs should show: "PART SWITCH MODE: Using session.totalFrames=108"
4. Frame counter should display: "Frame 1 / 108"
5. Navigation to frame 100 should automatically switch to Part 2
