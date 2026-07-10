import {Pages, routeToPage} from "../routing";

export enum SidebarEntries {
    "unselected",
    "plan_creator",
    "messdiener",
    "masses",
    "churches",
    "absence"
}

let sidebarElem: HTMLDivElement;
let mainElem: HTMLElement;

export const setMainAndSidebar = (mainHTML: string, sidebarHighlight = SidebarEntries.unselected) => {
    if (!sidebarElem) {
        sidebarElem = document.createElement("div");
        sidebarElem.classList.add("sidebar");
        document.body.appendChild(sidebarElem);
    }
    if (!mainElem) {
        mainElem = document.createElement("main");
        document.body.appendChild(mainElem);
    }
    mainElem.innerHTML = mainHTML;
    updateSidebar(sidebarHighlight);
}

const updateSidebar = (currentEntry: SidebarEntries) => {
    interface SidebarEntry {
        id: SidebarEntries,
        text: string,
        onclick: () => void
    }
    const elements: SidebarEntry[] = [
        {id: SidebarEntries.plan_creator, text: "Plan erstellen", onclick: () => routeToPage(Pages.Planner)},
        {id: SidebarEntries.messdiener, text: "Alle Messdiener", onclick: () => routeToPage(Pages.MessdienerOverview)},
        {id: SidebarEntries.masses, text: "Messen ändern", onclick: () => routeToPage(Pages.MassesOverview)},
        {id: SidebarEntries.churches, text: "Kirchen", onclick: () => routeToPage(Pages.ChurchesOverview)},
        {id: SidebarEntries.absence, text: "Abwesenheitszeiträume", onclick: () => routeToPage(Pages.AbsencesOverview)}
    ]
    sidebarElem.innerHTML = "";
    for (const element of elements) {
        const elem = document.createElement("button");
        elem.innerHTML = element.text;
        elem.onclick = element.onclick;
        elem.dataset.id = String(element.id);
        if (element.id == currentEntry) {
            elem.classList.add("selected");
        }
        sidebarElem.appendChild(elem);
    }
}

let idCounter = 0;

export const getUniqueCount = (): number => {
    return idCounter++;
}
