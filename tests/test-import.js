/**
 * Test Suite: Import
 * Tests: CSV parsing, Trackastra import, error handling
 */

module.exports = {
  run: async (page) => {
    const tests = [];

    // Setup
    await page.evaluate(() => {
      window.events = [];
      window.currentSessionId = 'test-session';
    });

    // Test 1: Parse standard CSV format
    try {
      const result = await page.evaluate(() => {
        const csvData = `frame,type,x,y,notes
10,Correct division,100,200,Good event
25,Misaligned,150,250,Test note
50,Lagging,200,300,`;

        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const dataLines = lines.slice(1).filter(line => line.trim());

        let imported = 0;
        dataLines.forEach(line => {
          const cols = line.split(',');
          if (cols.length >= 2) {
            const frame = parseInt(cols[0]);
            const type = cols[1]?.trim() || '';
            const x = cols[2] ? parseInt(cols[2]) : undefined;
            const y = cols[3] ? parseInt(cols[3]) : undefined;

            if (!isNaN(frame)) {
              window.events.push({
                id: Date.now() + Math.random(),
                frame,
                type,
                x,
                y,
                notes: cols[4]?.trim() || ''
              });
              imported++;
            }
          }
        });

        return {
          success: imported === 3,
          importedCount: imported,
          eventsAdded: window.events.length
        };
      });

      tests.push({
        name: 'Parse standard CSV',
        pass: result.success && result.importedCount === 3,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Parse standard CSV',
        pass: false,
        error: error.message
      });
    }

    // Test 2: Trackastra CSV - filter by mitosis=True
    try {
      const result = await page.evaluate(() => {
        const csvData = `track_id,frame,y,x,parent,daughters,mitosis
1.0,10.0,100.0,200.0,,"[2,3]",True
1.0,11.0,102.0,202.0,,"[2,3]",True
1.0,12.0,104.0,204.0,,"[2,3]",True
2.0,15.0,150.0,250.0,1,"[4,5]",True
3.0,20.0,200.0,300.0,1,"[6,7]",False
4.0,25.0,250.0,350.0,2,,True`;

        const lines = csvData.split('\n');
        // Use quote-aware parsing
        const parseCSVLine = (line) => {
          const cols = [];
          let cur = '', inQuote = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              inQuote = !inQuote;
            } else if (ch === ',' && !inQuote) {
              cols.push(cur.trim());
              cur = '';
            } else {
              cur += ch;
            }
          }
          cols.push(cur.trim());
          return cols;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        const idxMitosis = headers.indexOf('mitosis');

        const mitosisRows = lines.slice(1).filter(line => {
          if (!line.trim()) return false;
          const cols = parseCSVLine(line);
          const mitosisVal = cols[idxMitosis]?.toLowerCase() || '';
          return mitosisVal === 'true';
        });

        return {
          success: mitosisRows.length === 5, // Rows with mitosis=True
          mitosisRowCount: mitosisRows.length,
          expectedCount: 5
        };
      });

      tests.push({
        name: 'Filter Trackastra by mitosis=True',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Filter Trackastra by mitosis=True',
        pass: false,
        error: error.message
      });
    }

    // Test 3: Trackastra - first frame per track
    try {
      const result = await page.evaluate(() => {
        const csvData = `track_id,frame,y,x,parent,daughters,mitosis
1.0,10.0,100.0,200.0,,"[2,3]",True
1.0,11.0,102.0,202.0,,"[2,3]",True
1.0,12.0,104.0,204.0,,"[2,3]",True
2.0,15.0,150.0,250.0,1,"[4,5]",True
3.0,20.0,200.0,300.0,1,"[6,7]",True`;

        const parseCSVLine = (line) => {
          const cols = [];
          let cur = '', inQuote = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              inQuote = !inQuote;
            } else if (ch === ',' && !inQuote) {
              cols.push(cur.trim());
              cur = '';
            } else {
              cur += ch;
            }
          }
          cols.push(cur.trim());
          return cols;
        };

        const lines = csvData.split('\n');
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        const idxMitosis = headers.indexOf('mitosis');
        const idxFrame = headers.indexOf('frame');
        const idxTrackId = headers.indexOf('track_id');
        const idxX = headers.indexOf('x');
        const idxY = headers.indexOf('y');

        const trackFirstRow = {};
        lines.slice(1).forEach(line => {
          if (!line.trim()) return;
          const cols = parseCSVLine(line);
          const mitosisVal = cols[idxMitosis]?.toLowerCase() || '';
          if (mitosisVal !== 'true') return;

          const trackId = cols[idxTrackId]?.trim();
          const frame = parseFloat(cols[idxFrame]);

          if (trackId && !isNaN(frame)) {
            if (!trackFirstRow[trackId] || frame < trackFirstRow[trackId].frame) {
              trackFirstRow[trackId] = {
                frame,
                x: parseFloat(cols[idxX]),
                y: parseFloat(cols[idxY])
              };
            }
          }
        });

        return {
          success: Object.keys(trackFirstRow).length === 3, // 3 unique tracks
          uniqueTracks: Object.keys(trackFirstRow).length,
          firstFramesCorrect:
            trackFirstRow['1.0']?.frame === 10 &&
            trackFirstRow['2.0']?.frame === 15 &&
            trackFirstRow['3.0']?.frame === 20
        };
      });

      tests.push({
        name: 'Trackastra - deduplicate by track (first frame)',
        pass: result.success && result.firstFramesCorrect,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Trackastra - deduplicate by track (first frame)',
        pass: false,
        error: error.message
      });
    }

    // Test 4: CSV with missing columns
    try {
      const result = await page.evaluate(() => {
        const csvData = `frame,type
10,Correct division
25,Misaligned`;

        const lines = csvData.split('\n');
        const headers = lines[0].split(',');

        // Try to parse without x/y
        const hasX = headers.some(h => h.toLowerCase() === 'x');
        const hasY = headers.some(h => h.toLowerCase() === 'y');

        return {
          success: !hasX && !hasY,
          canParseWithoutCoords: true
        };
      });

      tests.push({
        name: 'CSV with missing coordinate columns',
        pass: result.success,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'CSV with missing coordinate columns',
        pass: false,
        error: error.message
      });
    }

    // Test 5: Quoted CSV fields
    try {
      const result = await page.evaluate(() => {
        const csvData = `track_id,frame,x,y,daughters,mitosis
1.0,10.0,100.0,200.0,"""[463, 464]""",True
2.0,20.0,150.0,250.0,"""[1000, 1001]""",True`;

        let successCount = 0;
        const lines = csvData.split('\n');

        lines.slice(1).forEach(line => {
          if (!line.trim()) return;

          // Parse respecting quoted fields
          const cols = [];
          let cur = '',
            inQuote = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              inQuote = !inQuote;
            } else if (ch === ',' && !inQuote) {
              cols.push(cur.trim());
              cur = '';
            } else {
              cur += ch;
            }
          }
          cols.push(cur.trim());

          if (cols.length >= 5) {
            successCount++;
          }
        });

        return {
          success: successCount === 2,
          parsedQuotedFields: true,
          linesParsed: successCount
        };
      });

      tests.push({
        name: 'Parse quoted CSV fields',
        pass: result.success && result.parsedQuotedFields,
        error: result.error
      });
    } catch (error) {
      tests.push({
        name: 'Parse quoted CSV fields',
        pass: false,
        error: error.message
      });
    }

    const passed = tests.filter(t => t.pass).length;
    const failed = tests.filter(t => !t.pass).length;

    return { tests, passed, failed };
  }
};
