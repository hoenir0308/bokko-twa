export function getRuDayByNum(number: number) {
    const cases = [2, 0, 1, 1, 1, 2];
    return `${['День', 'Дня', 'Дней'][number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]]}`;
}
