import {Church, Family, Mass, Messdiener} from "../../shared/general";
import {addSubscription, getData, ListenerEndpoints} from "./state-manager";

let messdienerMap: Map<number, Messdiener> | undefined = undefined;
let familyMap: Map<number, Family> | undefined = undefined;
let churchMap: Map<number, Church> |undefined = undefined;
let massMap: Map<number, Mass> | undefined= undefined;

addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => {
    messdienerMap = new Map(data.map((m) => [m.identifier, m]));
});
addSubscription(ListenerEndpoints.AllFamilies, (data: Family[]) => {
    familyMap = new Map(data.map((f) => [f.id, f]));
});
addSubscription(ListenerEndpoints.AllChurches, (data: Church[]) => {
    churchMap = new Map(data.map((c) => [c.id, c]));
});
addSubscription(ListenerEndpoints.AllMasses, (data: Mass[]) => {
    massMap = new Map(data.map((m) => [m.id, m]));
});

export const getMessdiener = (id: number): Promise<Messdiener | undefined> =>  {
    return getMessdienerMap().then(map => map.get(id));
};
export const getMessdienerMap = (): Promise<Map<number, Messdiener>> =>  {
    return new Promise<Map<number, Messdiener>>((resolve) => {
        if (messdienerMap == undefined) {
            getData(ListenerEndpoints.AllMessdiener).then((data: Messdiener[]) => {
                messdienerMap = new Map(data.map((m) => [m.identifier, m]));
                resolve(structuredClone(messdienerMap));
            });
            return;
        }
        resolve(structuredClone(messdienerMap));
    });
};

export const getFamily = (id: number): Promise<Family | undefined> =>  {
    return getFamilyMap().then(map => map.get(id));
};
export const getFamilyMap = (): Promise<Map<number, Family>> =>  {
    return new Promise<Map<number, Family>>((resolve) => {
        if (familyMap == undefined) {
            getData(ListenerEndpoints.AllFamilies).then((data: Family[]) => {
                familyMap = new Map(data.map((f) => [f.id, f]));
                resolve(structuredClone(familyMap));
            });
            return;
        }
        resolve(structuredClone(familyMap));
    });
};

export const getChurch = (id: number): Promise<Church | undefined> =>  {
    return getChurchMap().then(map => map.get(id));
};
export const getChurchMap = (): Promise<Map<number, Church>> =>  {
    return new Promise<Map<number, Church>>((resolve) => {
        if (churchMap == undefined) {
            getData(ListenerEndpoints.AllChurches).then((data: Church[]) => {
                churchMap = new Map(data.map((c) => [c.id, c]));
                resolve(structuredClone(churchMap));
            });
            return;
        }
        resolve(structuredClone(churchMap));
    });
};

export const getMass = (id: number): Promise<Mass | undefined> =>  {
    return getMassMap().then(map => map.get(id));
};
export const getMassMap = (): Promise<Map<number, Mass>> =>  {
    return new Promise<Map<number, Mass>>((resolve) => {
        if (massMap == undefined) {
            getData(ListenerEndpoints.AllMasses).then((data: Mass[]) => {
                massMap = new Map(data.map((m) => [m.id, m]));
                resolve(structuredClone(massMap));
            });
            return;
        }
        resolve(structuredClone(massMap));
    });
};
