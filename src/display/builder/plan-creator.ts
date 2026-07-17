import {setMainAndSidebar, SidebarEntries} from "./utilities";

export const buildPlanCreatorPage = () => {
    const header = document.createElement("h1");
    header.innerText = `Plan erstellen`;

    const notices = [
        "Der Export des Plans erstellt eine .tex Datei, welche zu einer .pdf kompiliert werden kann.",
        "Es werden alle Messen inkludiert. Messen, zu welcher keine spezifischen Messdiener eingetragen sind,",
        "beeinflussen nicht in die Messzählung."
    ].map(text => {
        const notice = document.createElement("p");
        notice.innerText = text;
        return notice;
    })

    const exportBtn = document.createElement("button");
    exportBtn.innerText = "Plan exportieren";
    exportBtn.classList.add("export");
    exportBtn.addEventListener("click", () => window.electronAPI.exportPlan());

    setMainAndSidebar([
        header,
        ...notices,
        exportBtn,
    ], SidebarEntries.plan_creator);
}