import {setMainAndSidebar} from "./utilities";

export const buildChurchesOverviewPage = () => {
    setMainAndSidebar(`
        <h1>Alle Kirchen</h1>
        <church-list></church-list>
        <church-create-button class="centered"></church-create-button>
    `)
}