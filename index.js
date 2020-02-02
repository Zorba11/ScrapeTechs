const puppeteer = require('puppeteer');

async function main () {
  //launch browser
  const browser = await puppeteer.launch({headless: false});
  //open a newtab
  const page = await browser.newPage();
  //go to the address
  await page.goto('https://www.google.com');
}

main();