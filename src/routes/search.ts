// route handler: POST /api/search

import { Router } from "express";
import { searchHandler } from "../controllers/searchController";

const searchRouter = Router();

searchRouter.post("/api/search", searchHandler);

export default searchRouter;