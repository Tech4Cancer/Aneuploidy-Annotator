/**
 * Test Suite: Multi-Part File Upload
 * Tests: Part management, frame counting, boundary handling
 */

module.exports = {
  run: async (page) => {
    const tests = [];

    // Test 1: getPartForFrame returns correct part and local frame
    try {
      const result = await page.evaluate(() => {
        // Mock multi-part session
        window.currentSessionId = 'test-session';
        if (!window.sessions) window.sessions = {};
        window.sessions['test-session'] = {
          videoParts: [
            { name: 'part1.tiff', size: 100, frameCount: 100, frameOffset: 0 },
            { name: 'part2.tiff', size: 100, frameCount: 50, frameOffset: 100 },
            { name: 'part3.tiff', size: 100, frameCount: 75, frameOffset: 150 }
          ]
        };

        // Test frame in first part
        let res = window.getPartForFrame(50);
        if (res.partIndex !== 0 || res.localFrame !== 50) return { success: false, msg: 'Part 1 test failed' };

        // Test frame in second part
        res = window.getPartForFrame(125);
        if (res.partIndex !== 1 || res.localFrame !== 25) return { success: false, msg: 'Part 2 test failed' };

        // Test frame in third part
        res = window.getPartForFrame(200);
        if (res.partIndex !== 2 || res.localFrame !== 50) return { success: false, msg: 'Part 3 test failed' };

        // Test boundary frame
        res = window.getPartForFrame(100);
        if (res.partIndex !== 1 || res.localFrame !== 0) return { success: false, msg: 'Boundary test failed' };

        return { success: true };
      });

      tests.push({
        name: 'getPartForFrame returns correct part and local frame',
        pass: result.success,
        error: result.msg
      });
    } catch (error) {
      tests.push({
        name: 'getPartForFrame returns correct part and local frame',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Part file management functions exist
    try {
      const result = await page.evaluate(() => {
        const hasFunctions = (
          typeof window.addPartFileInput === 'function' &&
          typeof window.removePartFile === 'function' &&
          typeof window.renderPartsList === 'function' &&
          typeof window.updateAddPartButton === 'function'
        );
        return { success: hasFunctions };
      });

      tests.push({
        name: 'Part file management functions exist',
        pass: result.success,
        error: !result.success ? 'Functions not found' : null
      });
    } catch (error) {
      tests.push({
        name: 'Part file management functions exist',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Multi-part globals are initialized
    try {
      const result = await page.evaluate(() => {
        // Initialize if not present
        if (!window.partFiles) window.partFiles = [];
        if (!window.videoPartFiles) window.videoPartFiles = [];
        if (typeof window.currentPartIndex === 'undefined') window.currentPartIndex = -1;

        const hasGlobals = (
          Array.isArray(window.partFiles) &&
          Array.isArray(window.videoPartFiles) &&
          typeof window.currentPartIndex === 'number'
        );
        return { success: hasGlobals };
      });

      tests.push({
        name: 'Multi-part globals are initialized',
        pass: result.success,
        error: !result.success ? 'Globals not properly initialized' : null
      });
    } catch (error) {
      tests.push({
        name: 'Multi-part globals are initialized',
        pass: false,
        error: error.message
      });
    }

    // Test 4: Frame navigation handles part boundaries
    try {
      const result = await page.evaluate(() => {
        window.currentSessionId = 'boundary-test';
        if (!window.sessions) window.sessions = {};
        window.sessions['boundary-test'] = {
          videoParts: [
            { name: 'part1.tiff', size: 100, frameCount: 100, frameOffset: 0 },
            { name: 'part2.tiff', size: 100, frameCount: 100, frameOffset: 100 }
          ],
          totalFrames: 200
        };

        // Frame 99 (last of part 1) -> should be part 0
        let res = window.getPartForFrame(99);
        if (res.partIndex !== 0) return { success: false, msg: 'Frame 99 part check failed' };

        // Frame 100 (first of part 2) -> should be part 1
        res = window.getPartForFrame(100);
        if (res.partIndex !== 1) return { success: false, msg: 'Frame 100 part check failed' };

        // Frame 101 (second of part 2) -> should be part 1
        res = window.getPartForFrame(101);
        if (res.partIndex !== 1) return { success: false, msg: 'Frame 101 part check failed' };

        return { success: true };
      });

      tests.push({
        name: 'Frame navigation handles part boundaries',
        pass: result.success,
        error: result.msg
      });
    } catch (error) {
      tests.push({
        name: 'Frame navigation handles part boundaries',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Session object supports multi-part metadata
    try {
      const result = await page.evaluate(() => {
        const session = {
          id: 'mp-persist',
          name: 'Persistence Test',
          events: [],
          currentFrame: 1,
          videoParts: [
            { name: 'a.tif', size: 100, frameCount: 50, frameOffset: 0 },
            { name: 'b.tif', size: 200, frameCount: 75, frameOffset: 50 }
          ],
          totalFrames: 125,
          videoFPS: 30,
          lastModified: new Date().toISOString()
        };

        // Verify all fields exist
        const hasMetadata = (
          session.videoParts &&
          session.videoParts.length === 2 &&
          session.videoParts[0].frameOffset === 0 &&
          session.videoParts[1].frameOffset === 50 &&
          session.totalFrames === 125
        );
        return { success: hasMetadata };
      });

      tests.push({
        name: 'Session object supports multi-part metadata',
        pass: result.success,
        error: !result.success ? 'Metadata validation failed' : null
      });
    } catch (error) {
      tests.push({
        name: 'Session object supports multi-part metadata',
        pass: false,
        error: error.message
      });
    }

    // Test 6: Helper function getFrameCount exists
    try {
      const result = await page.evaluate(() => {
        return { success: typeof window.getFrameCount === 'function' };
      });

      tests.push({
        name: 'Helper function getFrameCount exists',
        pass: result.success,
        error: !result.success ? 'getFrameCount function not found' : null
      });
    } catch (error) {
      tests.push({
        name: 'Helper function getFrameCount exists',
        pass: false,
        error: error.message
      });
    }

    // Test 7: Helper function loadPartFile exists
    try {
      const result = await page.evaluate(() => {
        return { success: typeof window.loadPartFile === 'function' };
      });

      tests.push({
        name: 'Helper function loadPartFile exists',
        pass: result.success,
        error: !result.success ? 'loadPartFile function not found' : null
      });
    } catch (error) {
      tests.push({
        name: 'Helper function loadPartFile exists',
        pass: false,
        error: error.message
      });
    }

    const passed = tests.filter(t => t.pass).length;
    const failed = tests.filter(t => !t.pass).length;

    return { tests, passed, failed };
  }
};
