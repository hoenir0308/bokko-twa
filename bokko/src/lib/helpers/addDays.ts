export function addDays(date: Date, days: number) {
    if (days === 0) return date;
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
