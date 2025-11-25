// scoring logic

import { FlightQuery, FlightResult, RestaurantQuery, RestaurantResult } from "./types";

function hhmmToMinutes(hhmm: string){
    const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
    if(!m) return Infinity;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    return hh * 60 + mm;
}

// Flight Ranking: lower time difference > cabin match > price
// lower the score better the rank

export function rankFlights(query: FlightQuery, candidates: FlightResult[]):FlightResult[]{
    const cabin = query.cabin || "business";
    const qMinutes = hhmmToMinutes(query.time);

    return candidates.map((c)=>{
        const cMinutes = hhmmToMinutes(c.time);
        const timeDiff = Math.abs(qMinutes - cMinutes);
        const cabinPenalty = c.classes.includes(cabin) ? 0 : 300; // big penalty for requested class not available
        const priceVal = (c as any).priceUSD ?? (c as any).price ?? 0;
        const priceFactor = priceVal / 10; // normalize price impact
        const score = timeDiff + cabinPenalty + priceFactor;
        return {...c, score};
    }).sort((a,b)=> (a.score ?? 0) - (b.score ?? 0));
}

// Restaurant ranking: prefer higher rating > and availability around the slot
export function rankRestaurants(query: RestaurantQuery, candidates: RestaurantResult[]):RestaurantResult[] {
    return candidates.map((c)=>{
        let score = 100;
        if(typeof c.rating === 'number'){
            score -= c.rating * 10; // higher rating => lower score
        }
        if(query.time && c.availableSlots && c.availableSlots.length > 0){
            const time = query.time;
            const exact = c.availableSlots.find((s) => s.includes(time));
            if(exact){
                score -= 20; // big bonus for exact time match
            }
        }
        return {...c, score};
    }).sort((a,b)=> (a.score ?? 0) - (b.score ?? 0));
}