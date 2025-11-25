// logic to generate suggestions 

import { getHistory } from "../lib/redis";
import { allFlights } from "../providers/mocks/flightsProvider";
import { getRestaurantCandidates } from "../providers/mocks/restaurantsProvider";
import { Suggestion } from "./types";

export async function generateSuggestions(token: string, userId?: string): Promise<Suggestion[]> {
    const out: Suggestion[] = [];
    if(!token || token.trim().length === 0) {
        return out;
    }

    const history = await getHistory(userId ?? "anon", 50);
    for(const h of history) {
        if(h.toLowerCase().includes(token.toLowerCase())) {
            out.push({value: h, type: "history"});
            if(out.length >= 3) {
                return out;
            }
        }
    }

    const flights = await allFlights();
    const cities = Array.from(new Set([...flights.map(f => f.from), ...flights.map(f => f.to)]));
    for(const c of cities){
        if(c.toLowerCase().startsWith(token.toLowerCase()) && !out.find((s)=>s.value === c)){
            out.push({value: c, type: "city"});
            if(out.length >= 3) {
                return out;
            }
        }
    }    

    const restaurants = await getRestaurantCandidates(token);
    for(const r of restaurants){
        if(!out.find((s)=>s.value === r.name)){
            out.push({value: r.name, type: "restaurant", meta: {rating: r.rating}});
            if(out.length >= 3) {
                return out;
            }
        }
    }

    const actions = ["book", "reserve", "flight", "table", "arrange"];
    for(const a of actions){
        if(a.startsWith(token.toLowerCase()) && !out.find((s)=>s.value === a)){
            out.push({value: a, type: "action"});
            if(out.length >= 3) {
                return out;
            }
        }
    }    

    return out.slice(0, 3);
}