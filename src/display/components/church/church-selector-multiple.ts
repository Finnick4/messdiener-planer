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
        this.classList.add("select", "multiple");
        this.addEventListener("change", this.recalculateSelectedChurches);
    }
    initialiseWithStartIDs(ids: Set<number>) {
        this.closeSubscription();
        this.selectedChurchesIDs = structuredClone(ids);
        this.onedit(structuredClone(ids));
        this.closeSubscription = addSubscription(ListenerEndpoints.AllChurches, (data: Church[]) => {
            const makeOptionElement = (text: string, id: number): HTMLOptionElement => {
                const option = document.createElement("option");
                option.innerText = text;
                option.dataset.churchId = String(id);
                option.value = String(id);
                option.selected = this.selectedChurchesIDs.has(id);

                return option;
            }


            if (data.length == 0) {
                const placeholder = document.createElement("option");
                placeholder.classList.add("placeholder");
                placeholder.innerText = "Es wurden noch keine Kirchen erstellt.";
                placeholder.disabled = true;
                this.replaceChildren(placeholder);
                return
            }


            const options: HTMLOptionElement[] = data.map(church => makeOptionElement(createInternalChurchName(church.name, church.location), church.id));

            this.replaceChildren(...options);
        });
    }

    disconnectedCallback() {
        this.removeModal();
        this.closeSubscription();
    }
    onedit(currentIDs: Set<number>) {
        return;
    }
    private recalculateSelectedChurches() {
        this.selectedChurchesIDs = new Set<number>();
        this.querySelectorAll<HTMLOptionElement>("option").forEach(option => {
            if (option.selected && !isNaN(Number(option.dataset.churchId))) {
                this.selectedChurchesIDs.add(Number(option.dataset.churchId));
            }
        });
        this.onedit(this.selectedChurchesIDs);
    }

    getSelectedChurches(): Set<number> {
        return this.selectedChurchesIDs;
    }
}