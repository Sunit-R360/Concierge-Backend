import { FlightQuery, PromptQuery, RestaurantQuery } from "./types";

// raw prompt to structured query
function normalizeDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString().slice(0, 10);
  const m = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : new Date().toISOString().slice(0, 10);
}

function normalizeTime(timeStr: string | undefined): string {
  if (!timeStr) return "12:00";
  const m = timeStr.match(/([01]?\d|2[0-3]):([0-5]\d)/);
  if (!m) return "12:00";
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

export function parsePrompt(raw: string, userId?: string): PromptQuery {
  const uid = userId ?? "anon";
  const text = (raw || "").trim();
  const lower = text.toLowerCase();

  const routeMatch = text.match(
    /from\s+([A-Za-z ]+?)\s+to\s+([A-Za-z ]+?)(?=\s+on|\s+at|$)/i
  );
  let from = "";
  let to = "";

  if (routeMatch) {
    from = routeMatch[1].trim();
    to = routeMatch[2].trim();
  } else {
    const fromMatch = text.match(
      /from\s+([A-Za-z ]+?)(?=\s+to|\s+on|\s+at|$)/i
    );
    if (fromMatch) from = fromMatch[1].trim();

    const toAll = [...text.matchAll(/to\s+([A-Za-z ]+?)(?=\s+on|\s+at|$)/gi)];
    if (toAll.length > 0) {
      const last = toAll[toAll.length - 1];
      to = last && last[1] ? last[1].trim() : "";
    }
  }

  // const fromMatch = raw.match(/from\s+([A-Za-z ]+?)(?:\s+to|\s+on|\s+at|$)/i);
  // const toMatch = raw.match(/to\s+([A-Za-z ]+?)(?:\s+on|\s+at|$)/i);
  const dateMatch = text.match(/on\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  const timeMatch = text.match(/at\s+([0-2]?\d:[0-5]\d)/i);
  const cabinMatch = text.match(/\b(business|economy|first)\b/i);
  const adultsMatch = text.match(/(\d+)\s*(?:adults|adult)/i);
  const kidsMatch = text.match(/(\d+)\s*(?:kids|children)/i);
  const restaurantNameMatch = text.match(
    /at\s+([A-Za-z0-9' ]+?)(?=\s+for|\s+on|\s+at|$)/i
  );

  if (lower.includes("flight") || from || to) {
    const q: FlightQuery = {
      type: "flight",
      userId: uid,
      raw,
      from,
      to,
      date: normalizeDate(dateMatch ? dateMatch[1] : undefined),
      time: normalizeTime(timeMatch ? timeMatch[1] : undefined),
      cabin: cabinMatch ? (cabinMatch[1].toLowerCase() as any) : "business",
      adults: adultsMatch ? Number(adultsMatch[1]) : 1,
      kids: kidsMatch ? Number(kidsMatch[1]) : 0,
    };
    return q;
  }

  if (
    lower.includes("restaurant") ||
    lower.includes("reserve") ||
    lower.includes("table")
  ) {
    const q: RestaurantQuery = {
      type: "restaurant",
      userId: uid,
      raw,
      name: restaurantNameMatch ? restaurantNameMatch[1].trim() : undefined,
      date: normalizeDate(dateMatch ? dateMatch[1] : undefined),
      time: normalizeTime(timeMatch ? timeMatch[1] : undefined),
      people: adultsMatch ? Number(adultsMatch[1]) : 2,
    };
    return q;
  }
  return {
    type: "unknown",
    userId: uid,
    raw,
  };
}
