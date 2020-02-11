import puppeteer, {Browser, Page} from "puppeteer";

export default class MyPuppeteer {
    private browser: Browser | undefined;

    async initPuppeteer() {
        this.browser = await puppeteer.launch({
            headless: false,  // Must turn off headless mode in order to retrieve the desired JSON file
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        });
    }

    async newPage(url: string): Promise<Page> {
        if (this.browser) {
            const page = await this.browser.newPage();

            // Allows page to start waiting for response and then goto url
            setTimeout(() => {
                return page.goto(url, {waitUntil: 'load', timeout: 0})
                    .catch(err => {
                        if (!err.message.includes("Navigation failed because browser has disconnected!")) {
                            console.trace(err);
                        }
                    });
            });
            return page;
        } else {
            throw new Error("Puppeteer Browser not initiated!");
        }
    }

    async closeBrowser() {
        await this.browser?.close();
    }
}