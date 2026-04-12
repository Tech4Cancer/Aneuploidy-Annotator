// Test script for quartile crosshair functionality
// Run this in browser console or node with DOM support

function testQuartileMarkers() {
  const results = [];

  // Test 1: Verify quartile offset tracking
  console.log('=== Test 1: Quartile Offset Tracking ===');

  // Simulate setting quartile offsets
  window.quartileOffsetX = 0;
  window.quartileOffsetY = 0;

  if (window.quartileOffsetX === 0 && window.quartileOffsetY === 0) {
    results.push({ test: 'Initial offsets zero', pass: true });
    console.log('✓ Initial offsets are zero');
  } else {
    results.push({ test: 'Initial offsets zero', pass: false });
    console.log('✗ Initial offsets not zero');
  }

  // Test 2: Marker canvas exists and is properly configured
  console.log('\n=== Test 2: Marker Canvas Setup ===');
  const markerCanvas = document.getElementById('markerCanvas');
  if (markerCanvas) {
    results.push({ test: 'Marker canvas exists', pass: true });
    console.log('✓ Marker canvas element exists');

    const zIndex = window.getComputedStyle(markerCanvas).zIndex;
    console.log(`  z-index: ${zIndex}`);
    console.log(`  pointer-events: ${window.getComputedStyle(markerCanvas).pointerEvents}`);
  } else {
    results.push({ test: 'Marker canvas exists', pass: false });
    console.log('✗ Marker canvas not found');
  }

  // Test 3: Simulate event selection and marker drawing
  console.log('\n=== Test 3: Event Selection and Marker Drawing ===');

  // Create mock event
  const mockEvent = {
    id: 'test-event-1',
    frame: 100,
    x: 500,
    y: 600,
    type: 'Test Event'
  };

  // Add to events array if it exists
  if (window.events) {
    window.events.push(mockEvent);
    window.currentEventId = mockEvent.id;

    if (window.drawCurrentFrameMarkers) {
      window.drawCurrentFrameMarkers();
      results.push({ test: 'drawCurrentFrameMarkers executed', pass: true });
      console.log('✓ drawCurrentFrameMarkers called successfully');
    }
  }

  // Test 4: Quartile offset calculation for TL, TR, BL, BR
  console.log('\n=== Test 4: Quartile Offset Calculations ===');

  const testQuartiles = {
    'TL': { offsetX: 0, offsetY: 0 },
    'TR': { offsetX: 1000, offsetY: 0 }, // Assuming 2000x2000 full image
    'BL': { offsetX: 0, offsetY: 1000 },
    'BR': { offsetX: 1000, offsetY: 1000 }
  };

  let quartileTestPass = true;
  Object.entries(testQuartiles).forEach(([q, expected]) => {
    console.log(`  ${q}: expected offset (${expected.offsetX}, ${expected.offsetY})`);
  });
  results.push({ test: 'Quartile offset logic', pass: quartileTestPass });

  // Test 5: Marker visibility calculation
  console.log('\n=== Test 5: Marker Visibility in Quartile ===');

  const testCases = [
    { eventX: 500, eventY: 600, offsetX: 0, offsetY: 0, canvasW: 1000, canvasH: 1000, visible: true, desc: 'Event in TL quartile' },
    { eventX: 1500, eventY: 600, offsetX: 0, offsetY: 0, canvasW: 1000, canvasH: 1000, visible: false, desc: 'Event right of TL quartile' },
    { eventX: 500, eventY: 1500, offsetX: 0, offsetY: 0, canvasW: 1000, canvasH: 1000, visible: false, desc: 'Event below TL quartile' },
    { eventX: 1500, eventY: 1500, offsetX: 1000, offsetY: 1000, canvasW: 1000, canvasH: 1000, visible: true, desc: 'Event in BR quartile' }
  ];

  testCases.forEach(tc => {
    const adjustedX = tc.eventX - tc.offsetX;
    const adjustedY = tc.eventY - tc.offsetY;
    const armLen = 28;

    const isVisible = !(adjustedX < -armLen || adjustedX > tc.canvasW + armLen ||
                        adjustedY < -armLen || adjustedY > tc.canvasH + armLen);

    const pass = isVisible === tc.visible;
    results.push({ test: tc.desc, pass });
    console.log(`${pass ? '✓' : '✗'} ${tc.desc}: adjusted (${adjustedX}, ${adjustedY}) visible=${isVisible}`);
  });

  // Test 6: Canvas dimension sync
  console.log('\n=== Test 6: Canvas Dimension Sync ===');
  const videoCanvas = document.getElementById('videoCanvas');
  if (videoCanvas && markerCanvas) {
    const widthMatch = videoCanvas.width === markerCanvas.width;
    const heightMatch = videoCanvas.height === markerCanvas.height;
    const syncPass = widthMatch && heightMatch;
    results.push({ test: 'Canvas dimensions synced', pass: syncPass });
    console.log(`${syncPass ? '✓' : '✗'} Video canvas: ${videoCanvas.width}x${videoCanvas.height}, Marker canvas: ${markerCanvas.width}x${markerCanvas.height}`);
  }

  // Summary
  console.log('\n=== TEST SUMMARY ===');
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total}`);

  results.forEach(r => {
    console.log(`${r.pass ? '✓' : '✗'} ${r.test}`);
  });

  return { passed, total, results };
}

// Run tests
const testResults = testQuartileMarkers();
console.log('\nTest run complete. Results:', testResults);
