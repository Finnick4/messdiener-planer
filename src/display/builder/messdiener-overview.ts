import {setMainAndSidebar, SidebarEntries} from "./utilities";
import {MessdienerList} from "../components/messdiener/list";
import {MessdienerCreateButton} from "../components/messdiener/create-button";

export const buildMessdienerOverviewPage = () => {
    const header = document.createElement("h1");
    header.innerText = `Alle Messdiener`;
    const messdienerList = document.createElement("messdiener-list") as MessdienerList;
    const messdienerCreateBtn = document.createElement("messdiener-create-button") as MessdienerCreateButton;
    messdienerCreateBtn.classList.add("centered");

    setMainAndSidebar([
        header,
        messdienerList,
        messdienerCreateBtn,
    ], SidebarEntries.messdiener)
}