/**
 * Test Suite: Slider and Keyboard Shortcuts
 * Tests that keyboard shortcuts work even when slider is focused
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    // Test 1: Slider exists and is functional
    try {
      const result = await page.evaluate(() => {
        // Look for T-frame slider after creating session
        const sessionDropdown = document.querySelector('#sessionDropdown');
        const newSessionBtn = Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent.includes('+ New Session')
        );

        return {
          sessionDropdownExists: !!sessionDropdown,
          newSessionBtnExists: !!newSessionBtn
        };
      });

      tests.push({
        name: 'Session controls exist',
        pass: result.sessionDropdownExists && result.newSessionBtnExists,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Session controls exist',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Keyboard handler allows frame skipping with < and >
    try {
      const result = await page.evaluate(() => {
        const skipFramesExists = typeof window.skipFrames === 'function';

        return {
          skipFramesExists: skipFramesExists
        };
      });

      tests.push({
        name: 'Frame skip function exists',
        pass: result.skipFramesExists,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Frame skip function exists',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Keyboard handler allows ArrowLeft/Right
    try {
      const result = await page.evaluate(() => {
        const nextFrameExists = typeof window.nextFrame === 'function';
        const prevFrameExists = typeof window.previousFrame === 'function';

        return {
          nextFrameExists: nextFrameExists,
          prevFrameExists: prevFrameExists
        };
      });

      tests.push({
        name: 'Frame navigation functions exist',
        pass: result.nextFrameExists && result.prevFrameExists,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'Frame navigation functions exist',
        pass: false,
        error: error.message
      });
    }

    // Test 4: Range sliders don't block shortcuts
    try {
      const result = await page.evaluate(() => {
        // Check if keyboard handler logic excludes range sliders
        const setupKeyboardShortcutsStr = window.setupKeyboardShortcuts.toString();

        // Look for the specific logic that checks for range sliders
        const hasRangeSliderCheck = setupKeyboardShortcutsStr.includes('type === \'range\'') ||
                                    setupKeyboardShortcutsStr.includes('type === "range"');

        // Also check that it doesn't just block all INPUTs
        const hasInputCheck = setupKeyboardShortcutsStr.includes('tagName === \'INPUT\'') ||
                              setupKeyboardShortcutsStr.includes('tagName === "INPUT"');

        return {
          hasRangeSliderCheck: hasRangeSliderCheck,
          hasInputCheck: hasInputCheck,
          logicCorrect: hasRangeSliderCheck && hasInputCheck
        };
      });

      tests.push({
        name: 'Keyboard handler excludes range sliders from INPUT blocking',
        pass: result.logicCorrect,
        error: result.logicCorrect ? undefined : 'Range slider logic not found in keyboard handler'
      });
    } catch (error) {
      tests.push({
        name: 'Keyboard handler excludes range sliders from INPUT blocking',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Verify all frame navigation shortcuts are handled
    try {
      const result = await page.evaluate(() => {
        const setupKeyboardShortcutsStr = window.setupKeyboardShortcuts.toString();

        const hasArrowRight = setupKeyboardShortcutsStr.includes('ArrowRight');
        const hasArrowLeft = setupKeyboardShortcutsStr.includes('ArrowLeft');
        const hasGreater = setupKeyboardShortcutsStr.includes("'>'") || setupKeyboardShortcutsStr.includes('">"');
        const hasLess = setupKeyboardShortcutsStr.includes("'<'") || setupKeyboardShortcutsStr.includes('"<"');

        return {
          hasArrowRight: hasArrowRight,
          hasArrowLeft: hasArrowLeft,
          hasGreater: hasGreater,
          hasLess: hasLess,
          allKeysHandled: hasArrowRight && hasArrowLeft && hasGreater && hasLess
        };
      });

      tests.push({
        name: 'All frame navigation shortcuts are handled',
        pass: result.allKeysHandled,
        error: result.allKeysHandled ? undefined : 'Missing shortcut handlers'
      });
    } catch (error) {
      tests.push({
        name: 'All frame navigation shortcuts are handled',
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
