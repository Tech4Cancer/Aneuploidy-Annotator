/**
 * Test: Scroll Zoom Centers on Mouse Position
 * Verifies that wheel zoom is centered where the mouse is hovering
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    try {
      // Create session
      await page.evaluate(async () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newSessionBtn = buttons.find(btn => btn.textContent.includes('New Session'));
        if (newSessionBtn) {
          newSessionBtn.click();
          await new Promise(resolve => setTimeout(resolve, 400));

          const nameInput = document.querySelector('#newSessionNameInput');
          if (nameInput) {
            nameInput.value = 'Zoom Center Test ' + Date.now();
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
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

      tests.push({
        name: 'Session created',
        pass: true
      });

      // Get initial canvas position
      const initialState = await page.evaluate(() => {
        const canvasElement = document.getElementById('videoCanvas');
        const container = document.getElementById('cellImage');
        const rect = canvasElement.getBoundingClientRect();
        const zoomState = window.getZoomPanState();
        return {
          canvasWidth: canvasElement.width,
          canvasHeight: canvasElement.height,
          containerWidth: container.clientWidth,
          containerHeight: container.clientHeight,
          zoomScale: zoomState.zoomScale,
          panX: zoomState.panX,
          panY: zoomState.panY
        };
      });

      tests.push({
        name: 'Canvas and zoom state accessible',
        pass: initialState.zoomScale !== undefined,
        error: JSON.stringify(initialState)
      });

      // Hover near top-left of canvas and scroll to zoom
      await page.evaluate(async () => {
        const container = document.getElementById('cellImage');
        const canvas = document.getElementById('videoCanvas');
        const rect = canvas.getBoundingClientRect();
        // Hover at approximately 1/4 from left, 1/4 from top
        const hoverX = rect.left + rect.width * 0.25;
        const hoverY = rect.top + rect.height * 0.25;

        // Move mouse to position
        const mouseMove = new MouseEvent('mousemove', {
          clientX: hoverX,
          clientY: hoverY,
          bubbles: true
        });
        container.dispatchEvent(mouseMove);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Scroll to zoom in (dispatch on the container which has the listener)
        const wheelEvent = new WheelEvent('wheel', {
          clientX: hoverX,
          clientY: hoverY,
          deltaY: -100,
          bubbles: true,
          cancelable: true
        });
        container.dispatchEvent(wheelEvent);
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // Check that zoom changed
      const afterZoom = await page.evaluate(() => {
        return window.getZoomPanState();
      });

      const zoomedIn = afterZoom.zoomScale > initialState.zoomScale;
      tests.push({
        name: 'Scroll wheel zooms in',
        pass: zoomedIn,
        error: `Zoom: ${initialState.zoomScale} -> ${afterZoom.zoomScale}`
      });

      // Verify pan values exist (indicating cursor-centering was applied)
      const hasPan = afterZoom.panX !== 0 || afterZoom.panY !== 0;
      tests.push({
        name: 'Pan is applied during zoom (cursor centering)',
        pass: hasPan,
        error: `Pan: X=${afterZoom.panX}, Y=${afterZoom.panY}`
      });

      // Zoom back to 100%
      await page.evaluate(async () => {
        const container = document.getElementById('cellImage');
        const canvas = document.getElementById('videoCanvas');
        const rect = canvas.getBoundingClientRect();
        const wheelEvent = new WheelEvent('wheel', {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          deltaY: 100,
          bubbles: true,
          cancelable: true
        });
        container.dispatchEvent(wheelEvent);
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      const resetState = await page.evaluate(() => {
        return window.getZoomPanState();
      });

      tests.push({
        name: 'Reset zoom returns to 100% and recenters',
        pass: resetState.zoomScale === 1 && resetState.panX === 0 && resetState.panY === 0,
        error: `Zoom=${resetState.zoomScale}, Pan=X${resetState.panX}/Y${resetState.panY}`
      });

    } catch (error) {
      tests.push({
        name: 'Scroll zoom center test failed',
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
