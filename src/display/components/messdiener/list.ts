import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Messdiener} from "../../../shared/general";
import {MessdienerEditButton} from "./edit-button";


export class MessdienerList extends HTMLElement {
    connectedCallback() {
        this.classList.add("list");
        const cancel = addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => {
            const elements = data.map(messdiener => {
                const entry = document.createElement("div");
                entry.dataset.id = String(messdiener.identifier);
                entry.classList.add("messdiener");
                entry.classList.add("row");
                entry.classList.add("entry");

                const name = document.createElement("div");
                name.textContent = messdiener.name;
                name.classList.add("name");
                entry.appendChild(name);

                const editBtn: MessdienerEditButton = document.createElement("messdiener-edit-button") as MessdienerEditButton;
                editBtn.setMessdiener(messdiener.identifier);
                entry.appendChild(editBtn);

                return entry;
            })

            this.replaceChildren(...elements);
        })
        this.disconnectedCallback = () => {
            cancel()
        }
    }

    disconnectedCallback() {
        return
    }
}
