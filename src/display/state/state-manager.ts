import {CallbackFunction} from "../../shared/state-manager";
import {Messdiener} from "../../shared/general";

interface SubscriptionListElement<T> {
    fn: CallbackFunction<T>
    id: number
}

class State<T> {
    private subscriptions: SubscriptionListElement<T>[];
    private idCounter: number;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private savedData: T;
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
        if (this.idCounter == 1) {
            p = this.queryDataFunction();
        } else {
            p = new Promise<T>((resolve) => resolve(this.savedData))
        }
        this.subscriptions.push(elem)
        p.then(data => {
            this.savedData = data;
            fn(this.savedData)
        })
        return () => {
            this.remove(elem.id)
        }
    }
    pushUpdate(data: T) {
        this.savedData = data
        for (const elem of this.subscriptions) {
            elem.fn(this.savedData)
        }
    }
    private remove(id: number) {
        this.subscriptions = this.subscriptions.filter(e => e.id !== id)
    }
}

const states = {
    AllMessdiener: new State<Array<Messdiener>>(() => {
        return window.electronAPI.getAllMessdiener();
    })
}

export enum ListenerEndpoints {
    AllMessdiener = "AllMessdiener"
}

export const addSubscription = (listener: ListenerEndpoints, callback: CallbackFunction<any>): () => void => {
    return states[listener].add(callback);
}

window.electronAPI.onMessdienerUpdate((data: Messdiener[]) => {
    const target = ListenerEndpoints.AllMessdiener;
    states[target].pushUpdate(data);
})
