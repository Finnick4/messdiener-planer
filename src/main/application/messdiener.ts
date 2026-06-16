import {Messdiener} from "../../shared/general";
import {getDBConnection} from "./main";

export const getAllMessdiener = (): Promise<Messdiener[]> => {
    return getDBConnection().then(db => db.getAllMessdiener())
}
export const createMessdiener = (name: string): Promise<number> => {
    return getDBConnection().then(db => db.createMessdiener(name))
}
export const removeMessdiener = (id: number): Promise<void> => {
    return getDBConnection().then(db => db.removeMessdiener(id))
}
export const changeMessdienerName = (id: number, newName: string): Promise<void> => {
    return getDBConnection().then(db => db.changeMessdienerName(id, newName))
}