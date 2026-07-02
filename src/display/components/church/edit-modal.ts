import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Church} from "../../../shared/general";
import {ModalManager} from "../../types";

let editChurchModalCount = 0;

export const generateEditChurchModal = (id: number): ModalManager => {
    const thisModalCount = editChurchModalCount++;
    const modal = document.createElement("dialog");

    modal.classList.add("church-edit");
    modal.classList.add("modal");
    modal.classList.add("form");

    const numberOfInputElement = 2;
    const inputElementIDs: string[] = new Array<string>(numberOfInputElement);
    for (let i = 0; i < numberOfInputElement; i++) {
        inputElementIDs[i] = `modal-edit-church-${thisModalCount}-input-${i}`;
    }

    modal.innerHTML = `
        <h1>Messdiener bearbeiten</h1>
        <div class="field">
            <label class="label" for="${inputElementIDs[0]}}">Vorname</label>
            <input type="text" id="${inputElementIDs[0]}">
        </div>
        <div class="field">
            <label class="label" for="${inputElementIDs[1]}}">Familienname</label>
            <input type="text" id="${inputElementIDs[1]}">
        </div>
        <div class="field controls">
            <button class="cancel">Abbrechen</button>
            <button class="save">Speichern</button>
            <button class="delete">Löschen</button>
        </div>
        `

    document.body.appendChild(modal);

    const inputName = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[0]);
    const inputLocation = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[1]);

    const saveBtn = modal.querySelector<HTMLButtonElement>("button.save");
    const delBtn = modal.querySelector<HTMLButtonElement>("button.delete");

    if (!inputName || !saveBtn || !inputLocation || !delBtn) {
        modal.innerHTML = "<h1>A fatal error occurred!</h1>";
        console.error("Encountered issue with getting inputs of edit church modal!");
        return {
            element: modal,
            destroy: () => (() => {
                let modalExists = true;
                return () => {
                    if (modalExists) {
                        modal.remove();
                        modalExists = false;
                    }
                }
            })(),
            show: () => modal.showModal(),
            hide: () => modal.close(),
        };
    }

    const cancel = addSubscription(ListenerEndpoints.AllChurches, (data: Church[]) => {
        const church = data.filter(c => c.id == id)[0];

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