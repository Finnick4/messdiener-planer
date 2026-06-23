import {Messdiener} from "../shared/general";

declare global {
    interface Window {
        electronAPI: {
            getAllMessdiener: () => Promise<Messdiener[]>,
            createMessdiener: (name: string) => void,
            deleteMessdiener: (id: number) => void
        }
    }
}