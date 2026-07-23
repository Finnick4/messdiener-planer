import {Absence, Church, Family, Mass, Messdiener} from "../../shared/general";
import {getAllAbsences, getAllChurches, getAllFamilies, getAllMasses, getAllMessdiener} from "../application/state";
import WebContents = Electron.WebContents;

export interface PingDestination {
    onMessdienerUpdate: (data: Messdiener[]) => void,
    onFamiliesUpdate: (data: Family[]) => void,
    onChurchesUpdate: (data: Church[]) => void,
    onMassesUpdate: (data: Mass[]) => void,
    onAbsenceUpdate: (data: Absence[]) => void,
}

export const createPingDestination = (windowWebContents: WebContents): PingDestination => {
    return {
        onMessdienerUpdate(data: Messdiener[]): void {
            windowWebContents.send('update-messdiener', data);
        },
        onFamiliesUpdate(data: Family[]): void {
            windowWebContents.send('update-families', data);
        },
        onChurchesUpdate(data: Church[]): void {
            windowWebContents.send('update-church', data);
        },
        onMassesUpdate(data: Mass[]): void {
            windowWebContents.send('update-mass', data);
        },
        onAbsenceUpdate(data: Absence[]): void {
            windowWebContents.send('update-absence', data);
        },
    }
}

class PingManager implements PingDestination {
    private destinations: PingDestination[];

    constructor() {
        this.destinations = [];
    }
    addDestination(dest: PingDestination) {
        this.destinations.push(dest);
    }
    // @TODO removal of unused PingDestination entries

    onMessdienerUpdate(data: Messdiener[]) {
        this.destinations.forEach(dest => dest.onMessdienerUpdate(data));
    }
    onFamiliesUpdate(data: Family[]) {
        this.destinations.forEach(dest => dest.onFamiliesUpdate(data));
    }
    onChurchesUpdate(data: Church[]) {
        this.destinations.forEach(dest => dest.onChurchesUpdate(data));
    }
    onMassesUpdate(data: Mass[]) {
        this.destinations.forEach(dest => dest.onMassesUpdate(data));
    }
    onAbsenceUpdate(data: Absence[]) {
        this.destinations.forEach(dest => dest.onAbsenceUpdate(data));
    }
}

export const pingManager = new PingManager();

export const pingMessdienerUpdate = () => {
    getAllMessdiener().then(messdiener => pingManager.onMessdienerUpdate(messdiener));
}

export const pingFamiliesUpdate = () => {
    getAllFamilies().then(families => pingManager.onFamiliesUpdate(families));
}

export const pingChurchesUpdate = () => {
    getAllChurches().then(churches => pingManager.onChurchesUpdate(churches));
}

export const pingMassesUpdate = () => {
    getAllMasses().then(masses => pingManager.onMassesUpdate(masses));
}

export const pingAbsencesUpdate = () => {
    getAllAbsences().then(absences => pingManager.onAbsenceUpdate(absences));
}
