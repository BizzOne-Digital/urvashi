export const CALENDAR_PRODUCT_SLUG = "sublimation-desk-calendar";

export const CALENDAR_MONTH_COUNT = 12;

export const CALENDAR_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function isCalendarProduct(slug?: string): boolean {
  return slug === CALENDAR_PRODUCT_SLUG;
}
