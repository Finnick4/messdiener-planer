import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Family, Messdiener} from "../../../shared/general";
import {ModalManager} from "../../types";
import {FamilySelector} from "../family-selector";

let editMessdienerModalCount = 0;

export const generateEditMessdienerModal = (id: number): ModalManager => {
    const thisModalCount = editMessdienerModalCount++;
    const modal = document.createElement("dialog");

    modal.classList.add("messdiener-edit");
    modal.classList.add("modal");
    modal.classList.add("form");

    const numberOfInputElement = 4;
    const inputElementIDs: string[] = new Array<string>(numberOfInputElement);
    for (let i = 0; i < numberOfInputElement; i++) {
        inputElementIDs[i] = `modal-edit-messdiener-${thisModalCount}-input-${i}`;
    }

    modal.innerHTML = `
        <h1>Messdiener bearbeiten</h1>
        <div class="field">
            <label class="label" for="${inputElementIDs[0]}}">Vorname</label>
            <input type="text" id="${inputElementIDs[0]}">
        </div>
        <div class="field">
            <label class="label" for="${inputElementIDs[1]}">Familienanhehörigkeit</label>
            <select is="family-selector" id="${inputElementIDs[1]}"></select>
        </div>
        <div class="field family">
            <label class="label" for="${inputElementIDs[2]}}">Familienname</label>
            <input type="text" id="${inputElementIDs[2]}">
        </div>
        <div class="field family">
            <label class="label" for="${inputElementIDs[3]}}">Abweichender interner Name (optional)</label>
            <input type="text" id="${inputElementIDs[3]}">
        </div>
        <div class="field family">
            <label class="label" for="${inputElementIDs[4]}}">Familienkürzel (optional)</label>
            <input type="text" id="${inputElementIDs[4]}">
        </div>
        <div class="field controls">
            <button class="cancel">Abbrechen</button>
            <button class="save">Speichern</button>
            <button class="delete">Löschen</button>
        </div>
        `

    document.body.appendChild(modal);

    const inputName = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[0]);
    const familySelector = modal.querySelector<FamilySelector>("#" + inputElementIDs[1]);
    const inputFamDispl = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[2]);
    const inputFamIntern = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[3]);
    const inputFamShort = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[4]);

    const saveBtn = modal.querySelector<HTMLButtonElement>("button.save");
    const delBtn = modal.querySelector<HTMLButtonElement>("button.delete");

    if (!inputName || !saveBtn || !familySelector || !inputFamDispl || !inputFamIntern || !inputFamShort || !delBtn) {
        modal.innerHTML = "<h1>A fatal error occurred!</h1>";
        console.error("Encountered issue with getting inputs of edit Messdiener modal!");
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

    familySelector.onedit = (changedID: number) => {
        if (changedID == 0) {
            modal.querySelectorAll(".field.family.hidden").forEach(e => e.classList.remove("hidden"));
        } else {
            modal.querySelectorAll(".field.family:not(.hidden)").forEach(e => e.classList.add("hidden"));
        }
    }

    const cancel = addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => {
        const messdiener = data.filter(m => m.identifier == id)[0];
        familySelector.initialiseWithStartID(messdiener.familyID);

        inputName.value = messdiener.firstName;

        saveBtn.addEventListener("click", () => {
            const familyID = familySelector.getSelectedFamily();

            if (inputName.value != messdiener.firstName || familyID != messdiener.familyID) {
                modal.close();
                window.electronAPI.editMessdiener({
                    identifier: messdiener.identifier,
                    firstName: inputName.value,
                    lastNameDisplay: familyID == 0 ? inputFamDispl.value : "",
                    lastNameInternal: familyID == 0 ? inputFamIntern.value : "",
                    lastNameShorthand: familyID == 0 ? inputFamShort.value : "",
                    familyID: messdiener.familyID
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
            window.electronAPI.deleteMessdiener(id);
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