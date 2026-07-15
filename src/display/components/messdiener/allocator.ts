import {MessdienerPreparedList} from "./prepared-list";
import FamilyAdder from "../family/family-adder";
import {Messdiener} from "../../../shared/general";
import {getData, ListenerEndpoints} from "../../state/state-manager";

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

        this.updateContent = () => {
            messdienerList.changePickedMessdiener(new Set<number>(this.allocatedIDs));
            if (this.referenceChurchID) {
                familyAdder.setReferenceChurchID(this.referenceChurchID);
            }

            getData(ListenerEndpoints.AllMessdiener).then((data: Messdiener[]) => {
                const mapped = new Map<number, Messdiener>(data.map((m) => [m.identifier, m]));
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

                familyAdder.onedit = (selectedFamilies: Set<number>)=>  {
                    let addedFamilyID = 0;
                    selectedFamilies.forEach(family => {
                        if (!allocatedFamilies.has(family)) {
                            addedFamilyID = family;
                        }
                    })
                    data.filter(messdiener => messdiener.familyID == addedFamilyID).forEach(messdiener => {
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
            })
        };

        this.updateContent();
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
        return
    }


    disconnectedCallback() {
        return
    }
}
