import {Family} from "../../../shared/general";
import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {createInternalFamilyName} from "../../logic/family";

export class FamilyAdder extends HTMLElement {
    constructor() {
        super();
    }
    private closeSubscription() {
        return;
    }
    private selectedFamilies = new Set<number>();

    connectedCallback() {
        this.setSelectedFamilies(new Set<number>());
        this.classList.add("select", "adder", "list");
    }
    setSelectedFamilies(ids: Set<number>) {
        this.closeSubscription();
        this.selectedFamilies = ids;
        this.onedit(ids);
        this.closeSubscription = addSubscription(ListenerEndpoints.AllFamilies, (data: Family[]) => {
            const selectableFamilies = data.filter(family => !this.selectedFamilies.has(family.id));

            const makeElement = (family: Family): HTMLDivElement => {
                const elem = document.createElement("div");
                const nameElem = document.createElement("div");
                const countElem = document.createElement("div");
                const addBtn = document.createElement("button");
                nameElem.innerText = createInternalFamilyName(family.lastNameInternal, family.lastNameDisplay);
                countElem.innerText = "0 Messen";
                addBtn.innerText = "+";

                countElem.classList.add("value");

                elem.classList.add("row", "entry");
                elem.dataset.familyId = String(family.id);
                elem.replaceChildren(nameElem, countElem, addBtn);

                return elem;
            }

            this.replaceChildren(...(selectableFamilies.map(family => makeElement(family))));
        })
    }

    disconnectedCallback() {
        this.closeSubscription();
    }
    onedit(ids: Set<number>) {
        return;
    }

    getSelectedFamilies(): Set<number> {
        return this.selectedFamilies;
    }
}