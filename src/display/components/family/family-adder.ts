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
            let familyPoolSize = selectableFamilies.length;

            const checkIfEmpty = () => {
                if (familyPoolSize == 0) {
                    const placeholder = document.createElement("p");
                    placeholder.classList.add("placeholder");
                    placeholder.innerHTML = "Es bestehen keine Familien, welche der Messe zugewiesen werden können!"
                    this.replaceChildren(placeholder);
                }
            }

            const makeElement = (family: Family): HTMLDivElement => {
                const elem = document.createElement("div");
                const sizeTag = document.createElement("div");
                const nameElem = document.createElement("div");
                const countElem = document.createElement("div");
                const addBtn = document.createElement("button");

                sizeTag.innerText = String(family.memberSize);
                nameElem.innerText = createInternalFamilyName(family.lastNameInternal, family.lastNameDisplay);
                countElem.innerText = "0 Messen";
                addBtn.innerText = "+";

                sizeTag.classList.add("tag");
                countElem.classList.add("value");

                addBtn.addEventListener("click", () => {
                    this.selectedFamilies.add(family.id);
                    elem.remove();
                    familyPoolSize--;
                    checkIfEmpty();
                    this.onedit(this.selectedFamilies);
                })

                elem.classList.add("row", "entry");
                elem.dataset.familyId = String(family.id);
                elem.replaceChildren(sizeTag, nameElem, countElem, addBtn);

                return elem;
            }

            this.replaceChildren(...(selectableFamilies.map(family => makeElement(family))));
            checkIfEmpty();
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