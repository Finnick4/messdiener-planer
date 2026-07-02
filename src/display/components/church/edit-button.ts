import {generateEditChurchModal} from "./edit-modal";

export class ChurchEditButton extends HTMLElement {
    private removeModal() {
        return;
    }

    connectedCallback() {
        this.innerHTML = "&#8943;";
        this.classList.add("button");
    }
    setChurch(id: number) {
        this.removeModal();
        const modal = generateEditChurchModal(id);
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