import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Absence} from "../../../shared/general";
import {AbsencesListElement} from "./list-element";


export class AbsencesList extends HTMLElement {
    private disconnectedHandler = () => {
        return;
    };

    private includeCreateButton = false;
    private createButton: AbsencesListElement | undefined = undefined;

    connectedCallback() {
        const cancel = addSubscription(ListenerEndpoints.AllAbsences, (data: Absence[]) => {
            data = data.sort((a, b) => a.startDate - b.startDate);
            const listElems = data.map(absence => {
                const elem = document.createElement("absences-list-element") as AbsencesListElement;
                elem.setAbsence(absence);
                return elem;
            })
            if (this.includeCreateButton) {
                listElems.push((() => {
                    const elem = document.createElement("absences-list-element") as AbsencesListElement;
                    elem.setAbsence(undefined);
                    this.createButton = elem;
                    return elem;
                })())
            }
            this.replaceChildren(...listElems);
        })

        this.disconnectedHandler = cancel;
    }

    setIncludeCreateButton(include: boolean) {
        if (include == this.includeCreateButton) {
            return;
        }

        if (include) {
            this.appendChild((() => {
                const elem = document.createElement("absences-list-element") as AbsencesListElement;
                elem.setAbsence(undefined);
                this.createButton = elem;
                return elem;
            })());
        } else {
            this.createButton?.remove();
        }

        this.includeCreateButton = include;
    }

    disconnectedCallback() {
        this.disconnectedHandler();
        return
    }
}