import {setMainAndSidebar} from "./utilities";

export const buildMassesOverviewPage = () => {
    setMainAndSidebar(`
        <h1>Alle Messen</h1>
        <mass-create-button class="centered"></mass-create-button>
    `)
}