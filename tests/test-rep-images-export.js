/**
 * Test: Rep Images Export
 * Verifies that rep images are exported to the zip file
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    try {
      // Create a new session with a rep image
      await page.evaluate(async () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newSessionBtn = buttons.find(btn => btn.textContent.includes('New Session'));
        if (newSessionBtn) {
          newSessionBtn.click();
          await new Promise(resolve => setTimeout(resolve, 400));

          const nameInput = document.querySelector('#newSessionNameInput');
          if (nameInput) {
            nameInput.value = 'Export Test ' + Date.now();
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

      // Start rep image mode
      const repImageStarted = await page.evaluate(async () => {
        const repBtn = Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent.includes('Rep. Image')
        );
        if (repBtn) {
          repBtn.click();
          await new Promise(resolve => setTimeout(resolve, 200));
          return true;
        }
        return false;
      });

      tests.push({
        name: 'Rep image mode can be started',
        pass: repImageStarted
      });

      // Draw a rep image
      await page.evaluate(async () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          // Start drag
          const mouseDown = new MouseEvent('mousedown', {
            clientX: rect.left + 100,
            clientY: rect.top + 100,
            bubbles: true
          });
          canvas.dispatchEvent(mouseDown);
          await new Promise(resolve => setTimeout(resolve, 100));

          // Drag
          const mouseMove = new MouseEvent('mousemove', {
            clientX: rect.left + 200,
            clientY: rect.top + 150,
            bubbles: true
          });
          canvas.dispatchEvent(mouseMove);
          await new Promise(resolve => setTimeout(resolve, 100));

          // End drag
          const mouseUp = new MouseEvent('mouseup', {
            clientX: rect.left + 200,
            clientY: rect.top + 150,
            bubbles: true
          });
          canvas.dispatchEvent(mouseUp);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      });

      // Approve the rep image (click checkmark button)
      const repImageApproved = await page.evaluate(async () => {
        const approveBtn = document.getElementById('approveRepImageBtn');
        if (approveBtn && approveBtn.style.display !== 'none') {
          approveBtn.click();
          await new Promise(resolve => setTimeout(resolve, 200));
          return true;
        }
        return false;
      });

      tests.push({
        name: 'Rep image can be approved',
        pass: repImageApproved
      });

      // Check that rep image was added to the list
      const repImageCountAfter = await page.evaluate(() => {
        const repImages = Array.from(document.querySelectorAll('.event-card')).filter(card =>
          card.querySelector('.event-type')?.textContent === 'Rep Image'
        );
        return repImages.length;
      });

      tests.push({
        name: 'Rep image was added to event list',
        pass: repImageCountAfter > 0,
        error: `Found ${repImageCountAfter} rep images`
      });

      // Get export data to verify rep images are included
      const exportData = await page.evaluate(async () => {
        // Mock the download to capture what would be exported
        const sessions = window.sessions || {};
        const currentSessionId = window.currentSessionId;

        if (!currentSessionId || !sessions[currentSessionId]) {
          return { error: 'No session found' };
        }

        const session = sessions[currentSessionId];
        const events = session.events || [];
        const repImages = events.filter(e => e.type === 'Rectangle');
        const regularEvents = events.filter(e => e.type !== 'Rectangle');

        return {
          totalEvents: events.length,
          regularEvents: regularEvents.length,
          repImages: repImages.length,
          repImageExportFlag: repImages.length > 0 ? repImages[0].exportFrame : null
        };
      });

      tests.push({
        name: 'Session contains rep images in events array',
        pass: exportData.repImages > 0,
        error: exportData.error || `Found ${exportData.repImages} rep images, ${exportData.regularEvents} regular events`
      });

      tests.push({
        name: 'Rep images have exportFrame=true flag',
        pass: exportData.repImageExportFlag === true,
        error: exportData.repImageExportFlag === null ? 'No rep images found' : `exportFrame = ${exportData.repImageExportFlag}`
      });

    } catch (error) {
      tests.push({
        name: 'Rep image export test failed',
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
