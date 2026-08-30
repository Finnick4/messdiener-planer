import {Absence} from "../../../shared/general";
import {ModalManager} from "../../types";
import {MessdienerAllocator} from "../messdiener/allocator";
import {generateHTMLElementsForm} from "../form-creator";
import {getAbsence} from "../../state/specific-entries";
import {makeDateNumberToDate} from "../../../shared/dates";
import {makeConfirmButton} from "../../logic/confirm-button";

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
        const delBtn = document.createElement("button");
        cancelBtn.innerText = "Abbrechen";
        saveBtn.innerText = "Speichern";
        controlsField.classList.add("field", "controls");
        cancelBtn.classList.add("cancel");
        saveBtn.classList.add("save");
        delBtn.classList.add("delete");


        controlsField.append(cancelBtn, saveBtn, delBtn);

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

            const setStartDate =  makeDateNumberToDate(absence.startDate);
            const setEndDate = makeDateNumberToDate(absence.endDate);

            messdienerAllocator.setAllocatedMessdiener(new Set<number>(absence.affectedMessdiener));
            inputStartDate.valueAsDate = setStartDate;
            inputEndDate.valueAsDate = setEndDate;

            saveBtn.addEventListener("click", () => {
                modal.close();
                if (inputStartDate.valueAsDate?.getTime() != setStartDate.getTime() || inputEndDate.valueAsDate?.getTime() != setEndDate.getTime()) {
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

        cancelBtn.addEventListener("click", () => modal.close());

        makeConfirmButton("Löschen", delBtn, () => {
            modal.close();
            window.electronAPI.deleteAbsence(id);
        });

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