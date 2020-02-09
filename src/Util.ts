import puppeteer, {Browser, Page} from "puppeteer";

export function buildQuery(baseUrl: string, params: { [key: string]: string }): string {
    return baseUrl + encodeURI(Object.keys(params).map((key: string) => {
        return key + "=" + params[key];
    }).join("&"));
}

export async function initPuppeteer(url: string): Promise<{ browser: Browser; page: Page; }> {
    const browser = await puppeteer.launch({
        headless: false,  // Must turn off headless mode in order to retrieve the desired JSON file
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
    const page = await browser.newPage();

    // Allows page to start waiting for response and then goto url
    setTimeout(() => {
        return page.goto(url)
            .catch(err => {
                if (!err.message.includes("Navigation failed because browser has disconnected!")) {
                    console.trace(err);
                }
            });
    });
    return {browser, page};
}