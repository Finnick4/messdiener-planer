import {MessdienerPreparedList} from "./prepared-list";
import {FamilyAdder} from "../family/family-adder";
import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Messdiener} from "../../../shared/general";

export class MessdienerAllocator extends HTMLElement {
    constructor() {
        super();
        this.allocatedIDs = new Set<number>();
    }
    private allocatedIDs: Set<number>;

    connectedCallback() {
        const messdienerList = document.createElement("messdiener-prepared-list") as MessdienerPreparedList;
        messdienerList.onedit = (id: number) => {
            this.allocatedIDs.delete(id);
            this.onedit(this.allocatedIDs);
        }
        this.appendChild(messdienerList);

        const familyAdder = document.createElement("family-adder") as FamilyAdder;

        this.appendChild(familyAdder);

        this.setAllocatedMessdiener = (ids: Set<number>) => {
            this.allocatedIDs = ids;
            messdienerList.changePickedMessdiener(this.allocatedIDs);

            const cancel = addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => {
                const mapped = new Map<number, Messdiener>(data.map((m) => [m.identifier, m]));
                const allocatedFamilies = new Set<number>();

                this.allocatedIDs.forEach(messdienerID => {
                    const messdiener = mapped.get(messdienerID);
                    if (messdiener) {
                        allocatedFamilies.add(messdiener.familyID);
                    }
                })
                familyAdder.setSelectedFamilies(new Set<number>(allocatedFamilies));

                familyAdder.onedit = (selectedFamilies: Set<number>)=>  {
                    let addedFamilyID = 0;
                    selectedFamilies.forEach(family => {
                        if (!allocatedFamilies.has(family)) {
                            addedFamilyID = family;
                        }
                    })
                    data.filter(messdiener => messdiener.familyID == addedFamilyID).forEach(messdiener => {
                        this.allocatedIDs.add(messdiener.identifier);
                        this.onedit(this.allocatedIDs);
                        messdienerList.changePickedMessdiener(this.allocatedIDs);
                    })
                }

                cancel();
            })
        };

    }

    getAllocatedMessdiener(): Set<number> {
        return this.allocatedIDs;
    }

    onedit(ids: Set<number>) {
        return
    }

    setAllocatedMessdiener(ids: Set<number>) {
        return
    }

    disconnectedCallback() {
        return
    }
}
