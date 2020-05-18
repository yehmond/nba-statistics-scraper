import {INBAResponse, ISeasonStat, ITeam} from "./Interfaces";
import Database from "./Database";
import {buildQuery, generateValidSeasons} from "./Util";
import cliProgress from "cli-progress";
import MyPuppeteer from "./MyPuppeteer";

require('dotenv').config();

const URL = process.env.DATABASE_URL || "mongodb://localhost:27017/nbaShotChart";
const DATABASE_NAME = "nbaShotChart";

async function getPlayerJson(teamID: string, season: string, seasonType: string, ppt: MyPuppeteer): Promise<INBAResponse> {
    const url = buildQuery(`https://stats.nba.com/team/${teamID}/players-traditional/?`, {
        Season: season,
        SeasonType: seasonType
    });
    const page = await ppt.newPage(url);

    return page
        .waitForResponse((response) => {
            return response.url().includes("teamplayerdashboard") && response.status() === 200;
        })
        .then((response: any) => response.json())
        .then(async (data) => {
            await page.close();
            return data;
        })
        .catch(console.trace);
}

async function extractPlayersFromJson(response: INBAResponse, database: Database): Promise<void> {
    const {headers, rowSet} = response.resultSets[1];
    for (const row of rowSet) {
        const playerSeasonStat: ISeasonStat = {
            YEAR: response.parameters.Season,
            SEASON_TYPE: response.parameters.SeasonType
        };

        const id = String(row[1]);
        const name = String(row[2]);
        for (let i = 1; i < row.length; i++) {
            playerSeasonStat[headers[i]] = row[i];
        }
        await database.addPlayer({_id: id, name});
        await database.addPlayerSeasonStat(playerSeasonStat);
    }
}

async function extractTeams(teams: ITeam[], startYear: number, endYear: number, database: Database, ppt: MyPuppeteer): Promise<void> {
    const validSeasons = generateValidSeasons(startYear, endYear);
    const multiBar = new cliProgress.MultiBar({
        clearOnComplete: true,
    }, cliProgress.Presets.shades_grey);
    const teamBar = multiBar.create(teams.length, 0, {});

    for (const team of teams) {
        const seasonBar = multiBar.create(validSeasons.length, 0, {});
        for (const season of validSeasons) {
            for (const seasonType of ["Pre Season", "Regular Season", "Playoffs"]) {
                const json = await getPlayerJson(team.id, season, seasonType, ppt);
                await extractPlayersFromJson(json, database);
            }
            seasonBar.increment();
        }
        teamBar.increment();
    }
}

(async () => {
    try {
        const database = new Database(URL, DATABASE_NAME);
        await database.connect();
        const ppt = new MyPuppeteer();
        await ppt.initPuppeteer();

        await database.createPlayerSeasonStatIndex();
        const teams = <ITeam[]>await database.queryTeamIDs();
        await extractTeams(teams, 1996, 2020, database, ppt);

        await ppt.closeBrowser();
        await database.disconnect();
    } catch (err) {
        console.error(err);
    }
})();


