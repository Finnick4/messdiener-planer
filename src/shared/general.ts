
export type Messdiener = {
    firstName: string
    lastNameInternal: string
    lastNameDisplay: string
    lastNameShorthand?: string
    familyID: number
    identifier: number
    churchActivity: number[]
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
