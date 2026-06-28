import {buildMainPage} from "./builder/main";
import {buildMessdienerOverviewPage} from "./builder/messdiener-overview";

export enum Pages {
    Main,
    MessdienerOverview,
    MassesOverview,
    Planner,
    AbsencesOverview,
}

export const routeToPage = (destination: Pages) => {
    console.log(destination)
    switch (destination) {
        case Pages.Main:
            buildMainPage();
            break;
        case Pages.MessdienerOverview:
            buildMessdienerOverviewPage();
            break;
        default:
            buildMainPage();
            console.warn("Did not find page to route to!");
    }
}
