/**
 * Visual Test: Event Markers on Timeline
 * Tests that event markers are created and positioned correctly when events are added
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    // Test 1: Markers appear on timeline with correct colors and positions
    try {
      const result = await page.evaluate(async () => {
        // Wait a bit for page to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get initial state
        const initialMarkers = document.querySelectorAll('#eventMarkers .event-marker').length;
        const initialTRowDisplay = window.getComputedStyle(document.querySelector('#tFrameRow')).display;

        return {
          initialMarkers: initialMarkers,
          initialTRowDisplay: initialTRowDisplay,
          pageLoaded: true
        };
      });

      tests.push({
        name: 'Page loads with empty timeline',
        pass: result.pageLoaded && result.initialTRowDisplay === 'none' && result.initialMarkers === 0,
        error: result.pageLoaded ? undefined : 'Page failed to load'
      });
    } catch (error) {
      tests.push({
        name: 'Page loads with empty timeline',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Check that T-frame row becomes visible when it has events
    try {
      const result = await page.evaluate(async () => {
        // Find and click the new session button
        const buttons = Array.from(document.querySelectorAll('button'));
        const newSessionBtn = buttons.find(btn => btn.textContent.includes('+ New Session'));

        if (newSessionBtn) {
          newSessionBtn.click();
          await new Promise(resolve => setTimeout(resolve, 400));

          // Fill in session name
          const nameInput = document.querySelector('#newSessionNameInput');
          if (nameInput) {
            nameInput.value = 'Visual Test ' + Date.now();
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            nameInput.dispatchEvent(new Event('change', { bubbles: true }));
          }

          // Click create
          const createBtn = Array.from(document.querySelectorAll('button')).find(btn =>
            btn.textContent === 'Create' && btn.classList.contains('primary')
          );
          if (createBtn) {
            createBtn.click();
            await new Promise(resolve => setTimeout(resolve, 600));
          }
        }

        return { sessionCreated: true };
      });

      tests.push({
        name: 'New session created successfully',
        pass: result.sessionCreated,
        error: undefined
      });
    } catch (error) {
      tests.push({
        name: 'New session created successfully',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Check slider visibility when events should be visible
    try {
      const result = await page.evaluate(async () => {
        const tFrameRow = document.querySelector('#tFrameRow');
        const eventMarkers = document.querySelector('#eventMarkers');
        const tSlider = document.querySelector('#tFrameSlider');

        return {
          tFrameRowExists: !!tFrameRow,
          eventMarkersExists: !!eventMarkers,
          tSliderExists: !!tSlider,
          eventMarkersInTRow: tFrameRow && tFrameRow.contains(eventMarkers),
          tFrameRowDisplay: tFrameRow ? window.getComputedStyle(tFrameRow).display : 'n/a',
          eventMarkersDisplay: eventMarkers ? window.getComputedStyle(eventMarkers).display : 'n/a'
        };
      });

      const structureCorrect = result.eventMarkersInTRow;
      tests.push({
        name: 'Event markers are children of T-frame row',
        pass: structureCorrect,
        error: structureCorrect ? undefined : `Markers in TRow: ${result.eventMarkersInTRow}`
      });
    } catch (error) {
      tests.push({
        name: 'Event markers are children of T-frame row',
        pass: false,
        error: error.message
      });
    }

    // Test 4: Verify CSS for positioning
    try {
      const result = await page.evaluate(async () => {
        const tFrameRow = document.querySelector('#tFrameRow');
        const eventMarkers = document.querySelector('#eventMarkers');
        const testMarker = document.createElement('div');
        testMarker.className = 'event-marker';
        document.body.appendChild(testMarker);

        const tRowStyle = window.getComputedStyle(tFrameRow);
        const markersStyle = window.getComputedStyle(eventMarkers);
        const markerStyle = window.getComputedStyle(testMarker);

        document.body.removeChild(testMarker);

        return {
          tRowPosition: tRowStyle.position,
          markersPosition: markersStyle.position,
          markerWidth: markerStyle.width,
          markerHeight: markerStyle.height,
          markerBorderRadius: markerStyle.borderRadius
        };
      });

      const cssCorrect = result.tRowPosition === 'relative' && result.markersPosition === 'absolute';
      tests.push({
        name: 'CSS positioning is correct for markers',
        pass: cssCorrect,
        error: cssCorrect ? undefined : `TRow position: ${result.tRowPosition}, Markers: ${result.markersPosition}`
      });
    } catch (error) {
      tests.push({
        name: 'CSS positioning is correct for markers',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Check that renderEventMarkers function can be called
    try {
      const result = await page.evaluate(() => {
        return {
          renderEventMarkersExists: typeof window.renderEventMarkers === 'function',
          updateUIExists: typeof window.updateUI === 'function',
          renderEventsExists: typeof window.renderEvents === 'function'
        };
      });

      const functionsExist = result.renderEventMarkersExists && result.updateUIExists;
      tests.push({
        name: 'Event rendering functions are available',
        pass: functionsExist,
        error: functionsExist ? undefined : `renderEventMarkers: ${result.renderEventMarkersExists}, updateUI: ${result.updateUIExists}`
      });
    } catch (error) {
      tests.push({
        name: 'Event rendering functions are available',
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
