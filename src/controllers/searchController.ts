import {Request, Response} from "express";
import { parsePrompt } from "../appLogic/promptParser";
import { appendHistory } from "../lib/redis";
import { getFlightCandidates } from "../providers/mocks/flightsProvider";
import { rankFlights, rankRestaurants } from "../appLogic/ranking";
import { getRestaurantCandidates } from "../providers/mocks/restaurantsProvider";

export async function searchHandler(req: Request, res: Response) {
    try{
        const body = req.body ?? {};
        const userId = body.userId ?? "anon";
        console.log("------ SEARCH REQUEST ------");
        console.log("RAW PROMPT:", body.prompt);
        const parsed = body.query ? body.query : parsePrompt(body.prompt ?? "", userId);
        console.log("PARSED QUERY:", JSON.stringify(parsed, null, 2));

        if(parsed.type === "unknown"){
            // if frontend sent a prompt, persist it to history
            if(body.prompt) await appendHistory(userId, body.prompt);
            console.log("TYPE UNKNOWN → returning empty results");
            return res.json({results: []});
        }

        if(parsed.type === "flight"){
            const q = parsed;
            const candidates = await getFlightCandidates(q.from, q.to);
            console.log("FLIGHT CANDIDATES FOUND:", candidates.length);
            console.log("CANDIDATES:", candidates);
            const ranked = rankFlights(q, candidates).slice(0,3);
            const results = ranked.map((r) => ({
                ...r,
                addOns:[
                    {id: `${r.id}-bag`, name: "Extra Baggage", price: 30},
                    {id: `${r.id}-meal`, name: "In-flight Meal", price: 15}
                ]
            }));
            if(body.prompt) await appendHistory(userId, body.prompt);
            return res.json({results});
        }

        if(parsed.type === "restaurant"){
            const q = parsed;
            const candidates = await getRestaurantCandidates(q.name);
            const ranked = rankRestaurants(q, candidates).slice(0,3);
            const results = ranked.map((r) => ({
                ...r,
                addOns:[{id: `${r.id}-cake`, name: "Celebration Cake", price: 30}]
            }));
            if(body.prompt) await appendHistory(userId, body.prompt);
            return res.json({results});
        }

        return res.json({results: []});
    } catch(error){
        console.log("Search Error", error);
        return res.status(500).json({error: "Internal server error"});
    }
}