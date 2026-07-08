import {MessdienerPreparedList} from "./prepared-list";

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
        this.appendChild(messdienerList)

        this.setAllocatedMessdiener = (ids: Set<number>) => {
            this.allocatedIDs = ids;
            messdienerList.changePickedMessdiener(this.allocatedIDs);
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
