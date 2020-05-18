import { INBAResponse, IShotChartStat, ITeam } from "./Interfaces";
import { buildQuery, generateValidSeasons } from "./Util";
import MyPuppeteer from "./MyPuppeteer";
import { promises as fsp } from "fs";

// Refer to TeamIDs.json to see the other team's IDs
// Extracted from https://github.com/bttmly/nba/blob/master/data/teams.json
const teams: ITeam[] = [
    {
        name: "LA Lakers",
        id: "1610612747"
    },
    {
        name: "Boston Celtics",
        id: "1610612738",
    }
]
const startYear = 1996;
const endYear = 2019;

async function getShotChartJson(teamID: string, season: string, seasonType: string, ppt: MyPuppeteer): Promise<INBAResponse> {
    const url = buildQuery(`https://stats.nba.com/events/?`, {
        flag: '3',
        CFID: '33',
        Split: "general",
        ContextMeasure: "FGA",
        section: "player",
        CFPARAMS: season,
        Season: season,
        TeamID: teamID,
        SeasonType: seasonType
    });

    const page = await ppt.newPage(url);
    return page
        .waitForResponse((response) => {
            return response.url().includes("shotchartdetail") && response.status() === 200;
        })
        .then((response: any) => response.json())
        .then(async (data) => {
            await page.close();
            return data;
        })
        .catch(console.trace);
}

async function saveShotChart(teams: ITeam[], startYear: number, endYear: number, ppt: MyPuppeteer): Promise<void> {
    const validSeasons = generateValidSeasons(startYear, endYear);
    await fsp.mkdir("./shotcharts");

    for (const team of teams) {
        await fsp.mkdir(`./shotcharts/${team.name}`);
        for (const season of validSeasons) {
            for (const seasonType of ["Pre Season", "Regular Season", "Playoffs"]) {
                const json = await getShotChartJson(team.id, season, seasonType, ppt);
                await fsp.writeFile(`./shotcharts/${team.name}/${team.id}_${season}_${seasonType}.json`, JSON.stringify(json));
            }
        }
    }
}

(async () => {
    try {
        const ppt = new MyPuppeteer();
        await ppt.initPuppeteer();
        await saveShotChart(teams, startYear, endYear, ppt);
        await ppt.closeBrowser();
    } catch (err) {
        console.error(err);
    }
})();


