import {Messdiener} from "src/shared/general";
import {getData, ListenerEndpoints} from "../state/state-manager";

export const createInternalFamilyName = (internalName: string, displayName: string): string => {
    if (internalName == displayName) {
        return displayName;
    }
    return `${displayName} (${internalName})`;
}

export const getEffectiveFamilySizeForChurch = (familyID: number, churchID: number): Promise<number> => {
    return new Promise<number>((resolve) => {
        getData(ListenerEndpoints.AllMessdiener).then((data: Messdiener[]) => {
            resolve(data.filter(messdiener => messdiener.familyID == familyID && messdiener.churchActivity.has(churchID)).length)
        });
    })
}