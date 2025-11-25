import { Request, Response } from "express";
import { appendHistory, getHistory } from "../lib/redis";

export async function postHistory(req: Request, res: Response) {
    try{
        const {userId = "anon", prompt} = req.body ?? {};
        if(!prompt) return res.status(400).json({error: "Missing prompt"});
        await appendHistory(userId, prompt);
        return res.json({status: "ok"});
    } catch(error){
        console.error("Post history error:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

export async function getHistoryHandler(req: Request, res: Response) {
    try{
        const userId = (req.query.userId as string) || "anon";
        const limit = Number(req.query.limit ?? 50);
        const hist = await getHistory(userId, limit);
        return res.json({history: hist});
    } catch(error){
        console.error("Get history error:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}