import {Church, Family, Messdiener} from "../../../shared/general";

export interface DatabaseConnection {
    initialiseDatabase: () => Promise<void>;
    getAllMessdiener: () => Promise<Messdiener[]>;
    createMessdienerInFamily: (name: string, familyID: number) => Promise<number>;
    createMessdienerAndFamily: (name: string, lastName: string, internal?: string, shorthand?: string) => Promise<number>;
    removeMessdiener: (id: number) => Promise<void>;
    changeMessdienerName: (id: number, newName: string) => Promise<void>;
    changeMessdienerFamilyAssociation: (messdienerID: number, newFamilyID: number) => Promise<void>;
    changeMessdienerFamilyAssociationNewFamily: (messdienerID: number, lastName: string, internal?: string, shorthand?: string) => Promise<void>;

    getAllFamilies: () => Promise<Family[]>;
    createFamily: (lastName: string, internal?: string, shorthand?: string) => Promise<number>;

    createChurch: (name: string, location?: string) => Promise<number>;
    getAllChurches: () => Promise<Church[]>;
    addMessdienerToChurch: (messdienerID: number, churchID: number) => Promise<void>;
    removeMessdienerFromChurch: (messdienerID: number, churchID: number) => Promise<void>;
    removeChurch: (id: number) => Promise<void>;
    changeChurchName: (id: number, newName: string) => Promise<void>;
}