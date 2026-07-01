
export const createInternalFamilyName = (internalName: string, displayName: string): string => {
    if (internalName == displayName) {
        return displayName;
    }
    return `${displayName} (${internalName})`;
}