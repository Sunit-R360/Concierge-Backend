import { Request, Response } from 'express';
import { generateSuggestions } from '../appLogic/suggestionEngine';
export async function autoCompleteHandler(req: Request, res: Response) {
    try{
        const {token, userId} = req.body ?? {};
        if(!token) return res.status(400).json({error: "Missing token"});
        const suggestions = await generateSuggestions(token, userId);
        return res.json({suggestions});
    } catch(error){
        console.error("Autocomplete error:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}