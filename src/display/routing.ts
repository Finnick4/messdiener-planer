import {buildMessdienerOverviewPage} from "./builder/messdiener-overview";
import {buildChurchesOverviewPage} from "./builder/churches-overview";
import {buildMassesOverviewPage} from "./builder/masses-overview";
import {buildPlanCreatorPage} from "./builder/plan-creator";

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
        case Pages.Planner:
            buildPlanCreatorPage();
            break;
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
