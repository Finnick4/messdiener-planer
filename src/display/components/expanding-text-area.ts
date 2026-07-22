
export class ExpandingTextArea extends HTMLTextAreaElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.resize()
        this.addEventListener("input", () => this.resize());
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        this.style.height = "1px"
        this.style.height = `calc(${this.scrollHeight + "px"} - 1rem)`
    }
}
