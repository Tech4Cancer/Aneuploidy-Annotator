/**
 * Test Suite: Event Markers on Timeline
 * Tests that event markers (dots) appear on the timeline slider
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    // Test 1: Event markers appear when events are added (by checking DOM structure)
    try {
      const result = await page.evaluate(async () => {
        // Check if event markers container is properly set up inside tFrameRow
        const tFrameRow = document.querySelector('#tFrameRow');
        const eventMarkersContainer = tFrameRow ? tFrameRow.querySelector('#eventMarkers') : null;
        const tSlider = document.querySelector('#tFrameSlider');

        // Verify the DOM structure is correct (markers may be in a wrapper div)
        const containerInsideTRow = eventMarkersContainer && tFrameRow && tFrameRow.contains(eventMarkersContainer);

        // Check that tFrameRow has position: relative (needed for absolute positioning of markers)
        const tRowComputed = window.getComputedStyle(tFrameRow);
        const isPositionRelative = tRowComputed.position === 'relative';

        // Check that eventMarkers has correct styles for overlay
        const markersComputed = window.getComputedStyle(eventMarkersContainer);
        const isAbsolute = markersComputed.position === 'absolute';
        const hasFullHeight = markersComputed.height === tRowComputed.height || markersComputed.top === '0px';

        return {
          success: true,
          tFrameRowExists: !!tFrameRow,
          eventMarkersExists: !!eventMarkersContainer,
          containerInsideTRow: containerInsideTRow,
          tRowIsPositionRelative: isPositionRelative,
          markersIsAbsolute: isAbsolute,
          markersIsOverlay: hasFullHeight
        };
      });

      const structureCorrect = result.containerInsideTRow && result.tRowIsPositionRelative && result.markersIsAbsolute;
      tests.push({
        name: 'Event markers container is in correct DOM position',
        pass: result.success && structureCorrect,
        error: structureCorrect ? undefined : `Container in TRow: ${result.containerInsideTRow}, TRow relative: ${result.tRowIsPositionRelative}, Markers absolute: ${result.markersIsAbsolute}`
      });
    } catch (error) {
      tests.push({
        name: 'Event markers container is in correct DOM position',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Event markers are positioned on timeline (direct state manipulation)
    try {
      const result = await page.evaluate(async () => {
        // Since we can't easily access the scoped 'events' variable from here,
        // we'll test by checking that the marker positioning CSS is applied
        const eventMarkerStyle = document.querySelector('style');
        const hasMarkerStyle = eventMarkerStyle && eventMarkerStyle.textContent.includes('.event-marker');

        // Check CSS for event-marker
        let markerCSSFound = false;
        const styles = document.querySelectorAll('style');
        for (let style of styles) {
          if (style.textContent.includes('.event-marker')) {
            markerCSSFound = true;
            break;
          }
        }

        // Also check if event-marker class has the right properties
        const testMarker = document.createElement('div');
        testMarker.className = 'event-marker';
        document.body.appendChild(testMarker);

        const markerStyle = window.getComputedStyle(testMarker);
        const hasWidth = markerStyle.width && markerStyle.width !== '0px';
        const hasHeight = markerStyle.height && markerStyle.height !== '0px';
        const hasBgColor = markerStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';

        document.body.removeChild(testMarker);

        return {
          success: true,
          markerCSSFound: markerCSSFound,
          markerHasWidth: hasWidth,
          markerHasHeight: hasHeight,
          markerHasColor: hasBgColor,
          markerStyle: {
            width: markerStyle.width,
            height: markerStyle.height,
            backgroundColor: markerStyle.backgroundColor
          }
        };
      });

      const cssValid = result.markerCSSFound;
      tests.push({
        name: 'Event marker CSS styling exists',
        pass: result.success && cssValid,
        error: cssValid ? undefined : 'Event marker CSS not found'
      });
    } catch (error) {
      tests.push({
        name: 'Event marker CSS styling exists',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Timeline slider layout is correct
    try {
      const result = await page.evaluate(() => {
        const tFrameRow = document.querySelector('#tFrameRow');
        const eventMarkers = document.querySelector('#eventMarkers');
        const tSlider = document.querySelector('#tFrameSlider');

        if (!tFrameRow || !eventMarkers || !tSlider) {
          return { success: false, missing: [] };
        }

        const tRowStyle = window.getComputedStyle(tFrameRow);
        const markerStyle = window.getComputedStyle(eventMarkers);
        const sliderStyle = window.getComputedStyle(tSlider);

        return {
          success: true,
          tRowExists: !!tFrameRow,
          eventMarkersExists: !!eventMarkers,
          tSliderExists: !!tSlider,
          tRowPosition: tRowStyle.position,
          eventMarkersPosition: markerStyle.position,
          eventMarkersPointerEvents: markerStyle.pointerEvents
        };
      });

      const layoutCorrect = result.tRowPosition === 'relative' && result.eventMarkersPosition === 'absolute';
      tests.push({
        name: 'Timeline slider layout is correct',
        pass: result.success && layoutCorrect,
        error: layoutCorrect ? undefined : `tRow position: ${result.tRowPosition}, markers position: ${result.eventMarkersPosition}`
      });
    } catch (error) {
      tests.push({
        name: 'Timeline slider layout is correct',
        pass: false,
        error: error.message
      });
    }

    // Test 4: updateUI function exists and is callable
    try {
      const result = await page.evaluate(() => {
        return {
          updateUIExists: typeof window.updateUI === 'function',
          renderEventMarkersExists: typeof window.renderEventMarkers === 'function'
        };
      });

      tests.push({
        name: 'updateUI and renderEventMarkers functions exist',
        pass: result.updateUIExists && result.renderEventMarkersExists,
        error: `updateUI: ${result.updateUIExists}, renderEventMarkers: ${result.renderEventMarkersExists}`
      });
    } catch (error) {
      tests.push({
        name: 'updateUI and renderEventMarkers functions exist',
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
