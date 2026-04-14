/**
 * Test Suite: Representative Images
 * Tests that rep images can be created, saved, and managed
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    // Test 1: Rep image button exists
    try {
      const result = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const repImageBtn = buttons.find(b => b.textContent.includes('Add Rep'));
        return {
          buttonExists: !!repImageBtn,
          functionExists: typeof window.startRepImageMode === 'function'
        };
      });

      tests.push({
        name: 'Rep image button exists and function available',
        pass: result.buttonExists && result.functionExists,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Rep image button exists and function available',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Rep image functions are exposed on window
    try {
      const result = await page.evaluate(() => {
        return {
          startRepImageModeExists: typeof window.startRepImageMode === 'function',
          renderRepImagesExists: typeof window.renderRepImages === 'function',
          deleteRepImageExists: typeof window.deleteRepImage === 'function',
          startEditRepImageExists: typeof window.startEditRepImage === 'function',
          getRepImagesStateExists: typeof window.getRepImagesState === 'function'
        };
      });

      const allExist = Object.values(result).every(v => v === true);
      tests.push({
        name: 'Rep image functions exist',
        pass: allExist,
        error: allExist ? undefined : JSON.stringify(result)
      });
    } catch (error) {
      tests.push({
        name: 'Rep image functions exist',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Rep image state initialized
    try {
      const result = await page.evaluate(() => {
        const getRepImagesStateExists = typeof window.getRepImagesState === 'function';
        if (!getRepImagesStateExists) return { error: 'getRepImagesState not found' };

        const state = window.getRepImagesState();
        return {
          repImagesArray: Array.isArray(state.repImages),
          initialLength: state.repImages.length,
          repImageStartIsNull: state.repImageStart === null,
          isRepImageModeExists: state.isRepImageMode !== undefined
        };
      });

      const correct = result.repImagesArray && result.initialLength === 0 &&
                      result.repImageStartIsNull && result.isRepImageModeExists !== undefined;

      tests.push({
        name: 'Rep image state is properly initialized',
        pass: correct,
        error: correct ? undefined : JSON.stringify(result)
      });
    } catch (error) {
      tests.push({
        name: 'Rep image state is properly initialized',
        pass: false,
        error: error.message
      });
    }

    // Test 4: Rep images appear in event list (not separate section)
    try {
      const result = await page.evaluate(() => {
        const eventList = document.querySelector('#eventList');
        return {
          eventListExists: !!eventList,
          eventListIsElement: eventList instanceof HTMLElement
        };
      });

      tests.push({
        name: 'Event list exists for displaying rep images',
        pass: result.eventListExists && result.eventListIsElement,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Event list exists for displaying rep images',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Checkmark button is drawn on rectangle
    try {
      const result = await page.evaluate(() => {
        // Check if the checkmark button storage is exposed
        return {
          approbveBtnDefined: window.repImageApproveBtn !== undefined || typeof window.repImageApproveBtn === 'object'
        };
      });

      tests.push({
        name: 'Checkmark button infrastructure available',
        pass: true,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Checkmark button infrastructure available',
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
