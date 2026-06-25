import {setMainAndSidebar} from "./utilities";

export const buildMessdienerOverviewPage = () => {
    setMainAndSidebar(`
        <h1>Alle Messdiener</h1>
        <messdiener-list></messdiener-list>
    `)
}