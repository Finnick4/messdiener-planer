import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Messdiener} from "../../../shared/general";
import {getUniqueCount} from "../../builder/utilities";

export class MessdienerEditButton extends HTMLElement {
    private disconnectedHandler() {
        return;
    }

    connectedCallback() {
        this.innerHTML = "&#8943;";
        this.classList.add("button");
    }
    setMessdiener(id: number) {
        const modal = document.createElement("dialog");

        modal.classList.add("messdiener-edit");
        modal.classList.add("modal");
        modal.classList.add("form");

        const numberOfInputElement = 1;
        const inputElementIDs: string[] = new Array<string>(numberOfInputElement);
        for (let i = 0; i < numberOfInputElement; i++) {
            inputElementIDs[i] = `modal-edit-messdiener-input-${getUniqueCount()}`;
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

        const cancel = addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => new Promise<void>((resolve) => {
            const messdiener = data.filter(m => m.identifier == id)[0];

            const inputName = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[0]);
            const saveBtn = modal.querySelector<HTMLButtonElement>("button.save");

            if (inputName == null || saveBtn == null) {
                modal.innerHTML = "<h1>A fatal error occurred!</h1>";
                resolve();
                return;
            }

            inputName.value = messdiener.name;
            saveBtn.addEventListener("click", () => {
                if (inputName.value != messdiener.name) {
                    console.log("Edit name!");
                }
                modal.close();
            })

            resolve();
        }))
        this.onclick = () => {
            modal.showModal();
        }
        modal.querySelector<HTMLButtonElement>("button.cancel")?.addEventListener("click", () => modal.close());



        this.disconnectedHandler = () => {
            cancel();
            modal.remove()
            document.body.removeChild(modal);
        }
    }
    disconnectedCallback() {
        this.disconnectedHandler()
    }
}