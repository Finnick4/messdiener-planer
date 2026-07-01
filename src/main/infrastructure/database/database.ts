import {Family, Messdiener} from "../../../shared/general";

export interface DatabaseConnection {
    initialiseDatabase: () => Promise<void>;
    getAllMessdiener: () => Promise<Messdiener[]>;
    createMessdienerInFamily: (name: string, familyID: number) => Promise<number>;
    createMessdienerAndFamily: (name: string, lastName: string, internal?: string, shorthand?: string) => Promise<number>;
    removeMessdiener: (id: number) => Promise<void>;
    changeMessdienerName: (id: number, newName: string) => Promise<void>;

    getAllFamilies: () => Promise<Family[]>;
    createFamily: (lastName: string, internal?: string, shorthand?: string) => Promise<number>;
}