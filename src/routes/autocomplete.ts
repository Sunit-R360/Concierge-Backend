// route handler: POST api/autocomplete

import { Router } from "express";
import { autoCompleteHandler } from "../controllers/autocompleteController";

const autoCompleteRouter = Router();
autoCompleteRouter.post("/api/autocomplete", autoCompleteHandler);

export default autoCompleteRouter;