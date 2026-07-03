import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Church} from "../../../shared/general";
import {createInternalChurchName} from "../../logic/church";

export class ChurchSelector extends HTMLSelectElement {
    constructor() {
        super();
    }
    private removeModal() {
        return;
    }
    private closeSubscription() {
        return;
    }
    private selectedChurchID = 0;

    connectedCallback() {
        this.initialiseWithStartID(0);
        this.classList.add("select");
    }
    initialiseWithStartID(id: number) {
        this.closeSubscription();
        this.selectedChurchID = id;
        this.onedit(id);
        this.closeSubscription = addSubscription(ListenerEndpoints.AllChurches, (data: Church[]) => {
            const makeOptionElement = (text: string, id: number): HTMLOptionElement => {
                const option = document.createElement("option");
                option.innerText = text;
                option.dataset.churchId = String(id);
                option.value = String(id);
                option.addEventListener("mouseup", () => {
                    this.selectedChurchID = id;
                    this.onedit(id);
                })
                option.selected = this.selectedChurchID == id;

                return option;
            }

            const options: HTMLOptionElement[] = [makeOptionElement("Keine", 0)].concat(data.map(church => makeOptionElement(createInternalChurchName(church.name, church.location), church.id)));

            this.replaceChildren(...options);
        })
    }

    disconnectedCallback() {
        this.removeModal();
        this.closeSubscription();
    }
    onedit(newID: number) {
        return;
    }

    getSelectedChurch(): number {
        return this.selectedChurchID;
    }
}