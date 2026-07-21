import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Mass, Messdiener} from "../../../shared/general";
import {MassCreateButton} from "./create-button";
import {generateEditMassModal} from "./edit-modal";
import {getMessdienerMap} from "../../state/specific-entries";

export class MassList extends HTMLElement {
    private disconnectedHandler = () => {
        return;
    };

    connectedCallback() {
        let closeModals: (() => void)[] = [];
        const cancel = addSubscription(ListenerEndpoints.AllMasses, (data: Mass[]) => {
            closeModals.forEach(fn => fn());
            closeModals = [];
            if (data.length == 0) {
                const placeholder = document.createElement("p");
                placeholder.classList.add("placeholder");
                placeholder.innerText = "Es wurden noch keine Messen erstellt!"
                this.replaceChildren(placeholder);
                return
            }
            data = data.sort((a, b) => a.date - b.date);

            const elements: HTMLDivElement[] = [];

            for (const mass of data) {
                const entry = document.createElement("div");
                entry.dataset.id = String(mass.id);
                entry.classList.add("mass", "entry");

                const date = document.createElement("div");
                date.textContent = new Date(Number(String(mass.date).substring(0, 4)),
                    Number(String(mass.date).substring(4, 6)) - 1,
                    Number(String(mass.date).substring(6, 8))).toLocaleString("de", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                });
                date.classList.add("date", "section");
                entry.appendChild(date);

                const note = document.createElement("div");
                note.textContent = mass.note == undefined ? " " : mass.note;
                note.classList.add("note", "section");
                entry.appendChild(note);

                const messdiener = document.createElement("div");
                messdiener.textContent = mass.allocatedMessdiener.size == 0 ? "Alle" : "";
                messdiener.classList.add("messdiener", "section");

                getMessdienerMap().then((mapped: Map<number, Messdiener>) => {
                    mass.allocatedMessdiener.forEach(allocatedMessdienerID => {
                        const messdienerPlaque = document.createElement("div");
                        const name = mapped.get(allocatedMessdienerID)?.firstName
                        messdienerPlaque.textContent = name ? name : "Unbekannt";
                        messdienerPlaque.classList.add("messdiener");
                        messdiener.appendChild(messdienerPlaque);
                    });
                });

                const modal = generateEditMassModal(mass.id);
                entry.addEventListener("click", () => modal.show());
                closeModals.push(modal.destroy);

                entry.appendChild(messdiener);
                elements.push(entry);
            }

            this.replaceChildren(...elements);

            const createBtn = document.createElement("mass-create-button") as MassCreateButton;

            this.appendChild(createBtn);
        })
        this.disconnectedHandler = () => {
            cancel();
            closeModals.forEach(fn => fn());
        };
    }

    disconnectedCallback() {
        this.disconnectedHandler();
        return
    }
}
