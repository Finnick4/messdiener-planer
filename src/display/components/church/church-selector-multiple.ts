import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Church} from "../../../shared/general";
import {createInternalChurchName} from "../../logic/church";

export class ChurchSelectorMultiple extends HTMLSelectElement {
    constructor() {
        super();
    }
    private removeModal() {
        return;
    }
    private closeSubscription() {
        return;
    }
    private selectedChurchesIDs = new Set<number>();

    connectedCallback() {
        this.multiple = true;
        this.initialiseWithStartIDs(this.selectedChurchesIDs);
        this.classList.add("select", "multiple")
    }
    initialiseWithStartIDs(ids: Set<number>) {
        this.closeSubscription();
        this.selectedChurchesIDs = ids;
        this.onedit(ids);
        this.closeSubscription = addSubscription(ListenerEndpoints.AllChurches, (data: Church[]) => {
            const makeOptionElement = (text: string, id: number): HTMLOptionElement => {
                const option = document.createElement("option");
                option.innerText = text;
                option.dataset.churchId = String(id);
                option.value = String(id);
                option.addEventListener("mouseup", () => {
                    if (this.selectedChurchesIDs.has(id)) {
                        this.selectedChurchesIDs.delete(id);
                    } else {
                        this.selectedChurchesIDs.add(id);
                    }
                    this.onedit(this.selectedChurchesIDs);
                })
                option.selected = this.selectedChurchesIDs.has(id);

                return option;
            }

            if (data == undefined) {
                return
            }


            const options: HTMLOptionElement[] = data.map(church => makeOptionElement(createInternalChurchName(church.name, church.location), church.id));

            this.replaceChildren(...options);
        })
    }

    disconnectedCallback() {
        this.removeModal();
        this.closeSubscription();
    }
    onedit(currentIDs: Set<number>) {
        return;
    }

    getSelectedChurches(): Set<number> {
        return this.selectedChurchesIDs;
    }
}