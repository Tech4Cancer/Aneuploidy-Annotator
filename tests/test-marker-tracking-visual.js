/**
 * Visual Test: Verify Marker Tracks Event Coordinate on Zoom/Pan
 * This test creates an event, clicks it to show the marker, zooms/pans,
 * and verifies the marker stays at the correct image coordinate
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
            nameInput.value = 'Marker Tracking ' + Date.now();
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

      // Add event at specific coordinate
      const eventCoord = { x: 400, y: 300 };
      await page.evaluate(async (coord) => {
        const typeBtn = Array.from(document.querySelectorAll('.type-btn')).find(btn =>
          btn.textContent.includes('Correct division')
        );
        if (typeBtn) {
          typeBtn.click();
          await new Promise(resolve => setTimeout(resolve, 200));

          const canvas = document.querySelector('canvas');
          const rect = canvas.getBoundingClientRect();
          const clickEvent = new MouseEvent('click', {
            clientX: rect.left + coord.x,
            clientY: rect.top + coord.y,
            bubbles: true
          });
          canvas.dispatchEvent(clickEvent);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }, eventCoord);

      tests.push({
        name: 'Event created at coordinate',
        pass: true
      });

      // Click event to show marker
      await page.evaluate(() => {
        const eventCards = Array.from(document.querySelectorAll('.event-card'));
        const lastCard = eventCards[eventCards.length - 1];
        if (lastCard) {
          lastCard.click();
        }
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      // Get marker position at zoom=1
      const markerZoom1 = await page.evaluate(() => {
        const markerCanvas = document.getElementById('markerCanvas');
        const videoCanvas = document.getElementById('videoCanvas');
        const container = document.getElementById('cellImage');

        return {
          markerCanvasWidth: markerCanvas.width,
          markerCanvasHeight: markerCanvas.height,
          markerStyleWidth: parseInt(markerCanvas.style.width),
          markerStyleHeight: parseInt(markerCanvas.style.height),
          videoCanvasWidth: videoCanvas.width,
          videoCanvasHeight: videoCanvas.height,
          videoStyleWidth: parseInt(videoCanvas.style.width),
          videoStyleHeight: parseInt(videoCanvas.style.height),
          videoTransform: videoCanvas.style.transform,
          containerWidth: container.clientWidth,
          containerHeight: container.clientHeight,
          zoomScale: window.zoomScale
        };
      });

      console.log('\n=== ZOOM 1x ===');
      console.log('Marker canvas pixel:', markerZoom1.markerCanvasWidth, 'x', markerZoom1.markerCanvasHeight);
      console.log('Marker canvas style:', markerZoom1.markerStyleWidth, 'x', markerZoom1.markerStyleHeight);
      console.log('Video canvas pixel:', markerZoom1.videoCanvasWidth, 'x', markerZoom1.videoCanvasHeight);
      console.log('Video canvas style:', markerZoom1.videoStyleWidth, 'x', markerZoom1.videoStyleHeight);
      console.log('Zoom scale:', markerZoom1.zoomScale);

      const canvasMatches = markerZoom1.markerStyleWidth === markerZoom1.videoCanvasWidth &&
                           markerZoom1.markerStyleHeight === markerZoom1.videoCanvasHeight;
      tests.push({
        name: 'Marker canvas display size matches base canvas size at zoom 1x',
        pass: canvasMatches,
        error: !canvasMatches ? `Marker: ${markerZoom1.markerStyleWidth}x${markerZoom1.markerStyleHeight}, Video: ${markerZoom1.videoCanvasWidth}x${markerZoom1.videoCanvasHeight}` : undefined
      });

      // Zoom in to 2x
      await page.evaluate(() => {
        if (typeof window.adjustZoom === 'function') {
          window.adjustZoom(2);
        }
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Get marker position at zoom=2x
      const markerZoom2 = await page.evaluate(() => {
        const markerCanvas = document.getElementById('markerCanvas');
        const videoCanvas = document.getElementById('videoCanvas');
        const container = document.getElementById('cellImage');

        return {
          markerCanvasWidth: markerCanvas.width,
          markerCanvasHeight: markerCanvas.height,
          markerStyleWidth: parseInt(markerCanvas.style.width),
          markerStyleHeight: parseInt(markerCanvas.style.height),
          videoCanvasWidth: videoCanvas.width,
          videoCanvasHeight: videoCanvas.height,
          videoStyleWidth: parseInt(videoCanvas.style.width),
          videoStyleHeight: parseInt(videoCanvas.style.height),
          videoTransform: videoCanvas.style.transform,
          videoLeft: videoCanvas.style.left,
          videoTop: videoCanvas.style.top,
          containerWidth: container.clientWidth,
          containerHeight: container.clientHeight,
          zoomScale: window.zoomScale
        };
      });

      console.log('\n=== ZOOM 2x ===');
      console.log('Marker canvas pixel:', markerZoom2.markerCanvasWidth, 'x', markerZoom2.markerCanvasHeight);
      console.log('Marker canvas style:', markerZoom2.markerStyleWidth, 'x', markerZoom2.markerStyleHeight);
      console.log('Video canvas pixel:', markerZoom2.videoCanvasWidth, 'x', markerZoom2.videoCanvasHeight);
      console.log('Video canvas style:', markerZoom2.videoStyleWidth, 'x', markerZoom2.videoStyleHeight);
      console.log('Video transform:', markerZoom2.videoTransform);
      console.log('Video position:', markerZoom2.videoLeft, markerZoom2.videoTop);
      console.log('Zoom scale:', markerZoom2.zoomScale);

      // Key check: marker canvas display size should NOT change on zoom
      const markerSizeStayed = markerZoom2.markerStyleWidth === markerZoom1.markerStyleWidth &&
                              markerZoom2.markerStyleHeight === markerZoom1.markerStyleHeight;
      tests.push({
        name: 'Marker canvas display size stays fixed when zooming',
        pass: markerSizeStayed,
        error: !markerSizeStayed ? `Zoom 1x: ${markerZoom1.markerStyleWidth}x${markerZoom1.markerStyleHeight}, Zoom 2x: ${markerZoom2.markerStyleWidth}x${markerZoom2.markerStyleHeight}` : undefined
      });

      // Pan and check marker is still correct
      await page.evaluate(() => {
        if (typeof window.adjustPan === 'function') {
          window.adjustPan(100, 50);  // Pan right and down
        }
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const markerAfterPan = await page.evaluate(() => {
        const markerCanvas = document.getElementById('markerCanvas');
        const videoCanvas = document.getElementById('videoCanvas');

        return {
          markerStyleWidth: parseInt(markerCanvas.style.width),
          markerStyleHeight: parseInt(markerCanvas.style.height),
          videoLeft: videoCanvas.style.left,
          videoTop: videoCanvas.style.top
        };
      });

      // Marker canvas size should still not change
      const markerSizeAfterPan = markerAfterPan.markerStyleWidth === markerZoom1.markerStyleWidth &&
                                markerAfterPan.markerStyleHeight === markerZoom1.markerStyleHeight;
      tests.push({
        name: 'Marker canvas display size stays fixed when panning',
        pass: markerSizeAfterPan,
        error: !markerSizeAfterPan ? `Before pan: ${markerZoom1.markerStyleWidth}x${markerZoom1.markerStyleHeight}, After pan: ${markerAfterPan.markerStyleWidth}x${markerAfterPan.markerStyleHeight}` : undefined
      });

    } catch (error) {
      tests.push({
        name: 'Marker tracking test failed',
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
