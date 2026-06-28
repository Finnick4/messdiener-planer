import {setMainAndSidebar, SidebarEntries} from "./utilities";

export const buildMainPage = () => {
    console.log("main page")
    setMainAndSidebar(`
        <h1>Messdiener Planer</h1>
        <p>Wähle in der Navigationsleiste eine Seite aus!</p>
        `, SidebarEntries.plan_creator)
}