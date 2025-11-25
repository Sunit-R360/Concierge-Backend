import { FlightQuery, PromptQuery, RestaurantQuery } from "./types";

// raw prompt to structured query
function normalizeDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString().slice(0, 10);
  const m = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[1] : new Date().toISOString().slice(0, 10);
}

function normalizeTime(timeStr: string | undefined): string {
  if (!timeStr) return "12:00";
  const m = timeStr.match(/([01]?\d|2[0-3]):([0-5]\d)/);
  if (!m) return "12:00";
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

export function parsePrompt(raw: string, userId?: string): PromptQuery {
  const lower = raw.toLowerCase();

  const fromMatch = raw.match(/from\s+([A-Za-z ]+?)(?:\s+to|\s+on|\s+at|$)/i);
  const toMatch = raw.match(/to\s+([A-Za-z ]+?)(?:\s+on|\s+at|$)/i);
  const dateMatch = raw.match(/on\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  const timeMatch = raw.match(/at\s+([0-2]?\d:[0-5]\d)/i);
  const cabinMatch = raw.match(/\b(business|economy|first)\b/i);
  const adultsMatch = raw.match(/(\d+)\s*(?:adults|adult)/i);
  const kidsMatch = raw.match(/(\d+)\s*(?:kids|children)/i);
  const restaurantNameMatch = raw.match(
    /at\s+([A-Za-z0-9' ]+?)(?:\s+for|\s+on|\s+at|$)/i
  );

  if (lower.includes("flight") || fromMatch || toMatch) {
    const q: FlightQuery = {
      type: "flight",
      userId: userId ?? "anon",
      raw,
      from: fromMatch ? fromMatch[1].trim() : "Unknown",
      to: toMatch ? toMatch[1].trim() : "Unknown",
      date: normalizeDate(dateMatch ? dateMatch[1] : undefined),
      time: normalizeTime(timeMatch ? timeMatch[1] : undefined),
      cabin: cabinMatch ? (cabinMatch[1].toLowerCase() as any) : "business",
      adults: adultsMatch ? Number(adultsMatch[1]) : 1,
      kids: kidsMatch ? Number(kidsMatch[1]) : 0,
    };
    return q;
  }

  if (
    lower.includes("reserve") ||
    lower.includes("table") ||
    lower.includes("restaurant")
  ) {
    const peopleMatch = raw.match(/for\s+(\d+)\s*people?/i);
    const dateMatch2 = raw.match(/on\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    const timeMatch2 = raw.match(/at\s+([0-2]?\d:[0-5]\d)/i);
    const q: RestaurantQuery = {
      type: "restaurant",
      userId: userId ?? "anon",
      raw,
      name: restaurantNameMatch ? restaurantNameMatch[1].trim() : undefined,
      date: normalizeDate(dateMatch2 ? dateMatch2[1] : undefined),
      time: normalizeTime(timeMatch2 ? timeMatch2[1] : undefined),
      people: peopleMatch ? Number(peopleMatch[1]) : 2,
    };
    return q;
  }
  return {
    type: "unknown",
    userId: userId ?? "anon",
    raw,
  };
}
