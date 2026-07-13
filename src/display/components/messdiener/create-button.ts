import {getUniqueCount} from "../../builder/utilities";
import {FamilySelector} from "../family/family-selector";
import {Family} from "../../../shared/general";
import {ChurchSelectorMultiple} from "../church/church-selector-multiple";

export class MessdienerCreateButton extends HTMLElement {
    private disconnectedHandler() {
        return;
    }

    connectedCallback() {
        this.innerText = "Messdiener erstellen";
        this.classList.add("button", "create");

        const modal = document.createElement("dialog");

        modal.classList.add("messdiener-create");
        modal.classList.add("modal");
        modal.classList.add("form");

        const numberOfInputElement = 6;
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
        <div class="field">
            <label class="label" for="${inputElementIDs[5]}">Kirchengemeinden</label>
            <select is="church-selector-multiple" id="${inputElementIDs[5]}"></select>
        </div>
        <div class="field controls">
            <button class="cancel">Abbrechen</button>
            <button class="save">Erstellen</button>
        </div>
        `

        document.body.appendChild(modal);

        const inputName = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[0]);
        const familySelector = modal.querySelector<FamilySelector>("#" + inputElementIDs[1]);
        const inputFamDispl = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[2]);
        const inputFamIntern = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[3]);
        const inputFamShort = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[4]);
        const churchSelector = modal.querySelector<ChurchSelectorMultiple>("#" + inputElementIDs[5]);

        const saveBtn = modal.querySelector<HTMLButtonElement>("button.save");

        if (!inputName || !saveBtn || !familySelector || !inputFamDispl || !inputFamIntern || !inputFamShort || !churchSelector) {
            modal.innerText = "<h1>A fatal error occurred!</h1>";
            return;
        }
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
        modal.querySelector<HTMLButtonElement>("button.cancel")?.addEventListener("click", () => modal.close());

        this.disconnectedHandler = () => {
            modal.remove()
        }
    }

    disconnectedCallback() {
        this.disconnectedHandler()
    }
}