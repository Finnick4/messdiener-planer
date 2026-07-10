
export const createInternalChurchName = (name: string, location: string | undefined): string => {
    if (!location) {
        return name;
    }
    return `${name} (${location})`;
}