import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Messdiener} from "../../../shared/general";
import {MessdienerEditButton} from "./edit-button";


export class MessdienerList extends HTMLElement {
    connectedCallback() {
        this.classList.add("list");
        const cancel = addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => {
            if (data.length == 0) {
                const placeholder = document.createElement("p");
                placeholder.classList.add("placeholder");
                placeholder.innerText = "Es wurden noch keine Messdiener erstellt!"
                this.replaceChildren(placeholder);
                return
            }

            const elements = data.map(messdiener => {
                const entry = document.createElement("div");
                entry.dataset.id = String(messdiener.identifier);
                entry.classList.add("messdiener");
                entry.classList.add("row");
                entry.classList.add("entry");

                const name = document.createElement("div");
                name.textContent = messdiener.firstName;
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
