import { INBAResponse, IShotChartStat, ITeam } from "./Interfaces";
import Database from "./Database";
import { buildQuery, generateValidSeasons } from "./Util";
import MyPuppeteer from "./MyPuppeteer";
import { promises as fsp } from "fs";

require('dotenv').config();

const URL = process.env.DATABASE_URL || "mongodb://localhost:27017/nbaShotChart";
const DATABASE_NAME = "nbaShotChart";


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

async function extractShotChartFromJson(response: INBAResponse, season: string, database: Database): Promise<void> {
    const { headers, rowSet } = response.resultSets[0];
    for (const row of rowSet) {
        const shotChartStat: IShotChartStat = {
            YEAR: season,
            SEASON_TYPE: response.parameters.SeasonType
        };

        for (let i = 1; i < row.length; i++) {
            shotChartStat[headers[i]] = row[i];
        }
        await database.addShotChart(shotChartStat);
    }
}

async function extractLeagueAvgFromJson(response: INBAResponse, season: string, database: Database): Promise<void> {
    const { headers, rowSet } = response.resultSets[1];
    for (const row of rowSet) {
        const leagueAvgStat: any = {
            YEAR: season,
            SEASON_TYPE: response.parameters.SeasonType
        };

        for (let i = 1; i < row.length; i++) {
            leagueAvgStat[headers[i]] = row[i];
        }
        await database.addLeagueAvg(leagueAvgStat);
    }
}

async function saveShotChart(teams: ITeam[], startYear: number, endYear: number, database: Database, ppt: MyPuppeteer): Promise<void> {
    const validSeasons = generateValidSeasons(startYear, endYear);
    const promises = [];
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


async function addShotChartToDB(teams: any, database: Database): Promise<void> {
    for (const team of teams) {
        const files = await fsp.readdir(`./shotcharts/${team.name}/`);
        const promises = [];
        for (const file of files) {
            const json = await fsp.readFile(`./shotcharts/${team.name}/${file}`, "utf8");
            const season = file.split("_")[1];
            promises.push(extractShotChartFromJson(JSON.parse(json), season, database));
            promises.push(extractLeagueAvgFromJson(JSON.parse(json), season, database));
        }
        await Promise.all(promises);
    }

}

(async () => {
    try {
        const database = new Database(URL, DATABASE_NAME);
        await database.connect();
        await database.createLeagueAvgIndex();
        const ppt = new MyPuppeteer();
        await ppt.initPuppeteer();

        const teams = <ITeam[]>await database.queryTeamIDs();
        await saveShotChart(teams, 1996, 2020, database, ppt);

        await ppt.closeBrowser();
        await addShotChartToDB(teams, database);
        await database.disconnect();
    } catch (err) {
        console.error(err);
    }
})();


