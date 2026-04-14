/**
 * Test Suite: Representative Images
 * Tests that rep images can be created, saved, and managed
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    // Test 1: Rep images section exists and is initially collapsed
    try {
      const result = await page.evaluate(() => {
        const section = document.querySelector('.rep-images-section');
        const list = document.querySelector('#repImagesList');
        const toggle = document.querySelector('#repImagesToggle');

        return {
          sectionExists: !!section,
          listExists: !!list,
          toggleExists: !!toggle,
          initiallyHidden: list.style.display === 'none'
        };
      });

      tests.push({
        name: 'Rep images section exists and is initially collapsed',
        pass: result.sectionExists && result.listExists && result.toggleExists && result.initiallyHidden,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Rep images section exists and is initially collapsed',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Rep image toggle functionality
    try {
      const result = await page.evaluate(async () => {
        // Click toggle to expand
        document.querySelector('#repImagesToggle').click();
        await new Promise(r => setTimeout(r, 100));

        const list = document.querySelector('#repImagesList');
        const isExpanded = list.style.display === 'flex';

        // Click toggle to collapse
        document.querySelector('#repImagesToggle').click();
        await new Promise(r => setTimeout(r, 100));

        const isCollapsed = list.style.display === 'none';

        return {
          expandWorks: isExpanded,
          collapseWorks: isCollapsed
        };
      });

      tests.push({
        name: 'Rep images section toggle works',
        pass: result.expandWorks && result.collapseWorks,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Rep images section toggle works',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Rep image functions exist
    try {
      const result = await page.evaluate(() => {
        return {
          startRepImageModeExists: typeof window.startRepImageMode === 'function',
          renderRepImagesExists: typeof window.renderRepImages === 'function',
          saveRepImageExists: typeof window.saveRepImage === 'function',
          deleteRepImageExists: typeof window.deleteRepImage === 'function'
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

    // Test 4: Rep image state initialized
    try {
      const result = await page.evaluate(() => {
        // Rep images are defined in script scope, check via functions
        const renderRepImagesExists = typeof window.renderRepImages === 'function';
        const repImagesCountElement = document.querySelector('#repImageCount');

        return {
          renderRepImagesExists: renderRepImagesExists,
          repImageCountElementExists: !!repImagesCountElement,
          repImageCountText: repImagesCountElement ? repImagesCountElement.textContent : 'not found'
        };
      });

      const correct = result.renderRepImagesExists && result.repImageCountElementExists &&
                      result.repImageCountText === '(0)';

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

    // Test 5: Representative Image button exists
    try {
      const result = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.includes('Representative Image')
        );
        return {
          buttonExists: !!btn,
          buttonClickable: btn ? btn.onclick !== null || btn.hasAttribute('onclick') : false
        };
      });

      tests.push({
        name: 'Representative Image button exists and is clickable',
        pass: result.buttonExists && result.buttonClickable,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Representative Image button exists and is clickable',
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
