
export const makeConfirmButton = (normalText: string, elem: HTMLButtonElement, onClick: () => void) => {
    elem.innerText = normalText;
    let beenPressedOnce = false;

    const deactivate = () => {
        elem.innerText = normalText;
        beenPressedOnce = false;
    }

    elem.addEventListener("click", () => {
        if (beenPressedOnce) {
            deactivate();
            onClick();
        } else {
            elem.innerText = "Bestätigen";
            beenPressedOnce = true;
        }
    });
    elem.addEventListener("mouseout", deactivate);
    elem.addEventListener("focusout", deactivate);
}