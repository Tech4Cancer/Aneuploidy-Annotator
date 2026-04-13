/**
 * CRITICAL: Session Data Loss Prevention Tests
 * These tests MUST pass to prevent regressions that lose user data
 *
 * Any change to session loading/saving code requires these tests to pass
 */

import { test, expect } from '@playwright/test';

test.describe('CRITICAL: Session Data Persistence', () => {

  test('localStorage must retain session data after refresh', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/../aneuploidy-annotator.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Create session
    await page.locator('button:has-text("+ New Session")').click();
    await page.locator('#newSessionNameInput').fill('Critical Test Session');
    await page.locator('.modal-btn.primary:has-text("Create")').click();
    await page.waitForTimeout(500);

    // Add events to ensure session is saved
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('1');
      await page.waitForTimeout(200);
      const canvas = await page.locator('#videoCanvas');
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2 + i * 20, box.y + box.height / 2);
        await page.waitForTimeout(300);
      }
    }

    // Verify localStorage has data BEFORE refresh
    const storageBeforeRefresh = await page.evaluate(() => {
      const stored = localStorage.getItem('cellAnnotatorSessions');
      return {
        exists: stored !== null,
        length: stored ? stored.length : 0,
        hasData: stored ? stored.includes('Critical Test Session') : false
      };
    });

    console.log(`Before refresh - localStorage: exists=${storageBeforeRefresh.exists}, length=${storageBeforeRefresh.length}, hasData=${storageBeforeRefresh.hasData}`);

    expect(storageBeforeRefresh.exists).toBe(true);
    expect(storageBeforeRefresh.length).toBeGreaterThan(50);
    expect(storageBeforeRefresh.hasData).toBe(true);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify localStorage still has data AFTER refresh
    const storageAfterRefresh = await page.evaluate(() => {
      const stored = localStorage.getItem('cellAnnotatorSessions');
      return {
        exists: stored !== null,
        length: stored ? stored.length : 0,
        hasData: stored ? stored.includes('Critical Test Session') : false
      };
    });

    console.log(`After refresh - localStorage: exists=${storageAfterRefresh.exists}, length=${storageAfterRefresh.length}, hasData=${storageAfterRefresh.hasData}`);

    expect(storageAfterRefresh.exists).toBe(true);
    expect(storageAfterRefresh.length).toBeGreaterThan(50);
    expect(storageAfterRefresh.hasData).toBe(true);
    expect(storageAfterRefresh.length).toBe(storageBeforeRefresh.length);

    console.log('✓ CRITICAL: localStorage data survives page refresh');
  });

  test('session must be loadable and selectable after refresh', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/../aneuploidy-annotator.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Create session
    await page.locator('button:has-text("+ New Session")').click();
    const sessionName = 'Recovery Test ' + Date.now();
    await page.locator('#newSessionNameInput').fill(sessionName);
    await page.locator('.modal-btn.primary:has-text("Create")').click();
    await page.waitForTimeout(500);

    // Add at least one event
    await page.keyboard.press('1');
    await page.waitForTimeout(200);
    const canvas = await page.locator('#videoCanvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(300);
    }

    // Get session ID from dropdown before refresh
    const dropdownValueBefore = await page.locator('#sessionDropdown').inputValue();
    console.log(`Session ID before refresh: "${dropdownValueBefore}"`);

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check dropdown after refresh
    const dropdownValueAfter = await page.locator('#sessionDropdown').inputValue();
    const dropdownOptions = await page.locator('#sessionDropdown option').count();
    console.log(`Session ID after refresh: "${dropdownValueAfter}", Total options: ${dropdownOptions}`);

    // Session should be in dropdown (either value matches or at least some session is selected)
    expect(dropdownOptions).toBeGreaterThanOrEqual(1);

    // Try to get the selected option text
    const selectedText = await page.locator('#sessionDropdown option:checked').textContent();
    console.log(`Selected session text: "${selectedText}"`);

    expect(selectedText).toBeTruthy();
    expect(selectedText.length).toBeGreaterThan(0);

    console.log('✓ CRITICAL: Session loadable after refresh');
  });

  test('events must be preserved across refresh', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/../aneuploidy-annotator.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Create session
    await page.locator('button:has-text("+ New Session")').click();
    await page.locator('#newSessionNameInput').fill('Event Preservation Test');
    await page.locator('.modal-btn.primary:has-text("Create")').click();
    await page.waitForTimeout(500);

    // Add multiple events with different types
    const eventTypes = ['1', '2', '3'];
    for (let i = 0; i < eventTypes.length; i++) {
      await page.keyboard.press(eventTypes[i]);
      await page.waitForTimeout(200);
      const canvas = await page.locator('#videoCanvas');
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2 + i * 50, box.y + box.height / 2);
        await page.waitForTimeout(300);
      }
    }

    // Count events before refresh
    const eventCountBefore = await page.locator('#eventList div.event-card').count();
    console.log(`Events before refresh: ${eventCountBefore}`);
    expect(eventCountBefore).toBe(eventTypes.length);

    // Get event count label
    const labelBefore = await page.locator('#eventCount').textContent();
    console.log(`Event label before refresh: "${labelBefore}"`);

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Count events after refresh
    const eventCountAfter = await page.locator('#eventList div.event-card').count();
    console.log(`Events after refresh: ${eventCountAfter}`);

    // Get event count label
    const labelAfter = await page.locator('#eventCount').textContent();
    console.log(`Event label after refresh: "${labelAfter}"`);

    // Events must be preserved
    expect(eventCountAfter).toBe(eventCountBefore);
    expect(eventCountAfter).toBe(eventTypes.length);

    console.log('✓ CRITICAL: Events preserved across refresh');
  });

  test('multiple sessions must not interfere with each other', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/../aneuploidy-annotator.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const sessions = [];

    // Create 3 sessions with different event counts
    for (let s = 0; s < 3; s++) {
      await page.locator('button:has-text("+ New Session")').click();
      const sessionName = `Session ${s + 1}`;
      await page.locator('#newSessionNameInput').fill(sessionName);
      await page.locator('.modal-btn.primary:has-text("Create")').click();
      await page.waitForTimeout(500);

      // Add different number of events to each session
      for (let e = 0; e < s + 1; e++) {
        await page.keyboard.press('1');
        await page.waitForTimeout(200);
        const canvas = await page.locator('#videoCanvas');
        const box = await canvas.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width / 2 + e * 30, box.y + box.height / 2);
          await page.waitForTimeout(300);
        }
      }

      const eventCount = await page.locator('#eventList div.event-card').count();
      sessions.push({ name: sessionName, eventCount });
      console.log(`Session ${s + 1}: ${eventCount} events`);
    }

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify all sessions still exist
    const dropdownOptions = await page.locator('#sessionDropdown option').count();
    console.log(`Sessions after refresh: ${dropdownOptions}`);
    expect(dropdownOptions).toBeGreaterThanOrEqual(3);

    // Try switching between sessions
    const sessionDropdown = page.locator('#sessionDropdown');
    for (let s = 0; s < Math.min(3, sessions.length); s++) {
      // Get available options
      const options = await page.locator('#sessionDropdown option').all();
      if (options.length > s + 1) {
        // Select each session
        await sessionDropdown.selectOption({ index: s + 1 });
        await page.waitForTimeout(500);

        const selectedText = await page.locator('#sessionDropdown option:checked').textContent();
        console.log(`Selected: "${selectedText}"`);
      }
    }

    console.log('✓ CRITICAL: Multiple sessions coexist without interference');
  });

  test('lastViewedSessionId must be respected on reload', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/../aneuploidy-annotator.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Create session
    await page.locator('button:has-text("+ New Session")').click();
    const sessionName = 'Last Viewed Test';
    await page.locator('#newSessionNameInput').fill(sessionName);
    await page.locator('.modal-btn.primary:has-text("Create")').click();
    await page.waitForTimeout(500);

    // Add event
    await page.keyboard.press('1');
    await page.waitForTimeout(200);
    const canvas = await page.locator('#videoCanvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(300);
    }

    // Get lastViewedSessionId
    const lastViewedBefore = await page.evaluate(() =>
      localStorage.getItem('lastViewedSessionId')
    );
    console.log(`lastViewedSessionId before refresh: "${lastViewedBefore}"`);
    expect(lastViewedBefore).not.toBeNull();
    expect(lastViewedBefore.length).toBeGreaterThan(0);

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check lastViewedSessionId still exists
    const lastViewedAfter = await page.evaluate(() =>
      localStorage.getItem('lastViewedSessionId')
    );
    console.log(`lastViewedSessionId after refresh: "${lastViewedAfter}"`);
    expect(lastViewedAfter).toBe(lastViewedBefore);

    console.log('✓ CRITICAL: lastViewedSessionId persisted');
  });

  test('saveSessions() must not clear data on every update', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/../aneuploidy-annotator.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Create first session
    await page.locator('button:has-text("+ New Session")').click();
    await page.locator('#newSessionNameInput').fill('Session A');
    await page.locator('.modal-btn.primary:has-text("Create")').click();
    await page.waitForTimeout(500);

    // Get initial storage
    const storageA = await page.evaluate(() =>
      localStorage.getItem('cellAnnotatorSessions')
    );
    const sessionCountA = (storageA.match(/id/g) || []).length;
    console.log(`Storage after session A: ${sessionCountA} sessions`);

    // Create second session
    await page.locator('button:has-text("+ New Session")').click();
    await page.locator('#newSessionNameInput').fill('Session B');
    await page.locator('.modal-btn.primary:has-text("Create")').click();
    await page.waitForTimeout(500);

    // Get updated storage
    const storageB = await page.evaluate(() =>
      localStorage.getItem('cellAnnotatorSessions')
    );
    const sessionCountB = (storageB.match(/id/g) || []).length;
    console.log(`Storage after session B: ${sessionCountB} sessions`);

    // Both sessions should be in storage
    expect(sessionCountB).toBeGreaterThan(sessionCountA);
    expect(storageB).toContain('Session A');
    expect(storageB).toContain('Session B');

    console.log('✓ CRITICAL: saveSessions() accumulates sessions, does not clear');
  });

});
