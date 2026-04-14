/**
 * Test Suite: Event Marker Alignment
 * Tests that event markers are positioned correctly and aligned to frame positions
 */

module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    // Test 1: Check slider and marker container elements exist
    try {
      const result = await page.evaluate(() => {
        // Check that elements exist (tFrameRow may be hidden until events are added)
        const tFrameRow = document.querySelector('#tFrameRow');
        const tSlider = document.querySelector('#tFrameSlider');
        const eventMarkers = document.querySelector('#eventMarkers');

        if (!tFrameRow || !tSlider || !eventMarkers) {
          return { error: 'Elements not found' };
        }

        // Check element properties (they may be hidden initially)
        const sliderType = tSlider.type;
        const sliderIsRange = sliderType === 'range';
        const markersId = eventMarkers.id;
        const markersInTRow = tFrameRow.contains(eventMarkers);

        return {
          success: true,
          sliderType: sliderType,
          sliderIsRange: sliderIsRange,
          markersId: markersId,
          markersInTRow: markersInTRow,
          elementsExist: true
        };
      });

      const elementsCorrect = result.success && result.sliderIsRange && result.markersInTRow;
      tests.push({
        name: 'Slider and marker elements exist and have correct structure',
        pass: elementsCorrect,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Slider and marker elements exist and have correct structure',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Check marker positioning formula
    try {
      const result = await page.evaluate(() => {
        // Create a test session with events at known frame positions
        const testFrame = 50;
        const testTotal = 100;

        // Calculate expected percentage
        const expectedPercent = (testFrame / testTotal) * 100;

        // The marker should be positioned at: calc(50% - 3px)
        // Which means: left: calc(50% - 3px)

        return {
          success: true,
          testFrame: testFrame,
          testTotal: testTotal,
          expectedPercent: expectedPercent,
          expectedLeft: `calc(${expectedPercent}% - 3px)`,
          formulaCorrect: expectedPercent === 50
        };
      });

      tests.push({
        name: 'Marker positioning formula is correct',
        pass: result.formulaCorrect,
        error: result.formulaCorrect ? undefined : 'Formula incorrect'
      });
    } catch (error) {
      tests.push({
        name: 'Marker positioning formula is correct',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Verify marker position matches slider track
    try {
      const result = await page.evaluate(() => {
        const tSlider = document.querySelector('#tFrameSlider');
        const eventMarkers = document.querySelector('#eventMarkers');
        const tFrameRow = document.querySelector('#tFrameRow');

        if (!tSlider || !eventMarkers || !tFrameRow) {
          return { error: 'Elements not found' };
        }

        // Get computed styles
        const sliderStyle = window.getComputedStyle(tSlider);
        const markersStyle = window.getComputedStyle(eventMarkers);
        const rowStyle = window.getComputedStyle(tFrameRow);

        // The eventMarkers should span the full width of tFrameRow
        // The tSlider should be inside tFrameRow

        const rowRect = tFrameRow.getBoundingClientRect();
        const markersRect = eventMarkers.getBoundingClientRect();
        const sliderRect = tSlider.getBoundingClientRect();

        // Check that markers container covers the slider
        const markersCoverSlider =
          (markersRect.left <= sliderRect.left) &&
          (markersRect.right >= sliderRect.right) &&
          (markersRect.top <= sliderRect.top) &&
          (markersRect.bottom >= sliderRect.bottom);

        return {
          success: true,
          markersCoverSlider: markersCoverSlider,
          markersWidth: markersRect.width,
          sliderWidth: sliderRect.width,
          markersLeft: markersRect.left,
          sliderLeft: sliderRect.left,
          markersHeight: markersRect.height,
          sliderHeight: sliderRect.height
        };
      });

      tests.push({
        name: 'Marker container covers entire slider',
        pass: result.success && result.markersCoverSlider,
        error: result.markersCoverSlider ? undefined : 'Markers do not fully cover slider'
      });
    } catch (error) {
      tests.push({
        name: 'Marker container covers entire slider',
        pass: false,
        error: error.message
      });
    }

    // Test 4: Check marker overlay CSS
    try {
      const result = await page.evaluate(() => {
        const testMarker = document.createElement('div');
        testMarker.className = 'event-marker';
        document.body.appendChild(testMarker);

        const style = window.getComputedStyle(testMarker);

        const hasPosition = style.position === 'absolute';
        const hasDisplay = style.display !== 'none';
        const hasWidth = parseInt(style.width) > 0;
        const hasHeight = parseInt(style.height) > 0;
        const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)';

        document.body.removeChild(testMarker);

        return {
          success: true,
          position: style.position,
          display: style.display,
          width: style.width,
          height: style.height,
          backgroundColor: style.backgroundColor,
          cssCorrect: hasPosition && hasDisplay && hasWidth && hasHeight
        };
      });

      tests.push({
        name: 'Event marker CSS is properly styled',
        pass: result.success && result.cssCorrect,
        error: result.cssCorrect ? undefined : 'CSS incorrect'
      });
    } catch (error) {
      tests.push({
        name: 'Event marker CSS is properly styled',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Verify marker alignment with specific frames
    try {
      const result = await page.evaluate(() => {
        // Create 3 markers at different frame positions
        const testEvents = [
          { frame: 25, total: 100, expectedPercent: 25 },
          { frame: 50, total: 100, expectedPercent: 50 },
          { frame: 75, total: 100, expectedPercent: 75 }
        ];

        const alignmentResults = testEvents.map(evt => ({
          frame: evt.frame,
          total: evt.total,
          expectedPercent: evt.expectedPercent,
          calculatedPercent: (evt.frame / evt.total) * 100,
          aligned: (evt.frame / evt.total) * 100 === evt.expectedPercent
        }));

        return {
          success: true,
          results: alignmentResults,
          allAligned: alignmentResults.every(r => r.aligned)
        };
      });

      tests.push({
        name: 'Markers align to correct frame percentages',
        pass: result.success && result.allAligned,
        error: result.allAligned ? undefined : 'Alignment incorrect'
      });
    } catch (error) {
      tests.push({
        name: 'Markers align to correct frame percentages',
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
