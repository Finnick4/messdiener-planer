import {MessdienerPreparedList} from "./prepared-list";
import FamilyAdder from "../family/family-adder";
import {Messdiener} from "../../../shared/general";
import {getData, ListenerEndpoints} from "../../state/state-manager";
import {getMessdienerMap} from "../../state/specific-entries";

export class MessdienerAllocator extends HTMLElement {
    constructor() {
        super();
        this.allocatedIDs = new Set<number>();
    }
    private allocatedIDs: Set<number>;
    private referenceChurchID: number | undefined;

    connectedCallback() {
        const messdienerList = document.createElement("messdiener-prepared-list") as MessdienerPreparedList;
        const familyAdder = document.createElement("family-adder") as FamilyAdder;
        this.replaceChildren(messdienerList, familyAdder);
    }

    getAllocatedMessdiener(): Set<number> {
        return this.allocatedIDs;
    }

    onedit(ids: Set<number>) {
        return
    }

    setAllocatedMessdiener(ids: Set<number>) {
        this.allocatedIDs = ids;
        this.updateContent()
    }
    setReferenceChurchID(id: number) {
        this.referenceChurchID = id;
        this.updateContent()
    }
    updateContent() {
        const messdienerList = this.querySelector<MessdienerPreparedList>("messdiener-prepared-list");
        const familyAdder = this.querySelector<FamilyAdder>("family-adder");

        if (!messdienerList || !familyAdder) {
            return;
        }

        getMessdienerMap().then(mapped => {
            messdienerList.changePickedMessdiener(new Set<number>(this.allocatedIDs));
            if (this.referenceChurchID) {
                familyAdder.setReferenceChurchID(this.referenceChurchID);
            }

            const allocatedFamilies = new Set<number>();

            const updateFamilyAdder = () => {
                allocatedFamilies.clear();

                this.allocatedIDs.forEach(messdienerID => {
                    const messdiener = mapped.get(messdienerID);
                    if (messdiener) {
                        allocatedFamilies.add(messdiener.familyID);
                    }
                })
                familyAdder.setSelectedFamilies(new Set<number>(allocatedFamilies));
            };

            updateFamilyAdder();

            const familyMemberships = new Map<number, Set<Messdiener>>();

            mapped.forEach((messdiener) => {
                const family = familyMemberships.get(messdiener.familyID);
                if (family) {
                    family.add(messdiener);
                    familyMemberships.set(messdiener.familyID, family);
                    return;
                }
                familyMemberships.set(messdiener.familyID, new Set<Messdiener>([messdiener]));
            })

            familyAdder.onedit = (selectedFamilies: Set<number>)=>  {
                let addedFamilyID = 0;
                selectedFamilies.forEach(family => {
                    if (!allocatedFamilies.has(family)) {
                        addedFamilyID = family;
                    }
                })
                familyMemberships.get(addedFamilyID)?.forEach(messdiener => {
                    if (this.referenceChurchID && !messdiener.churchActivity.has(this.referenceChurchID)) {
                        return;
                    }
                    this.allocatedIDs.add(messdiener.identifier);
                    this.onedit(this.allocatedIDs);
                    messdienerList.changePickedMessdiener(this.allocatedIDs);
                })
            }

            messdienerList.onedit = (id: number) => {
                this.allocatedIDs.delete(id);
                updateFamilyAdder();
                this.onedit(this.allocatedIDs);
            }
        });
    }


    disconnectedCallback() {
        return
    }
}
