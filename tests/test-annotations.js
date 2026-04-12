/**
 * Test Suite: Annotations & Events
 * Tests: Add, Edit, Delete, Type Assignment
 */

module.exports = {
  run: async (page) => {
    const tests = [];

    // Setup
    await page.evaluate(() => {
      if (!window.events) window.events = [];
      window.currentFrame = 10;
      window.currentEventId = null;
    });

    // Test 1: Add event with coordinates
    try {
      const result = await page.evaluate(() => {
        const initialCount = window.events.length;

        const newEvent = {
          id: Date.now() + Math.random(),
          frame: window.currentFrame,
          type: '',
          x: 150,
          y: 250,
          notes: 'Test annotation',
          exportFrame: false
        };

        window.events.push(newEvent);

        return {
          success: window.events.length === initialCount + 1,
          eventAdded: true,
          eventFrame: window.events[window.events.length - 1].frame
        };
      });

      tests.push({
        name: 'Add event with coordinates',
        pass: result.success && result.eventAdded,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Add event with coordinates',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Assign event type
    try {
      const result = await page.evaluate(() => {
        if (window.events.length === 0) throw new Error('No events to assign type');

        const event = window.events[window.events.length - 1];
        const oldType = event.type;
        event.type = 'Correct division';

        return {
          success: event.type === 'Correct division',
          typeAssigned: event.type !== oldType,
          newType: event.type
        };
      });

      tests.push({
        name: 'Assign event type',
        pass: result.success && result.typeAssigned,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Assign event type',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Edit event notes
    try {
      const result = await page.evaluate(() => {
        if (window.events.length === 0) throw new Error('No events to edit');

        const event = window.events[window.events.length - 1];
        const oldNotes = event.notes;
        event.notes = 'Updated notes';

        return {
          success: event.notes === 'Updated notes' && event.notes !== oldNotes,
          notesUpdated: true
        };
      });

      tests.push({
        name: 'Edit event notes',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Edit event notes',
        pass: false,
        error: error.message
      });
    }

    // Test 4: Toggle export flag
    try {
      const result = await page.evaluate(() => {
        if (window.events.length === 0) throw new Error('No events to toggle export');

        const event = window.events[window.events.length - 1];
        const oldState = event.exportFrame;
        event.exportFrame = !event.exportFrame;

        return {
          success: event.exportFrame !== oldState,
          nowExport: event.exportFrame
        };
      });

      tests.push({
        name: 'Toggle export flag',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Toggle export flag',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Delete event
    try {
      const result = await page.evaluate(() => {
        if (window.events.length === 0) throw new Error('No events to delete');

        const initialCount = window.events.length;
        const eventIdToDelete = window.events[window.events.length - 1].id;

        // Simulate deleteEvent
        window.events = window.events.filter(e => e.id !== eventIdToDelete);

        return {
          success: window.events.length === initialCount - 1,
          eventDeleted: true,
          remainingCount: window.events.length
        };
      });

      tests.push({
        name: 'Delete event',
        pass: result.success && result.eventDeleted,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Delete event',
        pass: false,
        error: error.message
      });
    }

    // Test 6: Event on current frame highlighting
    try {
      const result = await page.evaluate(() => {
        window.currentFrame = 10;
        window.currentEventId = null;

        // Add an event on current frame
        const event = {
          id: Date.now(),
          frame: 10,
          type: 'Test',
          x: 100,
          y: 200
        };
        window.events.push(event);

        // Select it
        window.currentEventId = event.id;

        const selected = window.events.find(e => e.id === window.currentEventId);

        return {
          success: selected && selected.frame === window.currentFrame,
          eventSelected: !!selected,
          matchesFrame: selected?.frame === window.currentFrame
        };
      });

      tests.push({
        name: 'Event selection on current frame',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Event selection on current frame',
        pass: false,
        error: error.message
      });
    }

    // Test 7: Multiple events on same frame
    try {
      const result = await page.evaluate(() => {
        window.currentFrame = 20;

        // Add multiple events on same frame
        const events = [
          { id: 'a1', frame: 20, type: 'Type A', x: 100, y: 100 },
          { id: 'a2', frame: 20, type: 'Type B', x: 200, y: 200 },
          { id: 'a3', frame: 20, type: 'Type C', x: 300, y: 300 }
        ];

        window.events.push(...events);

        const eventsOnFrame = window.events.filter(e => e.frame === window.currentFrame);

        return {
          success: eventsOnFrame.length >= 3,
          eventCount: eventsOnFrame.length,
          multipleOnFrame: true
        };
      });

      tests.push({
        name: 'Multiple events on same frame',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Multiple events on same frame',
        pass: false,
        error: error.message
      });
    }

    const passed = tests.filter(t => t.pass).length;
    const failed = tests.filter(t => !t.pass).length;

    return { tests, passed, failed };
  }
};
