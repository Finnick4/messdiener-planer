import {getUniqueCount} from "../../builder/utilities";
import {ChurchSelector} from "../church/church-selector";

export class MassCreateButton extends HTMLElement {
    private disconnectedHandler() {
        return;
    }

    connectedCallback() {
        this.innerText = "Messe erstellen";
        this.classList.add("button", "create");

        const modal = document.createElement("dialog");

        modal.classList.add("mass-create", "modal", "form");

        const numberOfInputElement = 3;
        const inputElementIDs: string[] = new Array<string>(numberOfInputElement);
        for (let i = 0; i < numberOfInputElement; i++) {
            inputElementIDs[i] = `modal-create-mass-input-${getUniqueCount()}`;
        }

        modal.innerHTML = `
        <h1>Messe erstellen</h1>
        <div class="field">
            <label class="label" for="${inputElementIDs[0]}}">Datum</label>
            <input type="date" id="${inputElementIDs[0]}">
        </div>
        <div class="field">
            <label class="label" for="${inputElementIDs[1]}}">Kirche</label>
            <select is="church-selector" id="${inputElementIDs[1]}"></select>
        </div>
        <div class="field">
            <label class="label" for="${inputElementIDs[2]}}">Notiz (Optional)</label>
            <input type="text" id="${inputElementIDs[2]}">
        </div>
        <div class="field controls">
            <button class="cancel">Abbrechen</button>
            <button class="save">Erstellen</button>
        </div>
        `

        document.body.appendChild(modal);

        const inputDate = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[0]);
        const churchSelector = modal.querySelector<ChurchSelector>("#" + inputElementIDs[1]);
        const inputNote = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[2]);

        const saveBtn = modal.querySelector<HTMLButtonElement>("button.save");

        if (!inputDate || !churchSelector || !inputNote || !saveBtn) {
            modal.innerText = "<h1>A fatal error occurred!</h1>";
            return;
        }

        saveBtn.addEventListener("click", () => {
            if (inputDate.value == "") {
                console.log("Cannot create mass without a date!")
                return
            }

            if (churchSelector.getSelectedChurch() == 0) {
                console.log("Cannot create mass without a church!")
                return
            }
            const numericDate = Number(inputDate.value.split("-").reduce((acc, currentValue) => acc + currentValue));

            window.electronAPI.createMass(numericDate, churchSelector.getSelectedChurch(), inputNote.value == "" ? undefined : inputNote.value);
            modal.close();
            inputNote.value = "";
            inputDate.value = "";
            churchSelector.initialiseWithStartID(0);
        })

        this.onclick = () => {
            modal.showModal();
        }
        modal.querySelector<HTMLButtonElement>("button.cancel")?.addEventListener("click", () => modal.close());

        this.disconnectedHandler = () => {
            modal.remove()
        }
    }

    disconnectedCallback() {
        this.disconnectedHandler()
    }
}