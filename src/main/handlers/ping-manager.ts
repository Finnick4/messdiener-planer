import {Family, Messdiener} from "../../shared/general";
import WebContents = Electron.WebContents;

export interface PingDestination {
    onMessdienerUpdate: (data: Messdiener[]) => void,
    onFamiliesUpdate: (data: Family[]) => void,
}

export const createPingDestination = (windowWebContents: WebContents): PingDestination => {
    return {
        onMessdienerUpdate(data: Messdiener[]): void {
            windowWebContents.send('update-messdiener', data);
        },
        onFamiliesUpdate(data: Family[]): void {
            windowWebContents.send('update-families', data);
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
}

export const pingManager = new PingManager();
