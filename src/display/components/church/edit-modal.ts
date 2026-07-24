import {Church} from "../../../shared/general";
import {ModalManager} from "../../types";
import {generateHTMLElementsForm} from "../form-creator";
import {getChurch} from "../../state/specific-entries";


export const generateEditChurchModal = (id: number): ModalManager => {
   const modal = document.createElement("dialog");
    modal.classList.add("church-edit", "modal", "form");

    let hasBeenInitialised = false;

    const initialiseModalElements = () => {

        const headerElem = document.createElement("h1");
        headerElem.innerText = "Kirche bearbeiten";

        const formElements = generateHTMLElementsForm([
            {tagName: "input", labelText: "Name", type: "text"},
            {tagName: "input", labelText: "Ort (Optional)", type: "text"},
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

        const inputName = formElements.elements[0] as HTMLInputElement;
        const inputLocation = formElements.elements[1] as HTMLInputElement;

        document.body.appendChild(modal);

        getChurch(id).then((church: Church | undefined) => {
            if (!church) {
                return;
            }

            inputName.value = church.name;
            inputLocation.value = church.location != undefined ? church.location : "";

            saveBtn.addEventListener("click", () => {

                if (inputName.value != church.name || inputLocation.value != church.location) {
                    modal.close();
                    window.electronAPI.editChurch({
                        id: church.id,
                        name: inputName.value,
                        location: inputLocation.value != "" ? inputLocation.value : undefined
                    });
                }
            })
        })

        modal.querySelector<HTMLButtonElement>("button.cancel")?.addEventListener("click", () => modal.close());

        // @TODO implement confirmation
        const attainConfirmation = () => new Promise<void>((resolve) => resolve())

        delBtn.onclick = () => {
            attainConfirmation().then(() => {
                modal.close();
                window.electronAPI.deleteChurch(id);
            })
        }

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