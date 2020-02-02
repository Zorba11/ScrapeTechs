const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Data structure sample

const scrapingResults = [
  {
    title: "Senior Contact Centre Business Systems Analyst ",
    datePosted: new Date("2020-2-1 12:00:00"),
    neighbourhood: "Victoria",
    url: "https://toronto.craigslist.org/tor/sof/d/senior-contact-centre-business-systems/7065559633.html",
    jobDescription: "MAXIMUS Canada is an industry leader in the provisioning of products and services to support the delivery of government services in North America and internationally. With ",
    compensation: "upto US$0.00 per year"
  }
]

async function scrapeListings (page) {
   //go to the address
   await page.goto('https://toronto.craigslist.org/d/software-qa-dba-etc/search/sof');

   const html = await page.content();
   //cheerio helps to select the css selectors in the html, so, first feed the html to cheerio
   const $ = cheerio.load(html);
  //always use .get when using map function in node js cheerio
  const listings = $(".result-info").map((index, element) => {
    const titleElement = $(element).find(".result-title");
    const timeElement = $(element).find(".result-date");
    const hoodElement = $(element).find(".result-hood");

    const title = $(titleElement).text();
    const url = $(titleElement).attr('href');
    const datePosted = new Date($(timeElement).attr("datetime"));
    const hood = $(hoodElement).text().trim().replace("(","").replace(")","");


    return { title, url, datePosted, hood };
  }).get();

  return listings;
}

async function scrapeJobDescriptions (listings, page) {
  for(var i = 0; i < listings.length; i++) {
    await page.goto(listings[i].url);
    const html = await page.content();
    const $ = cheerio.load(html);

    const jobDescription = $("#postingbody").text();
    const compensation = $("p.attrgroup").text().trim().replace(/\s/g, "").replace("emp",",emp");
    listings[i].jobDescription = jobDescription;
    listings[i].compensation = compensation;
    console.log(listings[i].compensation );
    // to limit the number of request per second
    await sleep(1000);
  }
}

async function sleep (milliseconds) {
   // to limit the number of request per second
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function main() {
  //launch browser
  const browser = await puppeteer.launch({headless: false});
  //open a newtab
  const page = await browser.newPage();
  const listings = await scrapeListings(page);
  const listingsWithJobDescriptions = await scrapeJobDescriptions(listings, page);
  console.log(listings);
}

main();