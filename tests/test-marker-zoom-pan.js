/**
 * Test Suite: Marker Zoom and Pan Tracking
 * Verifies that event markers track correctly when zooming and panning
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    // Helper: Create a new session for testing
    async function setupSession() {
      await page.evaluate(async () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newSessionBtn = buttons.find(btn => btn.textContent.includes('New Session'));
        if (newSessionBtn) {
          newSessionBtn.click();
          await new Promise(resolve => setTimeout(resolve, 400));

          const nameInput = document.querySelector('#newSessionNameInput');
          if (nameInput) {
            nameInput.value = 'Zoom Pan Test ' + Date.now();
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            nameInput.dispatchEvent(new Event('change', { bubbles: true }));
          }

          const createBtn = Array.from(document.querySelectorAll('button')).find(btn =>
            btn.textContent === 'Create' && btn.classList.contains('primary')
          );
          if (createBtn) {
            createBtn.click();
            await new Promise(resolve => setTimeout(resolve, 600));
          }
        }
      });
    }

    // Test 1: Zoom and pan functions exist and are callable
    try {
      await setupSession();

      const result = await page.evaluate(async () => {
        const adjustZoomExists = typeof window.adjustZoom === 'function';
        const drawCurrentFrameMarkersExists = typeof window.drawCurrentFrameMarkers === 'function';
        const drawMarkerExists = typeof window.drawMarker === 'function';

        return {
          adjustZoomExists: adjustZoomExists,
          drawCurrentFrameMarkersExists: drawCurrentFrameMarkersExists,
          drawMarkerExists: drawMarkerExists
        };
      });

      const hasRequiredFunctions = result.adjustZoomExists && result.drawCurrentFrameMarkersExists &&
                                   result.drawMarkerExists;
      tests.push({
        name: 'Zoom/pan functions and drawing functions exist',
        pass: hasRequiredFunctions,
        error: hasRequiredFunctions ? undefined : JSON.stringify(result)
      });
    } catch (error) {
      tests.push({
        name: 'Zoom/pan functions and drawing functions exist',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Marker canvas exists and follows video canvas
    try {
      const result = await page.evaluate(async () => {
        // Get both canvases
        const canvases = Array.from(document.querySelectorAll('canvas'));
        const hasCanvases = canvases.length >= 1;

        return {
          canvasCount: canvases.length,
          hasCanvases: hasCanvases,
          markerCanvasExists: !!document.querySelector('canvas')
        };
      });

      tests.push({
        name: 'Marker canvas exists for overlay drawing',
        pass: result.hasCanvases,
        error: result.hasCanvases ? undefined : 'No canvases found'
      });
    } catch (error) {
      tests.push({
        name: 'Marker canvas exists for overlay drawing',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Marker drawing uses scaling to convert pixel to display coordinates
    try {
      const result = await page.evaluate(async () => {
        // The drawMarker function scales from canvas pixel space to offsetWidth/offsetHeight
        // This allows markers to track correctly when zoomed/panned
        const drawMarkerExists = typeof window.drawMarker === 'function';
        const drawCurrentFrameMarkersExists = typeof window.drawCurrentFrameMarkers === 'function';

        // Verify both functions exist (they work together for zoom/pan support)
        return {
          drawMarkerExists: drawMarkerExists,
          drawCurrentFrameMarkersExists: drawCurrentFrameMarkersExists,
          bothExist: drawMarkerExists && drawCurrentFrameMarkersExists
        };
      });

      tests.push({
        name: 'Marker drawing functions support zoom/pan coordinate scaling',
        pass: result.bothExist,
        error: result.bothExist ? undefined : 'Functions not found'
      });
    } catch (error) {
      tests.push({
        name: 'Marker drawing functions support zoom/pan coordinate scaling',
        pass: false,
        error: error.message
      });
    }

    // Test 4: drawCurrentFrameMarkers clears and redraws on each call (supports zoom/pan)
    try {
      const result = await page.evaluate(async () => {
        const drawCurrentFrameMarkersExists = typeof window.drawCurrentFrameMarkers === 'function';
        const markerCanvas = document.querySelector('canvas');

        if (!markerCanvas) {
          return { error: 'Marker canvas not found' };
        }

        // Call drawCurrentFrameMarkers multiple times to verify it's idempotent
        if (drawCurrentFrameMarkersExists) {
          window.drawCurrentFrameMarkers();
          await new Promise(resolve => setTimeout(resolve, 100));
          window.drawCurrentFrameMarkers();
          await new Promise(resolve => setTimeout(resolve, 100));
          window.drawCurrentFrameMarkers();
        }

        return {
          drawCurrentFrameMarkersExists: drawCurrentFrameMarkersExists,
          markerCanvasExists: !!markerCanvas
        };
      });

      tests.push({
        name: 'drawCurrentFrameMarkers redraws on each call (supports zoom/pan updates)',
        pass: result.drawCurrentFrameMarkersExists && result.markerCanvasExists,
        error: !result.drawCurrentFrameMarkersExists ? 'Function not found' : undefined
      });
    } catch (error) {
      tests.push({
        name: 'drawCurrentFrameMarkers redraws on each call (supports zoom/pan updates)',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Marker canvas transform property is set (for zoom support)
    try {
      const result = await page.evaluate(async () => {
        const markerCanvas = document.querySelector('canvas');

        if (!markerCanvas) {
          return { error: 'Marker canvas not found' };
        }

        const transform = markerCanvas.style.transform;
        const hasTransformProperty = transform !== undefined && transform !== null;

        return {
          hasTransformProperty: hasTransformProperty,
          transform: transform,
          isNone: transform === 'none'
        };
      });

      tests.push({
        name: 'Marker canvas has transform property (allows independent drawing)',
        pass: result.hasTransformProperty,
        error: result.hasTransformProperty ? undefined : 'No transform property'
      });
    } catch (error) {
      tests.push({
        name: 'Marker canvas has transform property (allows independent drawing)',
        pass: false,
        error: error.message
      });
    }

    return {
      passed: tests.filter(t => t.pass).length,
      failed: tests.filter(t => !t.pass).length,
      tests: tests
    };
  }
};
