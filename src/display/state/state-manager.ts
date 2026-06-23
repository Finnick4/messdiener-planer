import {CallbackFunction} from "../../shared/state-manager";
import {Messdiener} from "../../shared/general";

interface SubscriptionListElement<T> {
    fn: CallbackFunction<T>
    id: number
}

class State<T> {
    private subscriptions: SubscriptionListElement<T>[];
    private idCounter: number;
    private savedData: T;
    private queryDataFunction: () => Promise<T>;

    constructor(fn: () => Promise<T>) {
        this.subscriptions = [];
        this.idCounter = 0;
        this.queryDataFunction = fn
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
                .catch(() => this.remove(elem.id))
        })
        return () => {
            this.remove(elem.id)
        }
    }
    pushUpdate(data: T) {
        this.savedData = data
        for (const elem of this.subscriptions) {
            elem.fn(this.savedData)
                .catch(() => this.remove(elem.id))
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
// TODO manage incoming updates

export enum ListenerEndpoints {
    AllMessdiener = "AllMessdiener"
}

export const addSubscription = (listener: ListenerEndpoints, callback: CallbackFunction<any>) => {
    states[listener].add(callback);
}
