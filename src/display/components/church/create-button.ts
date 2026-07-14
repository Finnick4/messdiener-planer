import {getUniqueCount} from "../../builder/utilities";
import {generateHTMLElementsForm} from "../form-creator";

export class ChurchCreateButton extends HTMLElement {
    private disconnectedHandler() {
        return;
    }

    connectedCallback() {
        this.innerText = "Kirche erstellen";
        this.classList.add("button", "create");

        const modal = document.createElement("dialog");

        modal.classList.add("church-create", "modal", "form");

        const headerElem = document.createElement("h1");
        headerElem.innerText = "Kirche erstellen";

        const formElements = generateHTMLElementsForm([
            {tagName: "input", labelText: "Name", type: "text"},
            {tagName: "input", labelText: "Ort (Optional)", type: "text"},
        ])

        const controlsField = document.createElement("div");
        const cancelBtn = document.createElement("button");
        const saveBtn = document.createElement("button");
        cancelBtn.innerText = "Abbrechen";
        saveBtn.innerText = "Speichern";
        controlsField.classList.add("field", "controls");
        cancelBtn.classList.add("cancel");
        saveBtn.classList.add("save");


        controlsField.replaceChildren(cancelBtn, saveBtn);

        modal.replaceChildren(headerElem, ...(formElements.nodes), controlsField);

        document.body.appendChild(modal);

        const inputName = formElements.elements[0] as HTMLInputElement;
        const inputLocation = formElements.elements[1] as HTMLInputElement;


        document.body.appendChild(modal);

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