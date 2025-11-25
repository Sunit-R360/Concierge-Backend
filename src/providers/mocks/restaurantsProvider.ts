// read restaurant data from restaurant.json and filter 

import path from "path";
import fs from "fs";
import { RestaurantResult } from "../../appLogic/types";

const restaurantPath = path.resolve(__dirname, "../../data/restaurants.json");
let restaurants: RestaurantResult[] = [];

try{
    const raw = fs.readFileSync(restaurantPath, "utf-8");
    restaurants = JSON.parse(raw);
} catch (error) {
    restaurants = [];
    console.warn("Error reading restaurants data:", error);
}

export async function getRestaurantCandidates(name: string) : Promise<RestaurantResult[]> {
    if(!name) {
        return restaurants;
    }
    const q = name.toLowerCase();
    return restaurants.filter((r) => r.name?.toLowerCase().includes(q));
}