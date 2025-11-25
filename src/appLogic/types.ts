// DTOs
export type SuggestionType = "history" | "city" | "action" | "service" | "restaurant";

export interface Suggestion {
    value: string;
    type?: SuggestionType;
    meta?: Record<string, any>;
}

export type QueryType = "flight" | "restaurant" | "unknown";

export interface PromptQueryBase{
    type: QueryType;
    raw: string;
    userId: string;
}

export interface FlightQuery extends PromptQueryBase{
    type: "flight";
    from: string;
    to: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    cabin?: "economy" | "business" | "first";
    adults?: number;
    kids?: number;
}

export interface RestaurantQuery extends PromptQueryBase{
    type: "restaurant";
    name?: string;
    date?: string; // YYYY-MM-DD
    time?: string; // HH:MM
    people?: number;
}

export type PromptQuery = FlightQuery | RestaurantQuery | PromptQueryBase;

export interface AddOn {
    id: string;
    name: string;
    priceUSD: number;
}

export interface FlightResult{
    id: string;
    airline: string;
    from: string;
    to: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    classes: string[];
    priceUSD: number;
    durationMinutes: number;
    addOns?: AddOn[];
    score: number;
}

export interface RestaurantResult{
    id: string;
    name: string;
    stars?: number; // 0-5
    rating?: number; // 0-5
    cuisine?: string[];
    availableSlots: string[]; // ISO datetime
    addOns?: AddOn[];
    score: number;
}