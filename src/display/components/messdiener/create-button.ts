import {getUniqueCount} from "../../builder/utilities";

export class MessdienerCreateButton extends HTMLElement {
    private disconnectedHandler() {
        return;
    }

    connectedCallback() {
        this.innerHTML = "Messdiener erstellen";
        this.classList.add("button");

        const modal = document.createElement("dialog");

        modal.classList.add("messdiener-create");
        modal.classList.add("modal");
        modal.classList.add("form");

        const numberOfInputElement = 1;
        const inputElementIDs: string[] = new Array<string>(numberOfInputElement);
        for (let i = 0; i < numberOfInputElement; i++) {
            inputElementIDs[i] = `modal-create-messdiener-input-${getUniqueCount()}`;
        }

        modal.innerHTML = `
        <h1>Messdiener erstellen</h1>
        <div class="field">
            <label class="label" for="${inputElementIDs[0]}}">Vorname</label>
            <input type="text" id="${inputElementIDs[0]}">
        </div>
        <div class="field controls">
            <button class="cancel">Abbrechen</button>
            <button class="save">Erstellen</button>
        </div>
        `

        document.body.appendChild(modal);

        const inputName = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[0]);
        const saveBtn = modal.querySelector<HTMLButtonElement>("button.save");

        if (inputName == null || saveBtn == null) {
            modal.innerHTML = "<h1>A fatal error occurred!</h1>";
            return;
        }

        saveBtn.addEventListener("click", () => {
            if (inputName.value == "") {
                console.log("Cannot create Messsdiener with empty name!")
                return
            }
            window.electronAPI.createMessdiener(inputName.value);
            modal.close();
            inputName.value = "";
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