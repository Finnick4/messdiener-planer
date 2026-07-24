import {setMainAndSidebar, SidebarEntries} from "./utilities";
import {AbsencesList} from "../components/absences/list";

export const buildAbsencesOverviewPage = () => {
    const header = document.createElement("h1");
    header.innerText = `Alle Abwesenheiten`;
    const list = document.createElement("absences-list") as AbsencesList;
    list.setIncludeCreateButton(true);

    setMainAndSidebar([
        header,
        list,
    ], SidebarEntries.absence)
}