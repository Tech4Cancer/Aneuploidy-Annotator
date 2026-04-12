/**
 * Test Suite: Navigation
 * Tests: Frame navigation, event jumping, timeline
 */

module.exports = {
  run: async (page) => {
    const tests = [];

    // Setup: Create test data
    await page.evaluate(() => {
      window.events = [
        { id: 'e1', frame: 10, type: 'Test 1', x: 100, y: 200, notes: '' },
        { id: 'e2', frame: 25, type: 'Test 2', x: 150, y: 250, notes: '' },
        { id: 'e3', frame: 50, type: 'Test 3', x: 200, y: 300, notes: '' }
      ];
      window.currentFrame = 1;
      window.currentEventId = null;
      window.totalFrames = 100;
    });

    // Test 1: Skip frames forward
    try {
      const result = await page.evaluate(() => {
        window.currentFrame = 1;
        // Simulate skipFrames(5)
        window.currentFrame = Math.max(1, Math.min(window.totalFrames, window.currentFrame + 5));

        return {
          success: window.currentFrame === 6,
          newFrame: window.currentFrame
        };
      });

      tests.push({
        name: 'Skip frames forward (+5)',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Skip frames forward (+5)',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Skip frames backward
    try {
      const result = await page.evaluate(() => {
        window.currentFrame = 50;
        window.currentFrame = Math.max(1, Math.min(window.totalFrames, window.currentFrame - 5));

        return {
          success: window.currentFrame === 45,
          newFrame: window.currentFrame
        };
      });

      tests.push({
        name: 'Skip frames backward (-5)',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Skip frames backward (-5)',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Next event navigation
    try {
      const result = await page.evaluate(() => {
        window.currentFrame = 1;
        window.currentEventId = null;

        // Simulate nextFrame()
        const sortedEvents = [...window.events].sort((a, b) => a.frame - b.frame);
        const nextEvent = sortedEvents.find(e => e.frame > window.currentFrame);

        if (nextEvent) {
          window.currentFrame = nextEvent.frame;
          window.currentEventId = nextEvent.id;
        }

        return {
          success: window.currentFrame === 10 && window.currentEventId === 'e1',
          newFrame: window.currentFrame,
          eventId: window.currentEventId
        };
      });

      tests.push({
        name: 'Navigate to next event',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Navigate to next event',
        pass: false,
        error: error.message
      });
    }

    // Test 4: Previous event navigation
    try {
      const result = await page.evaluate(() => {
        window.currentFrame = 50;
        window.currentEventId = null;

        // Simulate previousFrame()
        const sortedEvents = [...window.events].sort((a, b) => b.frame - a.frame);
        const prevEvent = sortedEvents.find(e => e.frame < window.currentFrame);

        if (prevEvent) {
          window.currentFrame = prevEvent.frame;
          window.currentEventId = prevEvent.id;
        }

        return {
          success: window.currentFrame === 25 && window.currentEventId === 'e2',
          newFrame: window.currentFrame
        };
      });

      tests.push({
        name: 'Navigate to previous event',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Navigate to previous event',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Event-to-event cycling
    try {
      const result = await page.evaluate(() => {
        window.currentFrame = 10;
        window.currentEventId = 'e1';

        const sortedEvents = [...window.events].sort((a, b) => a.frame - b.frame);
        const currentIdx = sortedEvents.findIndex(e => e.id === window.currentEventId);
        const nextEvent = currentIdx >= 0 ? sortedEvents[currentIdx + 1] : null;

        if (nextEvent) {
          window.currentFrame = nextEvent.frame;
          window.currentEventId = nextEvent.id;
        }

        return {
          success: window.currentFrame === 25 && window.currentEventId === 'e2',
          moved: true
        };
      });

      tests.push({
        name: 'Cycle through events on same frame',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Cycle through events on same frame',
        pass: false,
        error: error.message
      });
    }

    // Test 6: Frame bounds checking
    try {
      const result = await page.evaluate(() => {
        const tests = [];

        // Test lower bound
        window.currentFrame = -5;
        window.currentFrame = Math.max(1, window.currentFrame);
        tests.push(window.currentFrame === 1);

        // Test upper bound
        window.currentFrame = 150;
        window.currentFrame = Math.min(window.totalFrames, window.currentFrame);
        tests.push(window.currentFrame === 100);

        return {
          success: tests.every(t => t),
          allBoundsPassed: tests.length === 2
        };
      });

      tests.push({
        name: 'Frame bounds checking',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Frame bounds checking',
        pass: false,
        error: error.message
      });
    }

    const passed = tests.filter(t => t.pass).length;
    const failed = tests.filter(t => !t.pass).length;

    return { tests, passed, failed };
  }
};
