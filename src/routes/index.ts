// src/routes/index.ts
import { Router } from "express";
import { autoCompleteHandler } from "../controllers/autocompleteController";
import { searchHandler } from "../controllers/searchController";
import { postHistory, getHistoryHandler } from "../controllers/historyController";

const router = Router();

router.post("/api/autocomplete", autoCompleteHandler);
router.post("/api/search", searchHandler);
router.post("/api/history", postHistory);
router.get("/api/history", getHistoryHandler);

export default router;
