import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Church} from "../../../shared/general";
import {ChurchEditButton} from "./edit-button";
import {createInternalChurchName} from "../../logic/church";


export class ChurchList extends HTMLElement {
    connectedCallback() {
        this.classList.add("list");
        const cancel = addSubscription(ListenerEndpoints.AllChurches, (data: Church[]) => {
            if (data.length == 0) {
                const placeholder = document.createElement("p");
                placeholder.classList.add("placeholder");
                placeholder.innerText = "Es wurden noch keine Kirchen erstellt!"
                this.replaceChildren(placeholder);
                return
            }

            const elements = data.map(church => {
                const entry = document.createElement("div");
                entry.dataset.id = String(church.id);
                entry.classList.add("church", "row", "entry");

                const name = document.createElement("div");
                name.textContent = createInternalChurchName(church.name, church.location);
                name.classList.add("name");
                entry.appendChild(name);

                const editBtn: ChurchEditButton = document.createElement("church-edit-button") as ChurchEditButton;
                editBtn.setChurch(church.id);
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
