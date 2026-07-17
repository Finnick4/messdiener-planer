export interface FormElement {
    tagName: string,
    labelText: string,
    is?: string,
    type?: string,
    fieldClasses?: string[],
}
export interface Form {
    nodes: Node[],
    elements: HTMLElement[],
}

let formsCount = 0;

export const generateHTMLElementsForm = (targetElements: FormElement[]): Form => {
    const form: Form = {
        nodes: [],
        elements: [],
    }

    if (targetElements.length == 0) {
        return form;
    }
    const currentFormCount = formsCount++;



    targetElements.forEach((target, i) => {
        const fieldDiv = document.createElement("div");
        const labelElem = document.createElement("label");
        const inputElement = document.createElement(target.tagName, target.is ? {is: target.is} : undefined);

        const id = `form-${currentFormCount}-element-${i}`;

        fieldDiv.classList.add("field", ...(target.fieldClasses ? target.fieldClasses : []));
        labelElem.classList.add("label");
        labelElem.innerText = target.labelText;
        inputElement.id = id;
        labelElem.htmlFor = id;
        if (inputElement instanceof HTMLInputElement && target.type) {
            inputElement.type = target.type;
        }

        fieldDiv.replaceChildren(...[labelElem, inputElement]);
        form.nodes.push(fieldDiv);
        form.elements.push(inputElement);
    });

    return form;
}