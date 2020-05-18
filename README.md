# 📈 NBA Statistics Scraper

## Description

Simple web scraper that retrieves each NBA player's statistics and shotchart information based on the input years and teams. The intent of this scraper was to scrape and provide data for [🏀NBA Shot Chart](https://github.com/yehmond/nba-shot-chart-frontend), but if you want to use it to gather NBA statistics in raw JSON format, checkout the JSON git branch. Instead of connecting to the MongoDB database, cleaning the JSON response from NBA.com, and storing those data into the database, the code functionality in the JSON branch will simply store the raw JSON responses in the folder <project_root>/shotcharts/.

Since NBA.com imposes several restrictions to their JSON endpoints, it was difficult to identify why requests would not complete if they didn't originate from accessing stats.nba.com in the browser. Therefore, it was easier to just retrieve the data by using [Puppeteer](https://github.com/puppeteer/puppeteer) to navigate to stats.nba.com using a Chrome browser with headless mode turned off.

## Usage

- To use the simplified version of the scraper that retrieves the raw JSON response, checkout the JSON git branch.
- In `ShotchartScraper.ts`, modify the `teams`, `startYear`, and `endYear` variables to your desired teams and the range of seasons you want to retrieve. (The teams and their corresponding ids used by NBA.com can be found at https://github.com/bttmly/nba/blob/master/data/teams.json or in https://github.com/yehmond/nba-statistics-scraper/blob/JSON/src/TeamIDs.json).
- Run `yarn build` and then `node dist/ShotchartScraper.js`.
- The downloaded JSON files will be located in the `shotcharts` folder in the project root. 
