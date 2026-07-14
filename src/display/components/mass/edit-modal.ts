import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {
    Mass,
    MessdienerMassAllocation
} from "../../../shared/general";
import {ModalManager} from "../../types";
import {ChurchSelector} from "../church/church-selector";
import {MessdienerAllocator} from "../messdiener/allocator";
import {generateHTMLElementsForm} from "../form-creator";

export const generateEditMassModal = (id: number): ModalManager => {
    const modal = document.createElement("dialog");

    modal.classList.add("mass-edit", "modal", "form");

    const headerElem = document.createElement("h1");
    headerElem.innerText = "Messe bearbeiten";

    const formElements = generateHTMLElementsForm([
        {tagName: "input", labelText: "Datum", type: "date"},
        {tagName: "select", labelText: "Kirche (Final)", is: "church-selector"},
        {tagName: "input", labelText: "Notiz (Optional)", type: "text"},
        {tagName: "messdiener-allocator", labelText: "Messdiener Zuweisung"},
    ])

    const controlsField = document.createElement("div");
    const cancelBtn = document.createElement("button");
    const saveBtn = document.createElement("button");
    const delBtn = document.createElement("button");
    delBtn.innerText = "Löschen";
    cancelBtn.innerText = "Abbrechen";
    saveBtn.innerText = "Speichern";
    controlsField.classList.add("field", "controls");
    cancelBtn.classList.add("cancel");
    saveBtn.classList.add("save");
    delBtn.classList.add("delete");


    controlsField.replaceChildren(cancelBtn, saveBtn);

    modal.replaceChildren(headerElem, ...(formElements.nodes), controlsField);

    document.body.appendChild(modal);

    const inputDate = formElements.elements[0] as HTMLInputElement;
    const churchSelector = formElements.elements[1] as ChurchSelector;
    const inputNote = formElements.elements[2] as HTMLInputElement;
    const messdienerAllocator = formElements.elements[3] as MessdienerAllocator;

    document.body.appendChild(modal);

    churchSelector.readonly = true;


    const cancel = addSubscription(ListenerEndpoints.AllMasses, (data: Mass[]) => {
        const mass = data.filter(m => m.id == id)[0];

        const setDate = new Date(Number(String(mass.date).substring(0, 4)),
            Number(String(mass.date).substring(4, 6)) - 1,
            Number(String(mass.date).substring(6, 8)) + 1);
        const setNote = mass.note ? mass.note : "";

        messdienerAllocator.setAllocatedMessdiener(new Set<number>(mass.allocatedMessdiener));
        messdienerAllocator.setReferenceChurchID(mass.churchID);
        inputDate.valueAsDate = setDate;
        inputNote.value = setNote;
        churchSelector.initialiseWithStartID(mass.churchID);

        saveBtn.addEventListener("click", () => {
            if (inputDate.valueAsDate != setDate || inputNote.value != setNote) {
                modal.close();
                const numericDate = Number(inputDate.value.split("-").reduce((acc, currentValue) => acc + currentValue));
                 window.electronAPI.editMass({
                    id: mass.id,
                    date: inputDate.valueAsDate != setDate ? numericDate : 0,
                    churchID: 0,
                    note: inputNote.value != setNote ? inputNote.value : undefined,
                    allocatedMessdiener: new Set<number>()
                });
            }
            const setDivergences: MessdienerMassAllocation[] = [];
            const malloced = messdienerAllocator.getAllocatedMessdiener();

            malloced.forEach(messdienerID => {
                if (!mass.allocatedMessdiener.has(messdienerID)) {
                    setDivergences.push({
                        messdienerID: messdienerID,
                        massID: id,
                        isActive: true
                    })
                }
            })
            mass.allocatedMessdiener.forEach(messdienerID => {
                if (!malloced.has(messdienerID)) {
                    setDivergences.push({
                        messdienerID: messdienerID,
                        massID: id,
                        isActive: false
                    })
                }
            })
            if (setDivergences.length != 0) {
                modal.close();
                console.log(setDivergences);
                window.electronAPI.changeMessdienerMassAllocation(setDivergences);
            }
        })
    })

    modal.querySelector<HTMLButtonElement>("button.cancel")?.addEventListener("click", () => modal.close());

    // @TODO implement confirmation
    const attainConfirmation = () => new Promise<void>((resolve) => resolve())

    delBtn.onclick = () => {
        attainConfirmation().then(() => {
            modal.close();
            window.electronAPI.deleteMass(id);
        })
    }

    return {
        element: modal,
        destroy: () => {
            cancel();
            modal.remove();
        },
        show: () => modal.showModal(),
        hide: () => modal.close(),
    };
}