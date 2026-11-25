/**
 * When the studio is open, from the hours published on the contact page:
 * Tuesday to Saturday, 10:00 to 18:00. Accra keeps GMT all year with no
 * daylight saving, so UTC is local time there.
 */
export const STUDIO_HOURS = { days: [2, 3, 4, 5, 6], open: 10, close: 18 } as const;
export const STUDIO_HOURS_LABEL = "Tue–Sat, 10:00–18:00 GMT";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface StudioStatus {
  open: boolean;
  /** "Open now, until 18:00" or "Closed, opens Tuesday at 10:00". */
  label: string;
  /** Local time in Accra, "14:32". */
  time: string;
}

export function studioStatus(now = new Date()): StudioStatus {
  const day = now.getUTCDay();
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const time = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
  const isStudioDay = (d: number) => (STUDIO_HOURS.days as readonly number[]).includes(d);
  const openAt = STUDIO_HOURS.open * 60;
  const closeAt = STUDIO_HOURS.close * 60;

  if (isStudioDay(day) && minutes >= openAt && minutes < closeAt) {
    return { open: true, label: `Open now, until ${STUDIO_HOURS.close}:00`, time };
  }

  if (isStudioDay(day) && minutes < openAt) {
    return { open: false, label: `Closed, opens today at ${STUDIO_HOURS.open}:00`, time };
  }

  for (let step = 1; step <= 7; step++) {
    const next = (day + step) % 7;
    if (!isStudioDay(next)) continue;
    const when = step === 1 ? "tomorrow" : DAY_NAMES[next];
    return { open: false, label: `Closed, opens ${when} at ${STUDIO_HOURS.open}:00`, time };
  }

  return { open: false, label: "Closed", time };
}
