import {buildMainPage} from "./builder/main";
import {buildMessdienerOverviewPage} from "./builder/messdiener-overview";
import {buildChurchesOverviewPage} from "./builder/churches-overview";
import {buildMassesOverviewPage} from "./builder/masses-overview";

export enum Pages {
    Main,
    MessdienerOverview,
    MassesOverview,
    Planner,
    AbsencesOverview,
    ChurchesOverview,
}

export const routeToPage = (destination: Pages) => {
    switch (destination) {
        case Pages.Main:
            buildMainPage();
            break;
        case Pages.MessdienerOverview:
            buildMessdienerOverviewPage();
            break;
        case Pages.ChurchesOverview:
            buildChurchesOverviewPage();
            break;
        case Pages.MassesOverview:
            buildMassesOverviewPage();
            break;
        default:
            buildMainPage();
            console.warn("Did not find page to route to!");
    }
}
