
export interface ModalManager {
    element: HTMLDialogElement,
    destroy: () => void,
    show: () => void,
    hide: () => void,
}
