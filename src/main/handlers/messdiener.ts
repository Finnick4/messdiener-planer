import {Messdiener} from "../../shared/general";
import {getAllMessdiener} from "../application/state";

export const getAllMessdienerHandler = (): Promise<Messdiener[]> => {
    return getAllMessdiener()
}