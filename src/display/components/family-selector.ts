import {Family} from "../../shared/general";
import {addSubscription, ListenerEndpoints} from "../state/state-manager";
import {createInternalFamilyName} from "../logic/family";

export class FamilySelector extends HTMLSelectElement {
    constructor() {
        super();
    }
    private removeModal() {
        return;
    }
    private closeSubscription() {
        return;
    }
    private selectedFamilyID = 0;

    connectedCallback() {
        this.closeSubscription = addSubscription(ListenerEndpoints.AllFamilies, (data: Family[]) => {
            const makeOptionElement = (text: string, id: number): HTMLOptionElement => {
                const option = document.createElement("option");
                option.innerText = text;
                option.dataset.familyId = String(id);
                option.value = String(id);
                option.addEventListener("mouseup", () => {
                    this.selectedFamilyID = id;
                    this.onedit(id);
                })
                option.selected = this.selectedFamilyID == id;

                return option;
            }

            const options: HTMLOptionElement[] = [makeOptionElement("Neue Familie erstellen", 0)].concat(data.map(family => makeOptionElement(createInternalFamilyName(family.lastNameInternal, family.lastNameDisplay), family.id)));

            this.replaceChildren(...options);

        })
    }

    disconnectedCallback() {
        this.removeModal();
        this.closeSubscription();
    }
    onedit(newFamily: number) {
        return;
    }

    getSelectedFamily() {
        return this.selectedFamilyID;
    }
}