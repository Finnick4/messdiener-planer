import {Family} from "../../shared/general";
import {getAllFamilies} from "../application/state";

export const getAllFamiliesHandler = (): Promise<Family[]> => {
    return getAllFamilies()
}
