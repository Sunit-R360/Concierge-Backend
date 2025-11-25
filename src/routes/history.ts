// GET/POST /api/history

import { Router } from "express";
import { getHistoryHandler, postHistory } from "../controllers/historyController";

const historyRouter = Router();
historyRouter.post("/api/history", postHistory);
historyRouter.get("/api/history", getHistoryHandler);

export default historyRouter;