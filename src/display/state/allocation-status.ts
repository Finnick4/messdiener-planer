import {AllocationStatus} from "../../shared/general";
import {getSortedMasses} from "./specific-entries";
import {differenceBetweenTwoDateNumbers} from "../../shared/dates";

export const getStatusOfMessdienerAt = (messdienerID: number, date: number): Promise<AllocationStatus> => {
    return getStatusOfMessdienerSetAt(new Set<number>([messdienerID]), date);
}

export const getStatusOfMessdienerSetAt = async (messdienerIDs: Set<number>, date: number): Promise<AllocationStatus> => {
    const masses = await getSortedMasses();
    const status: AllocationStatus = {
        daysSinceLastExplicitAllocation: undefined,
        daysTillNextExplicitAllocation: undefined,
        allocationCount: 0,
        date: date,
        isAllocated: false,
        averageDaysTillAllocation: Infinity,
        urgency: Infinity,
    }
    if (masses.length == 0) {
        return status;
    }
    const dateFoundAtIndex = ((): number => {
        let bestIndex = -1, bestIndexDaysOff = Infinity;

        for (let i = 0; i < masses.length; i++) {
            const mass = masses[i];
            const difference = differenceBetweenTwoDateNumbers(mass.date, date);
            if (difference < bestIndexDaysOff) {
                bestIndex = i;
                bestIndexDaysOff = difference;
            }
            if (mass.allocatedMessdiener.size == 0 || mass.allocatedMessdiener.intersection(messdienerIDs).size > 0) {
                status.allocationCount++;
            }
        }
        return bestIndex;
    })();
    const anchorMass = masses[dateFoundAtIndex];

    status.isAllocated = anchorMass.allocatedMessdiener.size == 0 || anchorMass.allocatedMessdiener.intersection(messdienerIDs).size > 0;
    status.daysTillNextExplicitAllocation = ((): number | undefined => {
        for (let i = dateFoundAtIndex + 1; i < masses.length; i++) {
            if (masses[i].allocatedMessdiener.intersection(messdienerIDs).size > 0) {
                return differenceBetweenTwoDateNumbers(date, masses[i].date);
            }
        }
        return undefined;
    })();
    status.daysSinceLastExplicitAllocation = ((): number | undefined => {
        for (let i = dateFoundAtIndex - 1; i >= 0; i--) {
            if (masses[i].allocatedMessdiener.intersection(messdienerIDs).size > 0) {
                return differenceBetweenTwoDateNumbers(date, masses[i].date);
            }
        }
        return undefined;
    })();
    status.averageDaysTillAllocation = ((): number => {
        if (status.daysSinceLastExplicitAllocation != undefined && status.daysTillNextExplicitAllocation != undefined) {
            return (status.daysTillNextExplicitAllocation + status.daysSinceLastExplicitAllocation) / 2;
        }
        if (status.daysTillNextExplicitAllocation == undefined && status.daysSinceLastExplicitAllocation != undefined) {
            return status.daysSinceLastExplicitAllocation;
        }
        if (status.daysTillNextExplicitAllocation != undefined && status.daysSinceLastExplicitAllocation == undefined) {
            return status.daysTillNextExplicitAllocation;
        }
        return Infinity;
    })();
    if (status.allocationCount != 0) {
        status.urgency = status.averageDaysTillAllocation / status.allocationCount;
    }

    return status;
}
