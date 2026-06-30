import {Family} from "../../shared/general";
import {getAllFamilies} from "../application/state";
import {pingManager} from "./ping-manager";

export const getAllFamiliesHandler = (): Promise<Family[]> => {
    return getAllFamilies()
}

export const pingFamiliesUpdate = () => {
    getAllFamilies().then(families => pingManager.onFamiliesUpdate(families));
}