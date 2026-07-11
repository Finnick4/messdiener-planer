import {setMainAndSidebar} from "./utilities";

export const buildMassesOverviewPage = () => {
    setMainAndSidebar(`
        <h1>Alle Messen</h1>
        <mass-list></mass-list>
        <mass-create-button class="centered"></mass-create-button>
        <button class="export">Export plan</button>
    `);

    // TODO remove this button!
    const exportBtn = document.querySelector("button.export");

    if (exportBtn) {
        exportBtn.addEventListener("click", () => window.electronAPI.exportPlan());
    }
}