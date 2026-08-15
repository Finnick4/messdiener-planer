
export type Messdiener = {
    firstName: string
    lastNameInternal: string
    lastNameDisplay: string
    lastNameShorthand?: string
    displayShorthand: boolean
    familyID: number
    identifier: number
    churchActivity: Set<number>
    absences: EmbeddedAbsence[]
}

export type Family = {
    id: number
    lastNameInternal: string
    lastNameDisplay: string
    memberSize:  number
    shorthand?: string
}

export type Church = {
    id: number
    name: string
    location?: string
}

export type MessdienerChurchActivityStatus = {
    messdienerID: number
    churchID: number
    isActive: boolean
}

export type Mass = {
    id: number
    date: number
    churchID: number
    allocatedMessdiener: Set<number>
    note?: string
}

export type MessdienerMassAllocation = {
    messdienerID: number
    massID: number
    isActive: boolean
}

export type ExportSettings = {
    title: string
    version: string
    hint: string
    displayedChurchIDs: Set<number>
    mainChurchID: number
    otherChurchComment: boolean
    otherChurchCommentUseLocation: boolean
}

export type EmbeddedAbsence = {
    id: number
    startDate: number
    endDate: number
}

export type Absence = {
    id: number
    startDate: number
    endDate: number
    affectedMessdiener: Set<number>
}