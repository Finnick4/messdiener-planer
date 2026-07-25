import {FamilySelector} from "../family/family-selector";
import {Family} from "../../../shared/general";
import {ChurchSelectorMultiple} from "../church/church-selector-multiple";
import {generateHTMLElementsForm} from "../form-creator";

export class MessdienerCreateButton extends HTMLElement {
    private disconnectedHandler() {
        return;
    }

    connectedCallback() {
        this.innerText = "Messdiener erstellen";
        this.classList.add("button", "create");

        const modal = document.createElement("dialog");
        modal.classList.add("messdiener-create", "form", "modal");

        const headerElem = document.createElement("h1");
        headerElem.innerText = "Messdiener erstellen";

        const formElements = generateHTMLElementsForm([
            {tagName: "input", labelText: "Vorname", type: "text"},
            {tagName: "select", labelText: "Familienanhehörigkeit", is: "family-selector"},
            {tagName: "input", labelText: "Familienname", type: "text", fieldClasses: ["family"]},
            {tagName: "input", labelText: "Abweichender interner Name (optional)", type: "text", fieldClasses: ["family"]},
            {tagName: "input", labelText: "Familienkürzel (optional)", type: "text", fieldClasses: ["family"]},
            {tagName: "select", labelText: "Kirchengemeinden", is: "church-selector-multiple"},
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
        const familySelector = formElements.elements[1] as FamilySelector;
        const inputFamDispl = formElements.elements[2] as HTMLInputElement;
        const inputFamIntern = formElements.elements[3] as HTMLInputElement;
        const inputFamShort = formElements.elements[4] as HTMLInputElement;
        const churchSelector = formElements.elements[5] as ChurchSelectorMultiple;

        familySelector.onedit = (changedID: number) => {
            if (changedID == 0) {
                modal.querySelectorAll(".field.family.hidden").forEach(e => e.classList.remove("hidden"));
            } else {
                modal.querySelectorAll(".field.family:not(.hidden)").forEach(e => e.classList.add("hidden"));
            }
        }

        saveBtn.addEventListener("click", () => {
            if (inputName.value == "") {
                console.log("Cannot create Messsdiener with empty name!")
                return
            }
            const familyID = familySelector.getSelectedFamily();
            const newFamily: Family = {
                lastNameInternal: inputFamIntern.value,
                lastNameDisplay: inputFamDispl.value,
                shorthand: inputFamShort.value,
                id: -1,
                memberSize: 1
            };
            const activity: number[] = [];
            churchSelector.getSelectedChurches().forEach(churchID => activity.push(churchID));

            window.electronAPI.createMessdiener(inputName.value, familyID == 0 ? newFamily : familyID, activity.length == 0 ? undefined : activity);
            modal.close();
            inputName.value = "";
            inputFamDispl.value = "";
            inputFamIntern.value = "";
            inputFamShort.value = "";
            familySelector.initialiseWithStartID(0);
            churchSelector.initialiseWithStartIDs(new Set<number>());
        })

        this.onclick = () => {
            modal.showModal();
        }
        cancelBtn.addEventListener("click", () => modal.close());

        this.disconnectedHandler = () => {
            modal.remove()
        }
    }

    disconnectedCallback() {
        this.disconnectedHandler()
    }
}