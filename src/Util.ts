export function buildQuery(baseUrl: string, params: { [key: string]: string }): string {
    return baseUrl + encodeURI(Object.keys(params).map((key: string) => {
        return key + "=" + params[key];
    }).join("&"));
}

export function generateValidSeasons(startYear: number, endYear: number): string[] {
    const res: string[] = [];
    for (let i = startYear; i < endYear; i++) {
        res.push(i + "-" + String(i + 1).slice(-2))
    }
    return res;
}