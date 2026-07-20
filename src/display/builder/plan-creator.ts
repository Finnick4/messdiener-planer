import {setMainAndSidebar, SidebarEntries} from "./utilities";
import {generateHTMLElementsForm} from "../components/form-creator";
import {ChurchSelector} from "../components/church/church-selector";
import {ChurchSelectorMultiple} from "../components/church/church-selector-multiple";

export const buildPlanCreatorPage = () => {
    const header = document.createElement("h1");
    header.innerText = `Plan erstellen`;

    const noticesHeader = document.createElement("h2");
    noticesHeader.innerText = `Hinweis`;
    const notices = [
        "Der Export des Plans erstellt eine .tex Datei, welche zu einer .pdf kompiliert werden kann.",
        "Es werden alle Messen inkludiert. Messen, zu welchen keine spezifischen Messdiener eingetragen sind,",
        "werden als Messen, zu welchen alle eingeplant sind, interpretiert."
    ].map(text => {
        const notice = document.createElement("p");
        notice.innerText = text;
        return notice;
    })

    const settingsHeader = document.createElement("h2");
    settingsHeader.innerText = `Exporteinstellungen`;
    const formDiv = document.createElement("div");
    formDiv.classList.add("form");

    const formElements = generateHTMLElementsForm([
        {tagName: "input", labelText: "Titel", type: "text"},
        {tagName: "input", labelText: "Version", type: "text"},
        {tagName: "select", labelText: "Kirchengemeinden", is: "church-selector-multiple"},
        {tagName: "select", labelText: "Hauptkirche", is: "church-selector"},
        {tagName: "input", labelText: "Zweitkirchennotiz", type: "checkbox"},
        {tagName: "input", labelText: "Zweitkirchennotiz als Ortsangabe", type: "checkbox"},
    ]);
    formDiv.replaceChildren(...formElements.nodes)

    const inputTitle = formElements.elements[0] as HTMLInputElement;
    const inputVersion = formElements.elements[1] as HTMLInputElement;
    const churchSelector = formElements.elements[2] as ChurchSelectorMultiple;
    const mainChurch = formElements.elements[3] as ChurchSelector;
    const switchNote = formElements.elements[4] as HTMLInputElement;
    const switchNoteLocation = formElements.elements[5] as HTMLInputElement;

    switchNote.classList.add("switch");
    switchNoteLocation.classList.add("switch")

    inputTitle.value = "Messdienerplan"

    const exportBtn = document.createElement("button");
    exportBtn.innerText = "Plan exportieren";
    exportBtn.classList.add("export");
    exportBtn.addEventListener("click", () => {
        if (inputTitle.value == "" || inputVersion.value == "" || churchSelector.getSelectedChurches().size == 0) {
            console.log("Did not export the plan as one value wasn't set.")
            return
        }

        window.electronAPI.exportPlan({
            displayedChurchIDs: churchSelector.getSelectedChurches(),
            mainChurchID: mainChurch.getSelectedChurch(),
            otherChurchComment: switchNote.checked,
            otherChurchCommentUseLocation: switchNoteLocation.checked,
            title: inputTitle.value,
            version: inputVersion.value,
        })
    });

    setMainAndSidebar([
        header,
        noticesHeader,
        ...notices,
        settingsHeader,
        formDiv,
        exportBtn,
    ], SidebarEntries.plan_creator);
}