import {AllocationStatus} from "../../shared/general";
import {getSortedMasses} from "./specific-entries";
import {differenceBetweenTwoDateNumbers} from "../../shared/dates";

export const getStatusOfMessdienerAt = (messdienerID: number, date: number): Promise<AllocationStatus> => {
    return getStatusOfMessdienerSetAt(new Set<number>([messdienerID]), date);
}

export const getStatusOfMessdienerSetAt = async (messdienerIDs: Set<number>, date: number): Promise<AllocationStatus> => {
    const masses = await getSortedMasses();
    const status: AllocationStatus = {
        daysSinceLastAllocation: undefined,
        daysTillNextAllocation: undefined,
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

    status.isAllocated = anchorMass.allocatedMessdiener.intersection(messdienerIDs).size > 0;
    status.daysTillNextAllocation = ((): number | undefined => {
        for (let i = dateFoundAtIndex + 1; i < masses.length; i++) {
            if (masses[i].allocatedMessdiener.intersection(messdienerIDs).size > 0) {
                return differenceBetweenTwoDateNumbers(date, masses[i].date);
            }
        }
        return undefined;
    })();
    status.daysSinceLastAllocation = ((): number | undefined => {
        for (let i = dateFoundAtIndex - 1; i >= 0; i--) {
            if (masses[i].allocatedMessdiener.intersection(messdienerIDs).size > 0) {
                return differenceBetweenTwoDateNumbers(date, masses[i].date);
            }
        }
        return undefined;
    })();
    status.averageDaysTillAllocation = ((): number => {
        if (status.daysSinceLastAllocation != undefined && status.daysTillNextAllocation != undefined) {
            return (status.daysTillNextAllocation + status.daysSinceLastAllocation) / 2;
        }
        if (status.daysTillNextAllocation == undefined && status.daysSinceLastAllocation != undefined) {
            return status.daysSinceLastAllocation;
        }
        if (status.daysTillNextAllocation != undefined && status.daysSinceLastAllocation == undefined) {
            return status.daysTillNextAllocation;
        }
        return Infinity;
    })();
    if (status.allocationCount != 0) {
        status.urgency = status.averageDaysTillAllocation / status.allocationCount;
    }

    return status;
}
