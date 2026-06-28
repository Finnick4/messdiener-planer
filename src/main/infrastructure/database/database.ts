import {Messdiener} from "../../../shared/general";

export interface DatabaseConnection {
    initialiseDatabase: () => Promise<void>,
    getAllMessdiener: () => Promise<Messdiener[]>,
    createMessdiener: (name: string) => Promise<number>,
    removeMessdiener: (id: number) => Promise<void>,
    changeMessdienerName: (id: number, newName: string) => Promise<void>
}