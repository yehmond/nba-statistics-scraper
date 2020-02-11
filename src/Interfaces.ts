export interface ITeam {
    name: string;
    id: string;
}

export interface IPlayer {
    name: string;
    id: string;
}

export interface INBAResponse {
    resource: string;
    parameters: {
        Season: string;
        SeasonType: string;
    };
    resultSets: Array<{
        name: string;
        headers: string[];
        rowSet: (string | number)[][];
    }>;
}

export interface ISeasonStat {
    YEAR: string;
    SEASON_TYPE: string;
    // GP?: number;
    // W?: number;
    // L?: number;
    // W_PCT?: number;
    // MIN?: number;
    // FGM?: number;
    // FGA?: number;
    // FG_PCT?: number;
    // FG3M?: number;
    // FG3A?: number;
    // FG3_PCT?: number;
    // FTM?: number;
    // FTA?: number;
    // FT_PCT?: number;
    // OREB?: number;
    // DREB?: number;
    // REB?: number;
    // AST?: number;
    // TOV?: number;
    // STL?: number;
    // BLK?: number;
    // BLKA?: number;
    // PF?: number;
    // PFD?: number;
    // PTS?: number;
    // PLUS_MINUS?: number;
    // NBA_FANTASY_PTS?: number;
    // DD2?: number;
    // TD3?: number;
    // GP_RANK?: number;
    // W_RANK?: number;
    // L_RANK?: number;
    // W_PCT_RANK?: number;
    // MIN_RANK?: number;
    // FGM_RANK?: number;
    // FGA_RANK?: number;
    // FG_PCT_RANK?: number;
    // FG3M_RANK?: number;
    // FG3A_RANK?: number;
    // FG3_PCT_RANK?: number;
    // FTM_RANK?: number;
    // FTA_RANK?: number;
    // FT_PCT_RANK?: number;
    // OREB_RANK?: number;
    // DREB_RANK?: number;
    // REB_RANK?: number;
    // AST_RANK?: number;
    // TOV_RANK?: number;
    // STL_RANK?: number;
    // BLK_RANK?: number;
    // BLKA_RANK?: number;
    // PF_RANK?: number;
    // PFD_RANK?: number;
    // PTS_RANK?: number;
    // PLUS_MINUS_RANK?: number;
    // NBA_FANTASY_PTS_RANK?: number;
    // DD2_RANK?: number;
    // TD3_RANK?: number;
    [key: string]: string | number | undefined;
}

export interface IShotChartStat {
    YEAR: string;
    SEASON_TYPE: string;
    [key: string]: string | number | undefined;
}