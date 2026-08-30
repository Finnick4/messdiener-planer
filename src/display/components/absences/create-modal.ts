import {ModalManager} from "../../types";
import {MessdienerAllocator} from "../messdiener/allocator";
import {generateHTMLElementsForm} from "../form-creator";

export const generateCreateAbsenceModal = (): ModalManager => {
    const modal = document.createElement("dialog");
    modal.classList.add("absence-create", "modal", "form");

    let hasBeenInitialised = false;

    let closeModal = () => {
        return;
    }

    const initialiseModalElements = () => {
        const headerElem = document.createElement("h1");
        headerElem.innerText = "Abwesenheit erstellen";

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

        messdienerAllocator.setAllocatedMessdiener(new Set<number>());

        closeModal = () => {
            modal.close();
            inputStartDate.value = "";
            inputEndDate.value = "";
            messdienerAllocator.setAllocatedMessdiener(new Set<number>());
        }

        saveBtn.addEventListener("click", () => {
            [inputStartDate, inputEndDate, messdienerAllocator].forEach(e => e.classList.remove("has-issue"));
            let escape = false;
            if (inputStartDate.value == "") {
                console.info("Cannot create absence without a start date!");
                inputStartDate.classList.add("has-issue");
                if (!escape) inputStartDate.focus();
                escape = true;
            }
            if (inputEndDate.value == "") {
                console.info("Cannot create absence without an end date!");
                inputEndDate.classList.add("has-issue");
                if (!escape) inputEndDate.focus();
                escape = true;
            }
            if (messdienerAllocator.getAllocatedMessdiener().size == 0) {
                console.info("Cannot create absence without Messdiener!");
                messdienerAllocator.classList.add("has-issue");
                escape = true;
            }

            if (escape) {
                return;
            }

            const numericStartDate = Number(inputStartDate.value.split("-").reduce((acc, currentValue) => acc + currentValue));
            const numericEndDate = Number(inputEndDate.value.split("-").reduce((acc, currentValue) => acc + currentValue));
            const addedMessdiener: number[] = [];
            messdienerAllocator.getAllocatedMessdiener().forEach(messdienerID => addedMessdiener.push(messdienerID));
            window.electronAPI.createAbsence(numericStartDate, numericEndDate, addedMessdiener);

            closeModal();
        });


        cancelBtn.addEventListener("click", () => closeModal());

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
        hide: closeModal,
    };
}