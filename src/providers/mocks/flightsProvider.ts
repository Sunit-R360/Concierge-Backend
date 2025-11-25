// read flight data from flights.json and filter 

import path from "path";
import fs from "fs";
import { FlightResult } from "../../appLogic/types";

const flightsPath = path.resolve(__dirname, "../../data/flights.json");
let flights: FlightResult[] = [];

try{
    const raw = fs.readFileSync(flightsPath, "utf-8");
    flights = JSON.parse(raw);
} catch (error) {
    flights = [];
    console.warn("Error reading flights data:", error);
}

export async function allFlights(): Promise<FlightResult[]> {
    return flights;
}

export async function getFlightCandidates(from: string, to: string): Promise<FlightResult[]> {
    if(!from || !to) {
        return [];
    }
    const fromQ = from.trim().toLowerCase();
    const toQ = to.trim().toLowerCase();
    return flights.filter((f) => ((f.from ?? "").toLowerCase() === fromQ) && ((f.to ?? "").toLowerCase() === toQ));
}