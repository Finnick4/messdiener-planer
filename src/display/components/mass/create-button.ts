import {ChurchSelector} from "../church/church-selector";
import {generateHTMLElementsForm} from "../form-creator";

export class MassCreateButton extends HTMLElement {
    private disconnectedHandler() {
        return;
    }

    connectedCallback() {
        this.innerText = "Messe erstellen";
        this.classList.add("button", "create");

        const modal = document.createElement("dialog");

        modal.classList.add("mass-create", "modal", "form");

        const headerElem = document.createElement("h1");
        headerElem.innerText = "Messe erstellen";

        const formElements = generateHTMLElementsForm([
            {tagName: "input", labelText: "Datum", type: "date"},
            {tagName: "select", labelText: "Kirche (Final)", is: "church-selector"},
            {tagName: "input", labelText: "Notiz (Optional)", type: "text"},
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

        const inputDate = formElements.elements[0] as HTMLInputElement;
        const churchSelector = formElements.elements[1] as ChurchSelector;
        const inputNote = formElements.elements[2] as HTMLInputElement;

        document.body.appendChild(modal);

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