
export const differenceBetweenTwoDateNumbers = (a: number, b: number): number => {
    return (makeDateNumberToDate(a).getTime() - makeDateNumberToDate(b).getTime()) / 1440000;
}

export const makeDateNumberToDate = (date: number): Date => {
    return new Date(Number(String(date).substring(0, 4)),
        Number(String(date).substring(4, 6)) - 1,
        Number(String(date).substring(6, 8)));
}
