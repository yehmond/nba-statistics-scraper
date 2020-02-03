export interface ITeam {
    name: string;
    id: string;
}

export interface INBAResponse {
    resource: string;
    parameters: Object;
    resultSets: Array<{
        name: string;
        headers: string[];
        rowSet: (string | number)[][];
    }>;
}