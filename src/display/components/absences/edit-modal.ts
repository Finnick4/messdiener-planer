import {Absence} from "../../../shared/general";
import {ModalManager} from "../../types";
import {MessdienerAllocator} from "../messdiener/allocator";
import {generateHTMLElementsForm} from "../form-creator";
import {getAbsence} from "../../state/specific-entries";

export const generateEditAbsenceModal = (id: number): ModalManager => {
    const modal = document.createElement("dialog");
    modal.classList.add("absence-edit", "modal", "form");

    let hasBeenInitialised = false;

    const initialiseModalElements = () => {
        const headerElem = document.createElement("h1");
        headerElem.innerText = "Abwesenheit bearbeiten";

        const formElements = generateHTMLElementsForm([
            {tagName: "input", labelText: "Startdatum", type: "date"},
            {tagName: "input", labelText: "Enddatum (Inklusive)", type: "date"},
            {tagName: "messdiener-allocator", labelText: "Messdiener Zuweisung"},
        ])

        const controlsField = document.createElement("div");
        const cancelBtn = document.createElement("button");
        const saveBtn = document.createElement("button");
        cancelBtn.innerText = "Abbrechen";
        saveBtn.innerText = "Speichern";
        controlsField.classList.add("field", "controls");
        cancelBtn.classList.add("cancel");
        saveBtn.classList.add("save");


        controlsField.append(cancelBtn, saveBtn);

        modal.append(headerElem, ...(formElements.nodes), controlsField);

        document.body.appendChild(modal);

        const inputStartDate = formElements.elements[0] as HTMLInputElement;
        const inputEndDate = formElements.elements[1] as HTMLInputElement;
        const messdienerAllocator = formElements.elements[2] as MessdienerAllocator;

        getAbsence(id).then((absence: Absence | undefined) => {
            if (!absence) {
                headerElem.innerText = "Unbekannte Abwesenheit!";
                modal.replaceChildren(headerElem);
                return;
            }

            const setStartDate = new Date(Number(String(absence.startDate).substring(0, 4)),
                Number(String(absence.startDate).substring(4, 6)) - 1,
                Number(String(absence.startDate).substring(6, 8)) + 1);
            const setEndDate = new Date(Number(String(absence.endDate).substring(0, 4)),
                Number(String(absence.endDate).substring(4, 6)) - 1,
                Number(String(absence.endDate).substring(6, 8)) + 1);

            messdienerAllocator.setAllocatedMessdiener(new Set<number>(absence.affectedMessdiener));
            inputStartDate.valueAsDate = setStartDate;
            inputEndDate.valueAsDate = setEndDate;

            saveBtn.addEventListener("click", () => {
                if (inputStartDate.valueAsDate?.getTime() != setStartDate.getTime() || inputEndDate.valueAsDate?.getTime() != setEndDate.getTime()) {
                    modal.close();
                    const numericStartDate = Number(inputStartDate.value.split("-").reduce((acc, currentValue) => acc + currentValue));
                    const numericEndDate = Number(inputEndDate.value.split("-").reduce((acc, currentValue) => acc + currentValue));

                    window.electronAPI.editAbsence({
                        id: id,
                        startDate: inputStartDate.valueAsDate?.getTime() != setStartDate.getTime() ? numericStartDate : 0,
                        endDate: inputEndDate.valueAsDate?.getTime() != setEndDate.getTime() ? numericEndDate : 0,
                        affectedMessdiener: new Set<number>()
                    });
                }
                const addedMessdiener: number[] = [];
                const removedMessdiener: number[] = [];
                const malloced = messdienerAllocator.getAllocatedMessdiener();

                malloced.forEach(messdienerID => {
                    if (!absence.affectedMessdiener.has(messdienerID)) {
                        addedMessdiener.push(messdienerID);
                    }
                })
                absence.affectedMessdiener.forEach(messdienerID => {
                    if (!malloced.has(messdienerID)) {
                        removedMessdiener.push(messdienerID);
                    }
                })
                if (addedMessdiener.length != 0 || removedMessdiener.length != 0) {
                    modal.close();
                    window.electronAPI.changeAbsenceAffection(id, addedMessdiener, removedMessdiener);
                }
            })
        })

        modal.querySelector<HTMLButtonElement>("button.cancel")?.addEventListener("click", () => modal.close());

        hasBeenInitialised = true;
    }

    return {
        element: modal,
        destroy: () => {
            modal.remove();
        },
        show: () => {
            if (!hasBeenInitialised) {
                initialiseModalElements();
            }
            modal.showModal();
        },
        hide: () => modal.close(),
    };
}