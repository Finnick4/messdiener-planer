import {setMainAndSidebar, SidebarEntries} from "./utilities";
import {MassList} from "../components/mass/list";
import {MassCreateButton} from "../components/mass/create-button";
import {generateHTMLElementsForm} from "../components/form-creator";
import {ChurchSelectorMultiple} from "../components/church/church-selector-multiple";
import {ChurchSelector} from "../components/church/church-selector";
import {getChurchMap} from "../state/specific-entries";
import {Church} from "../../shared/general";

export const buildMassesOverviewPage = () => {
    const header = document.createElement("h1");
    header.innerText = `Alle Messen`;
    const displaySettings = document.createElement("details");
    const displaySettingsSummary = document.createElement("summary");
    displaySettingsSummary.innerText = "Anzeigeeinstellungen";

    const formDiv = document.createElement("div");
    formDiv.classList.add("form");

    const formElements = generateHTMLElementsForm([
        {tagName: "select", labelText: "Kirchengemeinden", is: "church-selector-multiple"},
        {tagName: "select", labelText: "Hauptkirche", is: "church-selector"},
        {tagName: "input", labelText: "Zweitkirchennotiz", type: "checkbox"},
        {tagName: "input", labelText: "Zweitkirchennotiz als Ortsangabe", type: "checkbox"},
    ]);
    formDiv.replaceChildren(...formElements.nodes)
    displaySettings.replaceChildren(displaySettingsSummary, formDiv)

    const churchSelector = formElements.elements[0] as ChurchSelectorMultiple;
    const mainChurch = formElements.elements[1] as ChurchSelector;
    const switchNote = formElements.elements[2] as HTMLInputElement;
    const switchNoteLocation = formElements.elements[3] as HTMLInputElement;

    switchNote.classList.add("switch");
    switchNoteLocation.classList.add("switch");

    const massList = document.createElement("mass-list") as MassList;
    const massCreateBtn = document.createElement("mass-create-button") as MassCreateButton;
    massCreateBtn.classList.add("centered");

    setMainAndSidebar([
        header,
        displaySettings,
        massList,
        massCreateBtn,
    ], SidebarEntries.masses);

    churchSelector.onedit = (ids: Set<number>) => {
        if (ids.size == 0) {
            massList.querySelectorAll<HTMLDivElement>("div.mass").forEach((massElem: HTMLDivElement) => {
                massElem.classList.remove("hidden");
            });
            return;
        }
        massList.querySelectorAll<HTMLDivElement>("div.mass").forEach((massElem: HTMLDivElement) => {
            if (ids.has(Number(massElem.dataset.churchId))) {
                massElem.classList.remove("hidden");
            } else {
                massElem.classList.add("hidden");
            }
        });
    };
    getChurchMap().then((churchMap: Map<number, Church>) => {
        const updateNotes = () => {
            const mainChurchID = mainChurch.getSelectedChurch();
            const declareDifferentChurch = switchNote.checked;
            const useLocation = switchNoteLocation.checked;

            massList.querySelectorAll<HTMLDivElement>("div.mass").forEach((massElem: HTMLDivElement) => {
                const churchID = Number(massElem.dataset.churchId);
                const noteElem = massElem.querySelector<HTMLDivElement>("div.note");
                const note = massElem.dataset.originalNote ? massElem.dataset.originalNote : "";

                if (!noteElem) {
                    return;
                }

                if (churchID == mainChurchID || !declareDifferentChurch) {
                    noteElem.innerText = note;
                    return;
                }

                const church = churchMap.get(churchID);
                if (!church) {
                    noteElem.innerText = note;
                    return;
                }
                if (declareDifferentChurch && useLocation) {
                    noteElem.innerText = `${note} (${church.location})`;
                }
                if (declareDifferentChurch && !useLocation) {
                    noteElem.innerText = `${note} (${church.name})`;
                }
                return;
            });
        };

        mainChurch.onedit = () => updateNotes();
        switchNote.addEventListener("click", () => updateNotes());
        switchNoteLocation.addEventListener("click", () => updateNotes());
    });
}