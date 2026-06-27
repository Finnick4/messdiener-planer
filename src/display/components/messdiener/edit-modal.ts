import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Messdiener} from "../../../shared/general";
import {ModalManager} from "../../types";

let editMessdienerModalCount = 0;

export const generateEditMessdienerModal = (id: number): ModalManager => {
    editMessdienerModalCount++;
    const modal = document.createElement("dialog");

    modal.classList.add("messdiener-edit");
    modal.classList.add("modal");
    modal.classList.add("form");

    const numberOfInputElement = 1;
    const inputElementIDs: string[] = new Array<string>(numberOfInputElement);
    for (let i = 0; i < numberOfInputElement; i++) {
        inputElementIDs[i] = `modal-edit-messdiener-${editMessdienerModalCount}-input-${i}`;
    }

    modal.innerHTML = `
        <h1>Messdiener bearbeiten</h1>
        <div class="field">
            <label class="label" for="${inputElementIDs[0]}}">Vorname</label>
            <input type="text" id="${inputElementIDs[0]}">
        </div>
        <div class="field controls">
            <button class="cancel">Abbrechen</button>
            <button class="save">Speichern</button>
        </div>
        `

    document.body.appendChild(modal);

    const inputElements: HTMLInputElement[] = inputElementIDs.map(id => {
        const e = modal.querySelector<HTMLInputElement>("#" + id);
        if (!e) {
            modal.innerHTML = "<h1>A fatal error occurred!</h1>";
            console.error("Encountered issue with getting input element with id of " + id);
            return new HTMLInputElement();
        }
        return e;
    })
    const saveBtn = ((): HTMLButtonElement => {
        const btn = modal.querySelector<HTMLButtonElement>("button.save");
        if(!btn) {
            modal.innerHTML = "<h1>A fatal error occurred!</h1>";
            console.error("Encountered issue with getting save button!");
            return new HTMLButtonElement();
        }
        return btn
    })()

    const cancel = addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => {
        const messdiener = data.filter(m => m.identifier == id)[0];

        const inputName = inputElements[0];

        inputName.value = messdiener.name;
        saveBtn.addEventListener("click", () => {
            if (inputName.value != messdiener.name) {
                modal.close();
                window.electronAPI.editMessdiener({
                    identifier: messdiener.identifier,
                    name: inputName.value
                });
            }
        })
    })

    modal.querySelector<HTMLButtonElement>("button.cancel")?.addEventListener("click", () => modal.close());

    modal.querySelectorAll<HTMLInputElement>("input").forEach(inputElem => {
        const index = inputElementIDs.findIndex(id => id == inputElem.id);
        const nextElementIndex = index + 1;
        inputElem.addEventListener("keypress", (e: KeyboardEvent)=> {
            if (e.key == "Enter") {
                inputElem.blur();
                if (inputElements.length < nextElementIndex) {
                    inputElements[nextElementIndex].focus();
                } else {
                    saveBtn.click();
                }
            }
        })
    })

    return {
        element: modal,
        destroy: () => (() => {
            let modalExists = true;
            return () => {
                if (modalExists) {
                    cancel();
                    modal.remove();
                    modalExists = false;
                }
            }
        })(),
        show: () => modal.showModal(),
        hide: () => modal.close(),
    };
}