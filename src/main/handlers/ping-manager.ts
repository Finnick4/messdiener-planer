import {Church, Family, Messdiener} from "../../shared/general";
import WebContents = Electron.WebContents;
import {getAllChurches, getAllFamilies, getAllMessdiener} from "../application/state";

export interface PingDestination {
    onMessdienerUpdate: (data: Messdiener[]) => void,
    onFamiliesUpdate: (data: Family[]) => void,
    onChurchesUpdate: (data: Church[]) => void,
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
            windowWebContents.send('update-churches', data);
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
        this.destinations.forEach(dest => dest.onFamiliesUpdate(data))
    }
    onChurchesUpdate(data: Church[]) {
        this.destinations.forEach(dest => dest.onChurchesUpdate(data))
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