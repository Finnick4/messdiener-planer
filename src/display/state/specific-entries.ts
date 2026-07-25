import {Absence, Church, Family, Mass, Messdiener} from "../../shared/general";
import {addSubscription, getData, ListenerEndpoints} from "./state-manager";

let messdienerMap: Map<number, Messdiener> | undefined = undefined;
let familyMap: Map<number, Family> | undefined = undefined;
let churchMap: Map<number, Church> |undefined = undefined;
let massMap: Map<number, Mass> | undefined = undefined;
let familyMemberships: Map<number, Set<Messdiener>> | undefined = undefined;
let absencesMap: Map<number, Absence> | undefined = undefined;
let orderedAbsences: Absence[] | undefined = undefined;

addSubscription(ListenerEndpoints.AllMessdiener, (data: Messdiener[]) => {
    messdienerMap = new Map(data.map((m) => [m.identifier, m]));
    familyMemberships = undefined;
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
addSubscription(ListenerEndpoints.AllAbsences, (data: Absence[]) => {
    absencesMap = new Map(data.map((a) => [a.id, a]));
    orderedAbsences = data.sort((a, b) => a.startDate - b.startDate);
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

const updateFamilyMemberships = (data: Messdiener[]) => {
    familyMemberships = new Map<number, Set<Messdiener>>();
    data.forEach(messdiener =>  {
        const family = familyMemberships?.get(messdiener.familyID);
        if (family) {
            family.add(messdiener);
            familyMemberships?.set(messdiener.familyID, family);
            return;
        }
        familyMemberships?.set(messdiener.familyID, new Set<Messdiener>([messdiener]));
    })
}

export const getFamilyMembershipsMap = (): Promise<Map<number, Set<Messdiener>>> =>  {
    return new Promise<Map<number, Set<Messdiener>>>((resolve) => {
        if (familyMemberships == undefined) {
            getData(ListenerEndpoints.AllMessdiener).then((data: Messdiener[]) => {
                familyMemberships = new Map<number, Set<Messdiener>>();
                updateFamilyMemberships(data);
                resolve(structuredClone(familyMemberships));
            });
            return;
        }
        resolve(structuredClone(familyMemberships));
    });
};

export const getAbsence = (id: number): Promise<Absence | undefined> =>  {
    return getAbsencesMap().then(map => map.get(id));
};
export const getAbsencesMap = (): Promise<Map<number, Absence>> =>  {
    return new Promise<Map<number, Absence>>((resolve) => {
        if (absencesMap == undefined) {
            getData(ListenerEndpoints.AllAbsences).then((data: Absence[]) => {
                absencesMap = new Map(data.map((a) => [a.id, a]));
                resolve(structuredClone(absencesMap));
            });
            return;
        }
        resolve(structuredClone(absencesMap));
    });
};

export const getAbsencesAffectingDate = (date: number): Promise<Absence[]> => {
    const filter = (absences: Absence[]): Absence[] => {
        const matching: Absence[] = [];

        for (const absence of absences) {
            if (absence.startDate > date) {
                break;
            }
            if (absence.startDate <= date && date <= absence.endDate) {
                matching.push(absence);
            }
        }

        return structuredClone(matching);
    }

    return new Promise<Absence[]>((resolve) => {
        if (date <= 0) {
            resolve([]);
            return;
        }

        if (orderedAbsences == undefined) {
            getData(ListenerEndpoints.AllAbsences).then((data: Absence[]) => {
                orderedAbsences = data.sort((a, b) => a.startDate - b.startDate);
                resolve(filter(orderedAbsences));
            });
            return;
        }
        resolve(filter(orderedAbsences));
    });
}
