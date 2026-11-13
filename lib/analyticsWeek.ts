/** Normalize legacy numeric weeks and year-qualified API periods for sorting and React keys. */
export function analyticsWeek(value: number | string, selectedYear: number): string {
    const text = String(value).trim();
    const qualified = /^(\d{4})-W(\d{1,2})$/.exec(text);
    const year = qualified ? Number(qualified[1]) : selectedYear;
    const week = qualified ? Number(qualified[2]) : /^\d{1,2}$/.test(text) ? Number(text) : NaN;
    if (!Number.isInteger(year) || year < 1000 || year > 9999 ||
        !Number.isInteger(week) || week < 0 || week > 53) {
        throw new Error('The weekly report returned an invalid week. Please refresh the report.');
    }
    return `${year}-W${String(week).padStart(2, '0')}`;
}
