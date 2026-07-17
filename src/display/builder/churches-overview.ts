import {setMainAndSidebar, SidebarEntries} from "./utilities";
import {ChurchList} from "../components/church/list";
import {ChurchCreateButton} from "../components/church/create-button";

export const buildChurchesOverviewPage = () => {
    const header = document.createElement("h1");
    header.innerText = `Alle Kirchen`;
    const churchList = document.createElement("church-list") as ChurchList;
    const churchCreateBtn = document.createElement("church-create-button") as ChurchCreateButton;
    churchCreateBtn.classList.add("centered");

    setMainAndSidebar([
        header,
        churchList,
        churchCreateBtn,
    ], SidebarEntries.churches)
}