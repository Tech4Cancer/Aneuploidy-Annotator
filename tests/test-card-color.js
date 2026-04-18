module.exports = {
  run: async (page, { FIXTURE_DIR }) => {
    const tests = [];

    try {
      // Create session
      await page.evaluate(async () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newSessionBtn = buttons.find(btn => btn.textContent.includes('New Session'));
        if (newSessionBtn) {
          newSessionBtn.click();
          await new Promise(resolve => setTimeout(resolve, 400));

          const nameInput = document.querySelector('#newSessionNameInput');
          if (nameInput) {
            nameInput.value = 'Color Test ' + Date.now();
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
          }

          const createBtn = Array.from(document.querySelectorAll('button')).find(btn =>
            btn.textContent === 'Create' && btn.classList.contains('primary')
          );
          if (createBtn) {
            createBtn.click();
            await new Promise(resolve => setTimeout(resolve, 600));
          }
        }
      });

      // Check event card background color
      const cardColor = await page.evaluate(() => {
        const cards = document.querySelectorAll('.event-card');
        if (cards.length === 0) return null;
        const computed = window.getComputedStyle(cards[0]);
        const inlineStyle = cards[0].getAttribute('style');
        return {
          inlineStyle: inlineStyle,
          computedBackground: computed.backgroundColor
        };
      });

      tests.push({
        name: 'Event card has semi-transparent background',
        pass: cardColor && (cardColor.inlineStyle?.includes('rgba') || cardColor.computedBackground?.includes('rgba')),
        error: JSON.stringify(cardColor)
      });

    } catch (error) {
      tests.push({
        name: 'Card color test failed',
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
