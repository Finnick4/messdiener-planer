import {CallbackFunction} from "../../shared/state-manager";

interface SubscriptionListElement<T> {
    fn: CallbackFunction<T>
    id: number
}

class SubscriptionList<T> {
    private list: SubscriptionListElement<T>[];
    private idCounter: number;
    constructor() {
        this.list = [];
        this.idCounter = 0;
    }
    
    add(fn: CallbackFunction<T>): () => void {
        const elem: SubscriptionListElement<T> = {
            fn: fn,
            id: this.idCounter++,
        }
        this.list.push(elem)
        return () => {
            this.remove(elem.id)
        }
    }
    pushUpdate(data: T) {
        for (const elem of this.list) {
            elem.fn(data)
                .catch(() => this.remove(elem.id))
        }
    }
    private remove(id: number) {
        this.list = this.list.filter(e => e.id !== id)
    }
}


