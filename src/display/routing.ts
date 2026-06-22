import {buildMainPage} from "./builder/main";
import {buildMessdienerOverviewPage} from "./builder/messdiener-overview";

export enum Pages {
    Main,
    MessdienerOverview
}

export const routeToPage = (destination: Pages) => {
    switch (destination) {
        case Pages.Main:
            buildMainPage();
            break;
        case Pages.MessdienerOverview:
            buildMessdienerOverviewPage();
            break;
        default:
            console.warn("Did not find page to route to!");
    }
}
