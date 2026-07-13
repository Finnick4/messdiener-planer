import {setMainAndSidebar, SidebarEntries} from "./utilities";
import {MassList} from "../components/mass/list";
import {MassCreateButton} from "../components/mass/create-button";

export const buildMassesOverviewPage = () => {
    const header = document.createElement("h1");
    header.innerText = `Alle Messen`;
    const massList = document.createElement("mass-list") as MassList;
    const massCreateBtn = document.createElement("mass-create-button") as MassCreateButton;
    massCreateBtn.classList.add("centered");

    // TODO remove this button!
    const temporaryExportButton = document.createElement("button");
    temporaryExportButton.classList.add("export");
    temporaryExportButton.addEventListener("click", () => window.electronAPI.exportPlan());

    setMainAndSidebar([
        header,
        massList,
        massCreateBtn,
        temporaryExportButton,
    ], SidebarEntries.masses);
}