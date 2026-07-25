import {CallbackFunction} from "../../shared/state-manager";
import {Absence, Church, Family, Mass, Messdiener} from "../../shared/general";

interface SubscriptionListElement<T> {
    fn: CallbackFunction<T>
    id: number
}

class State<T> {
    private subscriptions: SubscriptionListElement<T>[];
    private idCounter: number;
    private savedData: T | undefined;
    private queryDataFunction: () => Promise<T>;

    constructor(fn: () => Promise<T>) {
        this.subscriptions = [];
        this.idCounter = 0;
        this.queryDataFunction = fn;
    }
    
    add(fn: CallbackFunction<T>): () => void {
        const elem: SubscriptionListElement<T> = {
            fn: fn,
            id: this.idCounter++,
        }
        let p: Promise<T>;
        if (this.savedData == undefined) {
            p = this.queryDataFunction();
        } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            p = new Promise<T>((resolve) => resolve(this.savedData))
        }
        this.subscriptions.push(elem)
        p.then(data => {
            if (data == undefined) {
                console.error("undefined data!!!");
                throw new Error("Undefined data within state!");
            }
            this.savedData = data;
            fn(structuredClone(this.savedData));
        })
        return () => {
            this.remove(elem.id)
        }
    }
    pushUpdate(data: T) {
        this.savedData = data
        for (const elem of this.subscriptions) {
            elem.fn(structuredClone<T>(this.savedData))
        }
    }
    private remove(id: number) {
        this.subscriptions = this.subscriptions.filter(e => e.id !== id)
    }
}

const states = {
    AllMessdiener: new State<Array<Messdiener>>(window.electronAPI.getAllMessdiener),
    AllFamilies: new State<Family[]>(window.electronAPI.getAllFamilies),
    AllChurches: new State<Church[]>(window.electronAPI.getAllChurches),
    AllMasses: new State<Mass[]>(window.electronAPI.getAllMasses),
    AllAbsences: new State<Absence[]>(window.electronAPI.getAllAbsences),
}

export enum ListenerEndpoints {
    AllMessdiener = "AllMessdiener",
    AllFamilies = "AllFamilies",
    AllChurches = "AllChurches",
    AllMasses = "AllMasses",
    AllAbsences = "AllAbsences",
}

export const addSubscription = (listener: ListenerEndpoints, callback: CallbackFunction<any>): () => void => {
    return states[listener].add(callback);
}

export const getData = (listener: ListenerEndpoints): Promise<any> =>  {
    return new Promise<any>((resolve) => {
        const cancel = addSubscription(listener, data => {
            cancel();
            resolve(data);
        })
    });
}

window.electronAPI.onMessdienerUpdate((data: Messdiener[]) => {
    const target = ListenerEndpoints.AllMessdiener;
    states[target].pushUpdate(data);
});

window.electronAPI.onFamiliesUpdate((data: Family[]) => {
    const target = ListenerEndpoints.AllFamilies;
    states[target].pushUpdate(data);
});

window.electronAPI.onChurchesUpdate((data: Church[]) => {
    const target = ListenerEndpoints.AllChurches;
    states[target].pushUpdate(data);
});

window.electronAPI.onMassesUpdate((data: Mass[]) => {
    const target = ListenerEndpoints.AllMasses;
    states[target].pushUpdate(data);
});

window.electronAPI.onAbsencesUpdate((data: Absence[]) => {
    const target = ListenerEndpoints.AllAbsences;
    states[target].pushUpdate(data);
});
