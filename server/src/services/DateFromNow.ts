export function dateFromNow(seconds: number): Date {
    return new Date(Date.now() + seconds * 1000);
}



export function isDateInPast(date: Date): boolean {
    return date.getTime() < Date.now();
}