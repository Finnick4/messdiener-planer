import '../index.css';
import {Pages, routeToPage} from "./display/routing";
import {addSubscription, ListenerEndpoints} from "./display/state/state-manager";
import {MessdienerList} from "./display/components/messdiener/list";
import {MessdienerEditButton} from "./display/components/messdiener/edit-button";
import {MessdienerCreateButton} from "./display/components/messdiener/create-button";

interface CustomElementDefinition {
    name: string,
    constructor: CustomElementConstructor
}

const customElementsList: CustomElementDefinition[] = [
    {name: "messdiener-list", constructor: MessdienerList},
    {name: "messdiener-edit-button", constructor: MessdienerEditButton},
    {name: "messdiener-create-button", constructor: MessdienerCreateButton},
]

for (const elem of customElementsList) {
    customElements.define(elem.name, elem.constructor);
}

routeToPage(Pages.Main);



addSubscription(ListenerEndpoints.AllMessdiener, data => {
    console.log(data)
})
addSubscription(ListenerEndpoints.AllFamilies, data => {
    console.log(data)
})
