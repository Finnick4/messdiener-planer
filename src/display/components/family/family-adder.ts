import {Family, Mass} from "../../../shared/general";
import {getData, ListenerEndpoints} from "../../state/state-manager";
import {createInternalFamilyName} from "../../logic/family";
import {getFamilyMembershipsMap} from "../../state/specific-entries";

export class FamilyAdder extends HTMLElement {
    constructor() {
        super();
    }
    private selectedFamilies = new Set<number>();
    private referenceChurchID: number | undefined;

    connectedCallback() {
        this.setSelectedFamilies(new Set<number>());
        this.classList.add("select", "adder", "list");
    }
    setSelectedFamilies(ids: Set<number>) {
        this.selectedFamilies = new Set<number>(ids);
        this.updateContent();
    }
    setReferenceChurchID(id: number) {
        this.referenceChurchID = id;
        this.updateContent();
    }
    updateContent() {
        Promise.all([
            getFamilyMembershipsMap(),
            getData(ListenerEndpoints.AllFamilies),
            getData(ListenerEndpoints.AllMasses)
        ]).then(resps => {
            const familyMemberships = resps[0];
            const data: Family[] = resps[1];
            const masses: Mass[] = resps[2];

            const selectableFamilies = data.filter(family => !this.selectedFamilies.has(family.id));
            let familyPoolSize = selectableFamilies.length;

            const checkIfEmpty = () => {
                if (familyPoolSize == 0) {
                    const placeholder = document.createElement("p");
                    placeholder.classList.add("placeholder");
                    placeholder.innerText = "Es bestehen keine Familien, welche der Messe zugewiesen werden können!"
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
                elem.append(sizeTag, nameElem, countElem, addBtn);

                const familyMembers = familyMemberships.get(family.id);

                if (!familyMembers) {
                    return elem;
                }

                if (this.referenceChurchID) {
                    let effectiveSize = 0;
                    for (const messdiener of familyMembers) {
                        if (this.referenceChurchID && messdiener.churchActivity.has(this.referenceChurchID)) {
                            effectiveSize++;
                        }
                    }
                    sizeTag.innerText = String(effectiveSize);
                    if (effectiveSize == 0) {
                        elem.remove()
                    }
                }

                let massCount = 0;
                for (const mass of masses) {
                    for (const member of familyMembers) {
                        if (this.referenceChurchID) {
                            if (member.churchActivity.has(this.referenceChurchID) && mass.allocatedMessdiener.has(member.identifier)) {
                                massCount++;
                                break;
                            }
                        } else {
                            if (mass.allocatedMessdiener.has(member.identifier)) {
                                massCount++;
                                break;
                            }
                        }
                    }
                }

                countElem.innerText = `${massCount} Messe${massCount != 1 ? "n" : ""}`;

                return elem;
            }

            this.replaceChildren(...(selectableFamilies.map(makeElement)));
            checkIfEmpty();
        })
    }

    onedit(ids: Set<number>) {
        return;
    }

    getSelectedFamilies(): Set<number> {
        return this.selectedFamilies;
    }
}

export default FamilyAdder