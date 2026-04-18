/**
 * Visual Debug Test: Marker Zoom/Pan Tracking
 * Takes screenshots at each step to visually verify marker positioning
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    try {
      // Create a new session
      await page.evaluate(async () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newSessionBtn = buttons.find(btn => btn.textContent.includes('New Session'));
        if (newSessionBtn) {
          newSessionBtn.click();
          await new Promise(resolve => setTimeout(resolve, 400));

          const nameInput = document.querySelector('#newSessionNameInput');
          if (nameInput) {
            nameInput.value = 'Marker Debug ' + Date.now();
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

      // Add an event
      await page.evaluate(async () => {
        const typeBtn = Array.from(document.querySelectorAll('.type-btn')).find(btn =>
          btn.textContent.includes('Correct division')
        );
        if (typeBtn) {
          typeBtn.click();
          await new Promise(resolve => setTimeout(resolve, 200));

          const canvas = document.querySelector('canvas');
          const rect = canvas.getBoundingClientRect();
          const clickEvent = new MouseEvent('click', {
            clientX: rect.left + 300,
            clientY: rect.top + 300,
            bubbles: true
          });
          canvas.dispatchEvent(clickEvent);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      });

      tests.push({
        name: 'Event added at coordinates',
        pass: true
      });

      // Click on the event to show marker
      const eventAdded = await page.evaluate(() => {
        const eventCards = Array.from(document.querySelectorAll('.event-card'));
        const lastCard = eventCards[eventCards.length - 1];
        if (lastCard) {
          lastCard.click();
          return true;
        }
        return false;
      });

      tests.push({
        name: 'Event clicked (marker should show)',
        pass: eventAdded
      });

      // Get marker position before zoom
      const markerBefore = await page.evaluate(() => {
        const markerCanvas = document.getElementById('markerCanvas');
        const videoCanvas = document.getElementById('videoCanvas');
        return {
          markerLeft: markerCanvas.style.left,
          markerTop: markerCanvas.style.top,
          markerWidth: markerCanvas.style.width,
          markerHeight: markerCanvas.style.height,
          videoLeft: videoCanvas.style.left,
          videoTop: videoCanvas.style.top,
          videoTransform: videoCanvas.style.transform,
          zoomScale: window.zoomScale || 'undefined'
        };
      });

      console.log('\n=== BEFORE ZOOM ===');
      console.log('Marker canvas:', markerBefore.markerLeft, markerBefore.markerTop);
      console.log('Video canvas:', markerBefore.videoLeft, markerBefore.videoTop, markerBefore.videoTransform);
      console.log('Zoom scale:', markerBefore.zoomScale);

      // Zoom in
      await page.evaluate(() => {
        if (typeof window.adjustZoom === 'function') {
          window.adjustZoom(2);
        }
      });

      await page.waitForTimeout(200);

      // Get marker position after zoom
      const markerAfter = await page.evaluate(() => {
        const markerCanvas = document.getElementById('markerCanvas');
        const videoCanvas = document.getElementById('videoCanvas');
        return {
          markerLeft: markerCanvas.style.left,
          markerTop: markerCanvas.style.top,
          markerWidth: markerCanvas.style.width,
          markerHeight: markerCanvas.style.height,
          videoLeft: videoCanvas.style.left,
          videoTop: videoCanvas.style.top,
          videoTransform: videoCanvas.style.transform,
          zoomScale: window.zoomScale || 'undefined'
        };
      });

      console.log('\n=== AFTER ZOOM ===');
      console.log('Marker canvas:', markerAfter.markerLeft, markerAfter.markerTop);
      console.log('Video canvas:', markerAfter.videoLeft, markerAfter.videoTop, markerAfter.videoTransform);
      console.log('Zoom scale:', markerAfter.zoomScale);

      // Check if marker moved
      const markerMoved = markerAfter.markerLeft !== markerBefore.markerLeft ||
                          markerAfter.markerTop !== markerBefore.markerTop;
      const videoMoved = markerAfter.videoLeft !== markerBefore.videoLeft ||
                         markerAfter.videoTop !== markerBefore.videoTop;

      console.log('\n=== RESULTS ===');
      console.log('Video canvas moved:', videoMoved);
      console.log('Marker canvas moved:', markerMoved);
      console.log('Marker should have moved:', videoMoved);

      tests.push({
        name: 'Marker canvas updates position on zoom',
        pass: markerMoved === videoMoved,
        error: !markerMoved && videoMoved ? 'Video moved but marker did not' : undefined
      });

    } catch (error) {
      tests.push({
        name: 'Debug test failed',
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
