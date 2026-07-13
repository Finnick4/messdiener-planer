import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Messdiener} from "../../../shared/general";


export class MessdienerPreparedList extends HTMLElement {
    constructor() {
        super();
    }
    private disconnectedHandler = () => {
        return;
    };

    connectedCallback() {
        this.classList.add("list", "prepared");

        const onDisconnect: (() => void)[] = [];

        this.changePickedMessdiener = (ids: Set<number>) => {
            const cancel = addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => {
                if (data.length == 0) {
                    const placeholder = document.createElement("p");
                    placeholder.classList.add("placeholder");
                    placeholder.innerText = "Bisher existieren noch keine Messdiener!"
                    this.replaceChildren(placeholder);
                    return
                }
                const checkIfEmpty = () => {
                    if (ids.size == 0) {
                        const placeholder = document.createElement("p");
                        placeholder.classList.add("placeholder");
                        placeholder.innerText = "Es wurden noch keine Messdiener ausgewält!"
                        this.replaceChildren(placeholder);
                        return true
                    }
                    return false
                }
                if (checkIfEmpty()) {
                    return;
                }
                const relevantMessdiener = data.filter(messdiener => ids.has(messdiener.identifier));

                const elements = relevantMessdiener.map(messdiener => {
                    const entry = document.createElement("div");
                    entry.dataset.id = String(messdiener.identifier);
                    entry.classList.add("messdiener", "row", "entry");

                    const name = document.createElement("div");
                    name.textContent = messdiener.firstName;
                    name.classList.add("name");
                    entry.appendChild(name);

                    const removeBtn = document.createElement("button");
                    removeBtn.innerText = "-";
                    removeBtn.classList.add("remove");
                    removeBtn.dataset.messdienerId = String(messdiener.identifier);
                    removeBtn.addEventListener("click", () => {
                        ids.delete(messdiener.identifier);
                        this.onedit(messdiener.identifier);
                        entry.remove();
                        if (checkIfEmpty()) {
                            return;
                        }
                    })
                    entry.appendChild(removeBtn);

                    return entry;
                })

                this.replaceChildren(...elements);
            })
            onDisconnect.push(cancel);
        }

        this.changePickedMessdiener(new Set<number>());

        this.disconnectedHandler = () => {
            onDisconnect.forEach(fn => fn());
        }
    }

    onedit(removedID: number) {
        return;
    }

    changePickedMessdiener(ids: Set<number>) {
        return
    }

    disconnectedCallback() {
        this.disconnectedHandler();
        return;
    }
}
