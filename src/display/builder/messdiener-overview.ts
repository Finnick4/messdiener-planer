import {setMainAndSidebar} from "./utilities";

export const buildMessdienerOverviewPage = () => {
    setMainAndSidebar(`
        <h1>Alle Messdiener</h1>
        <messdiener-list></messdiener-list>
        <messdiener-create-button class="centered"></messdiener-create-button>
    `)
}