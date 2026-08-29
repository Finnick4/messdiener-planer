import {Absence, AllocationStatus, Family, Mass, Messdiener} from "../../../shared/general";
import {getData, ListenerEndpoints} from "../../state/state-manager";
import {createInternalFamilyName} from "../../logic/family";
import {getAbsence, getAbsencesAffectingDate, getFamilyMembershipsMap} from "../../state/specific-entries";
import {getStatusOfMessdienerSetAt} from "../../state/allocation-status";

export class FamilyAdder extends HTMLElement {
    constructor() {
        super();
    }
    private selectedFamilies = new Set<number>();
    private referenceChurchID: number | undefined;
    private referenceDateNumber: number | undefined;

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
    setReferenceDateNumber(date: number) {
        this.referenceDateNumber = date;
        this.updateContent();
    }

    async updateContent() {
        const resps = await Promise.all([
            getFamilyMembershipsMap(),
            getData(ListenerEndpoints.AllFamilies),
            this.referenceDateNumber ? getAbsencesAffectingDate(this.referenceDateNumber) : new Promise<Absence[]>(resolve => resolve([]))
        ]);

        const familyMemberships = resps[0];
        const data: Family[] = resps[1];
        const relevantAbsences: Absence[] = resps[2];

        const selectableFamilies = data.filter(family => {
            if (this.selectedFamilies.has(family.id)) {
                return false;
            }
            for (const absence of relevantAbsences) {

                if (makeMessdienerIDSet(familyMemberships.get(family.id)).intersection(absence.affectedMessdiener).size > 0) {
                    return false;
                }
            }
            return true;
        });
        let familyPoolSize = selectableFamilies.length;
        const selectableFamiliesStatus = await (async (): Promise<Map<number, AllocationStatus>> => {
            const date = this.referenceDateNumber;
            const familiesStatus = new Map<number, AllocationStatus>();
            if (date == undefined) {
                return familiesStatus;
            }

            await Promise.all(selectableFamilies.map(family => {
                const memberIDs = makeMessdienerIDSet(familyMemberships.get(family.id));
                return getStatusOfMessdienerSetAt(memberIDs, date).then(status => familiesStatus.set(family.id, status));
            }));

            return familiesStatus;
        })();

        if (this.referenceDateNumber != undefined) {
            this.classList.add("masses-overview");
        }

        const checkIfEmpty = () => {
            if (familyPoolSize == 0) {
                const placeholder = document.createElement("p");
                placeholder.classList.add("placeholder");
                placeholder.innerText = "Es bestehen keine Familien, welche ausgewählt werden können!";
                this.replaceChildren(placeholder);
            }
        }

        const makeElement = (family: Family): HTMLDivElement => {
            const elem = document.createElement("div");
            const sizeTag = document.createElement("div");
            const nameElem = document.createElement("div");
            const countElem = document.createElement("div");
            const lastElem = document.createElement("div");
            const nextElem = document.createElement("div");
            const addBtn = document.createElement("button");

            sizeTag.innerText = String(family.memberSize);
            nameElem.innerText = createInternalFamilyName(family.lastNameInternal, family.lastNameDisplay);
            addBtn.innerText = "+";

            sizeTag.classList.add("tag");
            countElem.classList.add("value", "masses-allocation");
            lastElem.classList.add("value", "last-allocation");
            nextElem.classList.add("value", "next-allocation");

            addBtn.addEventListener("click", () => {
                this.selectedFamilies.add(family.id);
                elem.remove();
                familyPoolSize--;
                checkIfEmpty();
                this.onedit(this.selectedFamilies);
            })

            elem.classList.add("row", "entry");
            elem.dataset.familyId = String(family.id);
            elem.append(sizeTag, nameElem, lastElem, nextElem, countElem, addBtn);

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
                    elem.classList.add("no-effective-size");
                }
            }

            const status = selectableFamiliesStatus.get(family.id);
            if (status) {
                countElem.innerText = `${status.allocationCount} Messe${status.allocationCount != 1 ? "n" : ""}`;

                lastElem.innerText = status.daysSinceLastExplicitAllocation != undefined ? `${Math.round(status.daysSinceLastExplicitAllocation)}d` : `-`;
                nextElem.innerText = status.daysTillNextExplicitAllocation != undefined ? `${Math.round(status.daysTillNextExplicitAllocation)}d` : `-`;

            } else {
                countElem.remove();
                nextElem.remove();
                lastElem.remove();
            }

            return elem;
        }

        this.replaceChildren(...(selectableFamilies.sort((a, b) => {
            const statusA = selectableFamiliesStatus.get(a.id);
            const statusB = selectableFamiliesStatus.get(b.id);
            if (!statusA || !statusB) {
                return 0;
            }
            return statusB.urgency - statusA.urgency;
        }).map(makeElement)));
        if (this.referenceDateNumber != undefined) {
            const headerElem = document.createElement("div");
            const sizeTag = document.createElement("div");
            const nameElem = document.createElement("div");
            const countElem = document.createElement("div");
            const lastElem = document.createElement("div");
            const nextElem = document.createElement("div");
            const addBtn = document.createElement("button");

            sizeTag.innerText = "Mitgl.";
            nameElem.innerText = "Name der Familie";
            countElem.innerText = "Zugew.";
            lastElem.innerText = "Vor";
            nextElem.innerText = "In";
            addBtn.innerText = "+";

            sizeTag.classList.add("tag");
            countElem.classList.add("value", "masses-allocation");
            lastElem.classList.add("value", "last-allocation");
            nextElem.classList.add("value", "next-allocation");

            headerElem.classList.add("row", "entry", "header");
            headerElem.append(sizeTag, nameElem, lastElem, nextElem, countElem);
            this.insertBefore(headerElem, this.firstChild)
        }
        this.querySelectorAll(".no-effective-size").forEach(e => e.remove());
        checkIfEmpty();
    }

    onedit(ids: Set<number>) {
        return;
    }

    getSelectedFamilies(): Set<number> {
        return this.selectedFamilies;
    }
}

const makeMessdienerIDSet = (members: Set<Messdiener> | undefined): Set<number> => {
    const memberIDs = new Set<number>;
    if (!members) {
        return memberIDs;
    }
    members.forEach(messdiener => memberIDs.add(messdiener.identifier));
    return memberIDs;
}

export default FamilyAdder