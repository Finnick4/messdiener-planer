import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Messdiener, MessdienerChurchActivityStatus} from "../../../shared/general";
import {ModalManager} from "../../types";
import {FamilySelector} from "../family/family-selector";
import {ChurchSelectorMultiple} from "../church/church-selector-multiple";
import {generateHTMLElementsForm} from "../form-creator";

export const generateEditMessdienerModal = (id: number): ModalManager => {
    const modal = document.createElement("dialog");

    modal.classList.add("messdiener-edit", "modal", "form");

    const headerElem = document.createElement("h1");
    headerElem.innerText = "Messdiener bearbeiten";

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
    const delBtn = document.createElement("button");
    cancelBtn.innerText = "Abbrechen";
    saveBtn.innerText = "Speichern";
    delBtn.innerText = "Löschen";
    controlsField.classList.add("field", "controls");
    cancelBtn.classList.add("cancel");
    saveBtn.classList.add("save");
    delBtn.classList.add("delete");

    controlsField.replaceChildren(cancelBtn, saveBtn, delBtn);

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

    const cancel = addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => {
        const messdiener = data.filter(m => m.identifier == id)[0];
        familySelector.initialiseWithStartID(messdiener.familyID);
        churchSelector.initialiseWithStartIDs(new Set<number>(messdiener.churchActivity));

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
                    familyID: familyID == messdiener.familyID ? 0 : familyID,
                    churchActivity: new Set<number>(),
                    absences: []
                });
            }
            const setDivergences: MessdienerChurchActivityStatus[] = [];

            const selChurches = churchSelector.getSelectedChurches();

            selChurches.forEach(churchID => {
                if (!messdiener.churchActivity.has(churchID)) {
                    setDivergences.push({
                        messdienerID: id,
                        churchID: churchID,
                        isActive: true
                    })
                }
            })
            messdiener.churchActivity.forEach(churchID => {
                if (!selChurches.has(churchID)) {
                    setDivergences.push({
                        messdienerID: id,
                        churchID: churchID,
                        isActive: false
                    })
                }
            })
            if (setDivergences.length != 0) {
                modal.close();
                window.electronAPI.changeMessdienerChurchActivity(setDivergences);
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
        destroy: () => {
            modal.remove();
            cancel();
        },
        show: () => modal.showModal(),
        hide: () => modal.close(),
    };
}