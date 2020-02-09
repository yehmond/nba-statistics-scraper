import {INBAResponse, ISeasonStat, ITeam} from "./Interfaces";
import Database from "./Database";
import {buildQuery, initPuppeteer} from "./Util";
import cliProgress from "cli-progress";

require('dotenv').config();

const URL = process.env.DATABASE_URL || "mongodb://localhost:27017/nbaShotChart";
const DATABASE_NAME = "nbaShotChart";

async function getPlayerJson(teamID: string, season: string, seasonType: string): Promise<INBAResponse> {
    const url = buildQuery(`https://stats.nba.com/team/${teamID}/players-traditional/?`, {
        Season: season,
        SeasonType: seasonType
    });

    const {browser, page} = await initPuppeteer(url);

    return page
        .waitForResponse((response) => {
            return response.url().includes("teamplayerdashboard") && response.status() === 200;
        })
        .then((response: any) => response.json())
        .then(async (data) => {
            await browser.close();
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
        for (let i = 3; i < row.length; i++) {
            playerSeasonStat[headers[i]] = row[i];
        }
        await database.addPlayer(id, name, playerSeasonStat);
        await database.addPlayerSeasonStat(id, name, playerSeasonStat);
    }
}

async function extractTeams(teams: ITeam[], startYear: number, endYear: number, database: Database): Promise<void> {
    const validSeasons = generateValidSeasons(startYear, endYear);
    const multiBar = new cliProgress.MultiBar({
        clearOnComplete: true,
        hideCursor: true
    }, cliProgress.Presets.shades_grey);
    const teamBar = multiBar.create(teams.length, 0, {});

    for (const team of teams) {
        const seasonBar = multiBar.create(validSeasons.length, 0, {});
        for (const season of validSeasons) {
            for (const seasonType of ["Pre Season", "Regular Season", "Playoffs"]) {
                const json = await getPlayerJson(team.id, season, seasonType);
                await extractPlayersFromJson(json, database);
            }
            seasonBar.increment();
        }
        teamBar.increment();
    }
}

function generateValidSeasons(startYear: number, endYear: number): string[] {
    const res: string[] = [];
    for (let i = startYear; i < endYear; i++) {
        res.push(i + "-" + String(i + 1).slice(-2))
    }
    return res;
}


(async () => {
    try {
        const database = new Database(URL, DATABASE_NAME);
        await database.connect();
        const teams = <ITeam[]>await database.queryTeamIDs();
        await extractTeams(teams, 1996, 2020, database);
        await database.disconnect();
    } catch (err) {
        console.error(err);
    }
})();


