import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {Messdiener} from "../../../shared/general";

export class MessdienerEditButton extends HTMLElement {
    connectedCallback() {
        this.innerHTML = "Edit";
        this.classList.add("button");
    }
    setMessdiener(id: number) {
        const cancel = addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => new Promise<void>((resolve) => {
            const messdiener = data.filter(m => m.identifier == id)[0];
            this.onclick = () => {
                console.log(messdiener)
            }
            resolve();
        }))


        this.disconnectedCallback = () => {
            cancel()
        }
    }
    disconnectedCallback() {
        return
    }
}