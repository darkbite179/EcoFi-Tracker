require("dotenv").config();
const express = require("express");
const cors = require("cors");

const analyzeRouter = require("./routes/analyze");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", analyzeRouter);

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "EcoFi Oracle Backend", ts: Date.now() });
});

// 404 catch-all
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
    console.error("❌ Unhandled error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🌿 EcoFi Oracle Backend running on http://localhost:${PORT}`);
    console.log(`   POST /api/analyze  → Parse receipt text via Ollama (or mock)`);
    console.log(`   POST /api/sign     → Sign a green score for on-chain minting\n`);
});
