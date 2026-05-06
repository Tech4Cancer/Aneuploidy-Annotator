const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  
  const APP_PATH = 'file://' + path.resolve(__dirname, '../aneuploidy-annotator.html');
  await page.goto(APP_PATH, { waitUntil: 'networkidle2', timeout: 30000 });

  const result = await page.evaluate(() => {
    console.log('window.sessions type:', typeof window.sessions);
    console.log('window.sessions:', window.sessions);
    console.log('window.currentSessionId:', window.currentSessionId);
    
    return { 
      sessionsType: typeof window.sessions,
      sessionsValue: window.sessions
    };
  });

  console.log(result);

  await browser.close();
  process.exit(0);
})();
