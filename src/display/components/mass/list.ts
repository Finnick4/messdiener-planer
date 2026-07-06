import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Mass, Messdiener} from "../../../shared/general";

export class MassList extends HTMLElement {
    connectedCallback() {
        const cancel = addSubscription(ListenerEndpoints.AllMasses, (data: Mass[]) => {
            if (data.length == 0) {
                const placeholder = document.createElement("p");
                placeholder.classList.add("placeholder");
                placeholder.innerHTML = "Es wurden noch keine Messen erstellt!"
                this.replaceChildren(placeholder);
                return
            }
            data = data.sort((a, b) => a.date - b.date);

            const elements = data.map(mass => {
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

                const cancelInner = addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => {
                    const mapped = new Map<number, Messdiener>(data.map((m) => [m.identifier, m]));

                    mass.allocatedMessdiener.forEach(mini => {
                        const m = document.createElement("div");
                        const name = mapped.get(mini)?.firstName
                        m.textContent = name ? name : "Unbekannt";
                        m.classList.add("messdiener");
                        messdiener.appendChild(m);
                    })
                    cancelInner()
                });

                entry.appendChild(messdiener);
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
