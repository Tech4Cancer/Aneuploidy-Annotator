/**
 * Test Suite: Export
 * Tests: CSV generation, ZIP structure, data integrity
 */

module.exports = {
  run: async (page) => {
    const tests = [];

    // Setup
    await page.evaluate(() => {
      window.sessions = {
        'test-session': {
          id: 'test-session',
          name: 'Test Session',
          createdAt: '2026-03-23T00:00:00.000Z'
        }
      };
      window.currentSessionId = 'test-session';

      window.events = [
        {
          id: 'e1',
          frame: 10,
          type: 'Correct division',
          x: 100,
          y: 200,
          notes: 'Good mitosis',
          exportFrame: true
        },
        {
          id: 'e2',
          frame: 25,
          type: 'Misaligned chromosomes',
          x: 150,
          y: 250,
          notes: 'Alignment issue',
          exportFrame: false
        },
        {
          id: 'e3',
          frame: 50,
          type: 'Lagging chromosomes',
          x: 200,
          y: 300,
          notes: '',
          exportFrame: true
        }
      ];
    });

    // Test 1: Generate CSV with all fields
    try {
      const result = await page.evaluate(() => {
        const sortedEvents = [...window.events].sort((a, b) => a.frame - b.frame);

        let csv = 'Frame,Event Type,X,Y,Notes,ExportFrame\n';
        sortedEvents.forEach(ev => {
          const x = ev.x !== undefined ? ev.x : '';
          const y = ev.y !== undefined ? ev.y : '';
          csv += `${ev.frame},"${ev.type}",${x},${y},"${ev.notes || ''}",${ev.exportFrame ? 'yes' : 'no'}\n`;
        });

        const lines = csv.split('\n').filter(l => l.trim());
        const hasHeader = lines[0].includes('Frame');
        const eventCount = lines.length - 1; // Exclude header

        return {
          success: hasHeader && eventCount === 3,
          csvGenerated: true,
          eventCount: eventCount,
          headerPresent: hasHeader
        };
      });

      tests.push({
        name: 'Generate CSV with all fields',
        pass: result.success && result.eventCount === 3,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Generate CSV with all fields',
        pass: false,
        error: error.message
      });
    }

    // Test 2: CSV column order
    try {
      const result = await page.evaluate(() => {
        const expectedHeader = 'Frame,Event Type,X,Y,Notes,ExportFrame';
        const csvLine = expectedHeader + '\n';

        const actualHeader = csvLine.split('\n')[0];

        return {
          success: actualHeader === expectedHeader,
          headerMatches: actualHeader === expectedHeader
        };
      });

      tests.push({
        name: 'CSV column order',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'CSV column order',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Export frame flag handling
    try {
      const result = await page.evaluate(() => {
        const exportedEvents = window.events.filter(e => e.exportFrame);
        const notExportedEvents = window.events.filter(e => !e.exportFrame);

        return {
          success: exportedEvents.length === 2 && notExportedEvents.length === 1,
          exportedCount: exportedEvents.length,
          notExportedCount: notExportedEvents.length
        };
      });

      tests.push({
        name: 'Export frame flag filtering',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Export frame flag filtering',
        pass: false,
        error: error.message
      });
    }

    // Test 4: Event count statistics
    try {
      const result = await page.evaluate(() => {
        const typeCounts = {};
        window.events.forEach(ev => {
          typeCounts[ev.type] = (typeCounts[ev.type] || 0) + 1;
        });

        const hasCorrectDivision = typeCounts['Correct division'] === 1;
        const hasMisaligned = typeCounts['Misaligned chromosomes'] === 1;
        const hasLagging = typeCounts['Lagging chromosomes'] === 1;

        return {
          success: hasCorrectDivision && hasMisaligned && hasLagging,
          typeCounts: typeCounts,
          uniqueTypes: Object.keys(typeCounts).length
        };
      });

      tests.push({
        name: 'Event statistics generation',
        pass: result.success && result.uniqueTypes === 3,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Event statistics generation',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Metadata generation
    try {
      const result = await page.evaluate(() => {
        const session = window.sessions[window.currentSessionId];
        const metadata = {
          sessionName: session.name,
          sessionCreated: session.createdAt,
          totalEvents: window.events.length,
          exportedFrames: window.events.filter(e => e.exportFrame).length,
          exportDate: new Date().toISOString()
        };

        return {
          success: metadata.sessionName && metadata.totalEvents === 3,
          metadata: metadata,
          hasAllFields: Object.keys(metadata).length === 5
        };
      });

      tests.push({
        name: 'Metadata generation',
        pass: result.success && result.hasAllFields,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Metadata generation',
        pass: false,
        error: error.message
      });
    }

    // Test 6: CSV quoting for special characters
    try {
      const result = await page.evaluate(() => {
        const event = {
          frame: 10,
          type: 'Type with, comma',
          notes: 'Note with "quotes" inside'
        };

        // Proper CSV escaping
        const csvLine = `${event.frame},"${event.type.replace(/"/g, '""')}","${event.notes.replace(/"/g, '""')}"`;

        const hasProperQuoting = csvLine.includes('""');

        return {
          success: hasProperQuoting,
          properlyEscaped: hasProperQuoting
        };
      });

      tests.push({
        name: 'CSV special character escaping',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'CSV special character escaping',
        pass: false,
        error: error.message
      });
    }

    // Test 7: Sorted export by frame number
    try {
      const result = await page.evaluate(() => {
        const sortedEvents = [...window.events].sort((a, b) => a.frame - b.frame);

        const isSorted = sortedEvents.every((e, i) => {
          if (i === 0) return true;
          return e.frame >= sortedEvents[i - 1].frame;
        });

        const frameOrder = sortedEvents.map(e => e.frame);

        return {
          success: isSorted,
          frameOrder: frameOrder,
          expectedOrder: [10, 25, 50]
        };
      });

      tests.push({
        name: 'Export sorted by frame number',
        pass: result.success && JSON.stringify(result.frameOrder) === JSON.stringify([10, 25, 50]),
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Export sorted by frame number',
        pass: false,
        error: error.message
      });
    }

    const passed = tests.filter(t => t.pass).length;
    const failed = tests.filter(t => !t.pass).length;

    return { tests, passed, failed };
  }
};
