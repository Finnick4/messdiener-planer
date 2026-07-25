import {Absence} from "../../../shared/general";
import {getMessdienerMap} from "../../state/specific-entries";
import {ModalManager} from "../../types";
import {generateEditAbsenceModal} from "./edit-modal";

export class AbsencesListElement extends HTMLElement {
    private disconnectedHandler = () => {
        return;
    };

    connectedCallback() {
        this.classList.add("uninitialised");
    }
    private manager: ModalManager | undefined;

    setAbsence(target: Absence | undefined) {
        this.classList.remove("uninitialised");
        this.manager?.destroy();

        if (!target) {
            this.classList.add("button", "create");

            const label = document.createElement("div");
            label.innerText = "Abwesenheit erstellen";
            label.classList.add("label");
            this.replaceChildren(label);
            return;
        }
        this.classList.remove("button", "create");

        this.dataset.id = String(target.id);

        const startDate = document.createElement("div");
        startDate.textContent = new Date(Number(String(target.startDate).substring(0, 4)),
            Number(String(target.startDate).substring(4, 6)) - 1,
            Number(String(target.startDate).substring(6, 8))).toLocaleString("de", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        startDate.classList.add("date", "section", "start-date");

        const endDate = document.createElement("div");
        endDate.textContent = new Date(Number(String(target.endDate).substring(0, 4)),
            Number(String(target.endDate).substring(4, 6)) - 1,
            Number(String(target.endDate).substring(6, 8))).toLocaleString("de", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        endDate.classList.add("date", "section", "end-date");

        const affectedMessdiener = document.createElement("div");
        affectedMessdiener.classList.add("section", "messdiener")
        affectedMessdiener.textContent = target.affectedMessdiener.size == 0 ? "Niemand" : "Namen werden geladen...";

        if (target.affectedMessdiener.size != 0) {
            getMessdienerMap().then(mapped => {
                affectedMessdiener.textContent = "";
                target.affectedMessdiener.forEach(mID => {
                    const messdienerPlaque = document.createElement("div");
                    const name = mapped.get(mID)?.firstName
                    messdienerPlaque.textContent = name ? name : "Unbekannt";
                    messdienerPlaque.classList.add("messdiener");
                    affectedMessdiener.appendChild(messdienerPlaque);
                });
            });
        }

        this.replaceChildren(startDate, endDate, affectedMessdiener);

        this.manager = generateEditAbsenceModal(target.id);
        this.addEventListener("click", () => this.manager?.show());

        this.disconnectedHandler = this.manager?.destroy
    }

    disconnectedCallback() {
        this.disconnectedHandler();
        return
    }
}