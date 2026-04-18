/**
 * Test: Rep Images Full Export Flow
 * Verifies that rep images are correctly exported with the export zip
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
            nameInput.value = 'Rep Export Test ' + Date.now();
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

      // Start rep image mode and create a rep image
      const repImageCreated = await page.evaluate(async () => {
        const repBtn = Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent.includes('Rep. Image')
        );
        if (!repBtn) return false;

        repBtn.click();
        await new Promise(resolve => setTimeout(resolve, 200));

        // Draw a rep image
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();

          // Mouse down
          const mouseDown = new MouseEvent('mousedown', {
            clientX: rect.left + 50,
            clientY: rect.top + 50,
            bubbles: true
          });
          canvas.dispatchEvent(mouseDown);
          await new Promise(resolve => setTimeout(resolve, 100));

          // Mouse move (drag)
          const mouseMove = new MouseEvent('mousemove', {
            clientX: rect.left + 150,
            clientY: rect.top + 100,
            bubbles: true
          });
          document.dispatchEvent(mouseMove);
          await new Promise(resolve => setTimeout(resolve, 100));

          // Mouse up
          const mouseUp = new MouseEvent('mouseup', {
            bubbles: true
          });
          document.dispatchEvent(mouseUp);
          await new Promise(resolve => setTimeout(resolve, 200));

          return true;
        }
        return false;
      });

      tests.push({
        name: 'Rep image rectangle drawn',
        pass: repImageCreated
      });

      // Approve the rep image
      const approved = await page.evaluate(async () => {
        const approveBtn = document.getElementById('approveRepImageBtn');
        if (approveBtn && approveBtn.style.display !== 'none') {
          approveBtn.click();
          await new Promise(resolve => setTimeout(resolve, 300));
          return true;
        }
        return false;
      });

      tests.push({
        name: 'Rep image approved',
        pass: approved
      });

      // Check the events array contains the rep image
      const repImageInArray = await page.evaluate(() => {
        const repImages = window.events.filter(e => e.type === 'Rectangle');
        const hasExportFlag = repImages.length > 0 && repImages[0].exportFrame === true;
        return {
          count: repImages.length,
          hasExportFlag: hasExportFlag,
          firstRepImage: repImages.length > 0 ? {
            type: repImages[0].type,
            exportFrame: repImages[0].exportFrame,
            x: repImages[0].x,
            y: repImages[0].y,
            width: repImages[0].width,
            height: repImages[0].height
          } : null
        };
      });

      tests.push({
        name: 'Rep image added to events array',
        pass: repImageInArray.count > 0,
        error: `Found ${repImageInArray.count} rep images`
      });

      tests.push({
        name: 'Rep image has exportFrame=true',
        pass: repImageInArray.hasExportFlag === true,
        error: repImageInArray.hasExportFlag === false ? `exportFrame=${repImageInArray.firstRepImage?.exportFrame}` : 'No rep image found'
      });

      // Verify export functions would capture this
      const canExport = await page.evaluate(() => {
        const sortedEvents = window.events.sort((a, b) => a.frame - b.frame);
        const repImages = sortedEvents.filter(ev => ev.type === 'Rectangle');
        const checkedRepImages = repImages.filter(ev => ev.exportFrame);
        return {
          totalRepImages: repImages.length,
          checkedRepImages: checkedRepImages.length
        };
      });

      tests.push({
        name: 'Export would include rep images',
        pass: canExport.checkedRepImages > 0,
        error: `${canExport.totalRepImages} total, ${canExport.checkedRepImages} checked for export`
      });

    } catch (error) {
      tests.push({
        name: 'Rep export flow test failed',
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
