import '../index.css';
import {Pages, routeToPage} from "./display/routing";
import {addSubscription, ListenerEndpoints} from "./display/state/state-manager";
import {MessdienerList} from "./display/components/messdiener/list";
import {MessdienerEditButton} from "./display/components/messdiener/edit-button";
import {MessdienerCreateButton} from "./display/components/messdiener/create-button";
import {FamilySelector} from "./display/components/family-selector";

interface CustomElementDefinition {
    name: string,
    constructor: CustomElementConstructor,
    extends: string | null
}

const customElementsList: CustomElementDefinition[] = [
    {name: "messdiener-list", constructor: MessdienerList, extends: null},
    {name: "messdiener-edit-button", constructor: MessdienerEditButton, extends: null},
    {name: "messdiener-create-button", constructor: MessdienerCreateButton, extends: null},
    {name: "family-selector", constructor: FamilySelector, extends: "select"},
]

for (const elem of customElementsList) {
    if (elem.extends) {
        customElements.define(elem.name, elem.constructor, {extends: elem.extends});
    } else {
        customElements.define(elem.name, elem.constructor);
    }
}

routeToPage(Pages.Main);



addSubscription(ListenerEndpoints.AllMessdiener, data => {
    console.log(data)
})
addSubscription(ListenerEndpoints.AllFamilies, data => {
    console.log(data)
})
