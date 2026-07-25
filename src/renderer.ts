import '../index.css';
import {Pages, routeToPage} from "./display/routing";
import {addSubscription, ListenerEndpoints} from "./display/state/state-manager";
import {MessdienerList} from "./display/components/messdiener/list";
import {MessdienerEditButton} from "./display/components/messdiener/edit-button";
import {MessdienerCreateButton} from "./display/components/messdiener/create-button";
import {FamilySelector} from "./display/components/family/family-selector";
import {ChurchList} from "./display/components/church/list";
import {ChurchEditButton} from "./display/components/church/edit-button";
import {ChurchCreateButton} from "./display/components/church/create-button";
import {ChurchSelector} from "./display/components/church/church-selector";
import {ChurchSelectorMultiple} from "./display/components/church/church-selector-multiple";
import {MassCreateButton} from "./display/components/mass/create-button";
import {MassList} from "./display/components/mass/list";
import {MessdienerPreparedList} from "./display/components/messdiener/prepared-list";
import {MessdienerAllocator} from "./display/components/messdiener/allocator";
import {FamilyAdder} from "./display/components/family/family-adder";
import {ExpandingTextArea} from "./display/components/expanding-text-area";
import {AbsencesList} from "./display/components/absences/list";
import {AbsencesListElement} from "./display/components/absences/list-element";

interface CustomElementDefinition {
    name: string,
    constructor: CustomElementConstructor,
    extends: string | null
}

const customElementsList: CustomElementDefinition[] = [
    {name: "messdiener-list", constructor: MessdienerList, extends: null},
    {name: "messdiener-edit-button", constructor: MessdienerEditButton, extends: null},
    {name: "messdiener-create-button", constructor: MessdienerCreateButton, extends: null},
    {name: "messdiener-prepared-list", constructor: MessdienerPreparedList, extends: null},
    {name: "messdiener-allocator", constructor: MessdienerAllocator, extends: null},

    {name: "church-list", constructor: ChurchList, extends: null},
    {name: "church-edit-button", constructor: ChurchEditButton, extends: null},
    {name: "church-create-button", constructor: ChurchCreateButton, extends: null},

    {name: "family-selector", constructor: FamilySelector, extends: "select"},
    {name: "church-selector", constructor: ChurchSelector, extends: "select"},
    {name: "church-selector-multiple", constructor: ChurchSelectorMultiple, extends: "select"},

    {name: "mass-create-button", constructor: MassCreateButton, extends: null},
    {name: "mass-list", constructor: MassList, extends: null},

    {name: "family-adder", constructor: FamilyAdder, extends: null},

    {name: "expanding-text-area", constructor: ExpandingTextArea, extends: "textarea"},

    {name: "absences-list", constructor: AbsencesList, extends: null},
    {name: "absences-list-element", constructor: AbsencesListElement, extends: null},
]

for (const elem of customElementsList) {
    if (elem.extends) {
        customElements.define(elem.name, elem.constructor, {extends: elem.extends});
    } else {
        customElements.define(elem.name, elem.constructor);
    }
}

routeToPage(Pages.Main);


// TODO Remove these listeners!
addSubscription(ListenerEndpoints.AllMessdiener, data => {
    console.log(data)
});

addSubscription(ListenerEndpoints.AllFamilies, data => {
    console.log(data)
});

addSubscription(ListenerEndpoints.AllChurches, data => {
    console.log(data)
});

addSubscription(ListenerEndpoints.AllMasses, data => {
    console.log(data)
});

addSubscription(ListenerEndpoints.AllAbsences, data => {
    console.log(data)
});
