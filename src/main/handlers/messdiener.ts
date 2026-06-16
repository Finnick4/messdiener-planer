import {Messdiener} from "../../shared/general";
import {getAllMessdiener} from "../application/messdiener";

export const getAllMessdienerHandler = (): Promise<Messdiener[]> => {
    return getAllMessdiener()
}