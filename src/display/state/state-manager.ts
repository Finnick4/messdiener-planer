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

    constructor() {
        this.subscriptions = [];
        this.idCounter = 0;
    }
    
    add(fn: CallbackFunction<T>): () => void {
        const elem: SubscriptionListElement<T> = {
            fn: fn,
            id: this.idCounter++,
        }
        this.subscriptions.push(elem)
        fn(this.savedData)
            .catch(() => this.remove(elem.id))
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
    AllMessdiener: new State<Array<Messdiener>>()
}


