import {generateEditMessdienerModal} from "./edit-modal";

export class MessdienerEditButton extends HTMLElement {
    private removeModal() {
        return;
    }

    connectedCallback() {
        this.innerHTML= "&#8943;";
        this.classList.add("button");
    }
    setMessdiener(id: number) {
        this.removeModal();
        const modal = generateEditMessdienerModal(id);
        this.onclick = () => {
            modal.show();
        }

        this.removeModal = () => {
            modal.destroy()
        }
    }
    disconnectedCallback() {
        this.removeModal()
    }
}