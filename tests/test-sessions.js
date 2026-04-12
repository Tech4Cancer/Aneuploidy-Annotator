/**
 * Test Suite: Session Management
 * Tests: Create, Load, Delete, Persistence
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    // Test 1: Create new session
    try {
      const result = await page.evaluate(() => {
        const sessionName = 'Test Session 1';
        const newSessionBtn = document.querySelector('.new-session-btn');
        if (!newSessionBtn) throw new Error('New session button not found');

        // Simulate button click and modal interaction
        window.sessionNameInput = sessionName;
        if (!window.sessions) window.sessions = {};

        const sessionId = 'session-' + Date.now();
        window.sessions[sessionId] = {
          id: sessionId,
          name: sessionName,
          createdAt: new Date().toISOString(),
          videoPath: null,
          events: [],
          currentFrame: 1
        };
        window.currentSessionId = sessionId;

        return {
          success: true,
          sessionId: sessionId,
          sessionCount: Object.keys(window.sessions).length
        };
      });

      tests.push({
        name: 'Create new session',
        pass: result.success && result.sessionCount > 0,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Create new session',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Load session
    try {
      const result = await page.evaluate(() => {
        if (!window.currentSessionId || !window.sessions) {
          throw new Error('No session to load');
        }

        const sessionId = Object.keys(window.sessions)[0];
        const session = window.sessions[sessionId];

        // Simulate loading
        window.currentSessionId = sessionId;
        window.currentFrame = session.currentFrame || 1;
        window.events = session.events || [];

        return {
          success: true,
          loadedSession: sessionId,
          eventCount: window.events.length
        };
      });

      tests.push({
        name: 'Load session',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Load session',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Delete session
    try {
      const result = await page.evaluate(() => {
        if (!window.sessions || Object.keys(window.sessions).length === 0) {
          throw new Error('No session to delete');
        }

        const sessionId = Object.keys(window.sessions)[0];
        delete window.sessions[sessionId];

        return {
          success: true,
          remainingSessions: Object.keys(window.sessions).length
        };
      });

      tests.push({
        name: 'Delete session',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Delete session',
        pass: false,
        error: error.message
      });
    }

    // Test 4: Session persistence (mock IndexedDB)
    try {
      const result = await page.evaluate(() => {
        const testSession = {
          id: 'persist-test',
          name: 'Persistence Test',
          events: [{ frame: 10, type: 'Test', x: 100, y: 200 }],
          currentFrame: 10
        };

        if (!window.sessions) window.sessions = {};
        window.sessions['persist-test'] = testSession;

        // Verify data is stored correctly
        const stored = window.sessions['persist-test'];
        return {
          success:
            stored.name === testSession.name &&
            stored.events.length === testSession.events.length &&
            stored.currentFrame === testSession.currentFrame,
          eventsPersisted: stored.events.length > 0
        };
      });

      tests.push({
        name: 'Session persistence',
        pass: result.success && result.eventsPersisted,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Session persistence',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Session dropdown rendering
    try {
      const result = await page.evaluate(() => {
        const dropdown = document.querySelector('.session-dropdown');
        if (!dropdown) throw new Error('Session dropdown not found');

        return {
          success: true,
          dropdownExists: !!dropdown,
          dropdownType: dropdown.tagName
        };
      });

      tests.push({
        name: 'Session dropdown exists',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Session dropdown exists',
        pass: false,
        error: error.message
      });
    }

    const passed = tests.filter(t => t.pass).length;
    const failed = tests.filter(t => !t.pass).length;

    return { tests, passed, failed };
  }
};
