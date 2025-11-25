// /concierge/concierge-backend/src/server.ts
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { autoCompleteHandler } from "./controllers/autocompleteController";
import { searchHandler } from "./controllers/searchController";
import { postHistory, getHistoryHandler } from "./controllers/historyController";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

console.log("[server] starting bootstrap...");

// basic global error handlers to capture crashes
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException] =>", err && (err as any).stack ? (err as any).stack : err);
  // do not exit here so nodemon can show logs — but you can uncomment exit if desired:
  // process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection] =>", reason);
});

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(",");
console.log("[server] allowedOrigins:", allowedOrigins);

// CORS config
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, ok?: boolean) => void) => {
    if (!origin) {
      // tools like curl won't set origin - allow those
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn("[cors] blocked origin:", origin);
    return callback(new Error("CORS_NOT_ALLOWED"));
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
};

console.log("[server] applying middleware...");
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// lightweight preflight handler (safe)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || allowedOrigins[0]);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    return res.sendStatus(204);
  }
  next();
});

console.log("[server] mounting routes...");

// validate controller functions are defined
console.log("[server] autocompleteHandler is", typeof autoCompleteHandler);
console.log("[server] searchHandler is", typeof searchHandler);
console.log("[server] postHistory is", typeof postHistory);
console.log("[server] getHistoryHandler is", typeof getHistoryHandler);

try {
  app.post("/api/autocomplete", autoCompleteHandler);
  app.post("/api/search", searchHandler);
  app.post("/api/history", postHistory);
  app.get("/api/history", getHistoryHandler);
} catch (err) {
  console.error("[server] error while mounting routes:", err);
}

app.get("/health", (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// 404 and error handlers
app.use((req, res) => {
  res.status(404).json({ error: "not_found" });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[server] Unhandled error:", err && err.stack ? err.stack : err);
  res.status(500).json({ error: "server_error" });
});

// Start listening — add try/catch to surface synchronous throw
try {
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("[server] failed to start listener:", err);
  // rethrow so ts-node prints stack if needed
  throw err;
}
