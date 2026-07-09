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
            buildMessdienerOverviewPage();
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
            console.warn("Did not find page to route to!");
            routeToPage(Pages.Main);
    }
}
