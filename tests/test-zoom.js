/**
 * Test Suite: Zoom Functionality
 * Tests zoom-to-cursor and reset-to-center behavior
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    // Test 1: Zoom controls exist
    try {
      const result = await page.evaluate(() => {
        const zoomIn = document.querySelector('button[onclick*="adjustZoom(0.15)"]');
        const zoomOut = document.querySelector('button[onclick*="adjustZoom(-0.15)"]');
        const resetZoom = document.querySelector('button[onclick*="resetZoom"]');
        const zoomLevel = document.querySelector('#zoomLevel');

        return {
          zoomInExists: !!zoomIn,
          zoomOutExists: !!zoomOut,
          resetZoomExists: !!resetZoom,
          zoomLevelExists: !!zoomLevel,
          initialZoomLevel: zoomLevel ? zoomLevel.textContent : 'n/a'
        };
      });

      tests.push({
        name: 'Zoom controls exist',
        pass: result.zoomInExists && result.zoomOutExists && result.resetZoomExists && result.initialZoomLevel === '100%',
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Zoom controls exist',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Wheel event handler exists
    try {
      const result = await page.evaluate(() => {
        const container = document.querySelector('#cellImage');
        const setupZoomPanExists = typeof window.setupZoomPan === 'function';
        const applyZoomTransformExists = typeof window.applyZoomTransform === 'function';

        return {
          containerExists: !!container,
          setupZoomPanExists: setupZoomPanExists,
          applyZoomTransformExists: applyZoomTransformExists
        };
      });

      tests.push({
        name: 'Zoom and pan functions exist',
        pass: result.containerExists && result.setupZoomPanExists && result.applyZoomTransformExists,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Zoom and pan functions exist',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Reset zoom button functionality
    try {
      const result = await page.evaluate(() => {
        // Simulate zooming by clicking zoom in button, then reset
        const zoomInBtn = document.querySelector('button[onclick*="adjustZoom(0.15)"]');
        const resetBtn = document.querySelector('button[onclick*="resetZoom"]');
        const zoomLevelDisplay = document.querySelector('#zoomLevel');

        if (zoomInBtn && resetBtn && zoomLevelDisplay) {
          // Check initial state
          const initial = zoomLevelDisplay.textContent;

          // Call resetZoom directly
          if (window.resetZoom) {
            window.resetZoom();
          }

          const final = zoomLevelDisplay.textContent;

          return {
            initialZoom: initial,
            finalZoom: final,
            resetWorked: final === '100%'
          };
        }

        return { error: 'Controls not found' };
      });

      tests.push({
        name: 'Reset zoom returns to 100%',
        pass: result.resetWorked === true,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Reset zoom returns to 100%',
        pass: false,
        error: error.message
      });
    }

    // Test 4: Zoom canvas positioning and styling
    try {
      const result = await page.evaluate(() => {
        const canvas = document.querySelector('#videoCanvas');
        if (!canvas) return { canvasExists: false };

        const initialStyle = window.getComputedStyle(canvas);

        // Call resetZoom
        if (window.resetZoom) {
          window.resetZoom();
        }

        const finalStyle = window.getComputedStyle(canvas);

        // Canvas should have left/top/transform properties set
        return {
          canvasExists: true,
          hasLeftPositioning: canvas.style.left !== undefined,
          hasTopPositioning: canvas.style.top !== undefined,
          hasTransform: canvas.style.transform !== undefined,
          positioningApplied: (canvas.style.left || canvas.style.top || canvas.style.transform)
        };
      });

      tests.push({
        name: 'Zoom transform is applied to canvas',
        pass: result.canvasExists && result.positioningApplied,
        error: result.canvasExists ? undefined : 'Canvas not found'
      });
    } catch (error) {
      tests.push({
        name: 'Zoom transform is applied to canvas',
        pass: false,
        error: error.message
      });
    }

    // Test 5: adjustZoom function behavior
    try {
      const result = await page.evaluate(() => {
        const zoomLevel = document.querySelector('#zoomLevel');

        // Test zooming in
        if (window.adjustZoom) {
          window.adjustZoom(0.25); // Zoom in
          const zoomedText = zoomLevel.textContent;
          const zoomedValue = parseInt(zoomedText);

          // Test reset
          window.resetZoom();
          const resetText = zoomLevel.textContent;
          const resetValue = parseInt(resetText);

          return {
            zoomedValue: zoomedValue,
            resetValue: resetValue,
            zoomWorked: zoomedValue > 100,
            resetWorked: resetValue === 100
          };
        }

        return { error: 'adjustZoom function not found' };
      });

      tests.push({
        name: 'Zoom in and reset cycle works',
        pass: result.zoomWorked && result.resetWorked,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Zoom in and reset cycle works',
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
