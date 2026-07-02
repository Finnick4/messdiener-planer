import {getUniqueCount} from "../../builder/utilities";

export class ChurchCreateButton extends HTMLElement {
    private disconnectedHandler() {
        return;
    }

    connectedCallback() {
        this.innerHTML = "Kirche erstellen";
        this.classList.add("button", "create");

        const modal = document.createElement("dialog");

        modal.classList.add("church-create");
        modal.classList.add("modal");
        modal.classList.add("form");

        const numberOfInputElement = 2;
        const inputElementIDs: string[] = new Array<string>(numberOfInputElement);
        for (let i = 0; i < numberOfInputElement; i++) {
            inputElementIDs[i] = `modal-create-church-input-${getUniqueCount()}`;
        }

        modal.innerHTML = `
        <h1>Kirche erstellen</h1>
        <div class="field">
            <label class="label" for="${inputElementIDs[0]}}">Name</label>
            <input type="text" id="${inputElementIDs[0]}">
        </div>
        <div class="field">
            <label class="label" for="${inputElementIDs[1]}}">Ort (Optional)</label>
            <input type="text" id="${inputElementIDs[1]}">
        </div>
        <div class="field controls">
            <button class="cancel">Abbrechen</button>
            <button class="save">Erstellen</button>
        </div>
        `

        document.body.appendChild(modal);

        const inputName = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[0]);
        const inputLocation = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[1]);

        const saveBtn = modal.querySelector<HTMLButtonElement>("button.save");

        if (!inputName || !saveBtn || !inputLocation) {
            modal.innerHTML = "<h1>A fatal error occurred!</h1>";
            return;
        }

        saveBtn.addEventListener("click", () => {
            if (inputName.value == "") {
                console.log("Cannot create church with empty name!")
                return
            }

            window.electronAPI.createChurch(inputName.value, inputLocation.value == "" ? undefined : inputLocation.value);
            modal.close();
            inputName.value = "";
            inputLocation.value = "";
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