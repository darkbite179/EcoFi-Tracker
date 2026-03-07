const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const { signMintAuthorization } = require("../utils/signer");

const router = express.Router();

// ─── Gemini AI Client ─────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let ai = null;
if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log("✅ Gemini AI initialized (model: gemini-2.5-flash)");
} else {
    console.warn("⚠️  GEMINI_API_KEY not set — will use mock data for receipt parsing");
}

// ─── Carbon Database ──────────────────────────────────────────────────────────
// Averages from Poore & Nemecek (2018) Oxford meta-analysis, kg CO2e per kg food
const CARBON_DB = {
    beef: 27.0,
    lamb: 26.0,
    mutton: 26.0,
    cheese: 13.5,
    pork: 7.6,
    chicken: 6.9,
    turkey: 6.0,
    fish: 6.0,
    eggs: 4.5,
    dairy_milk: 3.2,
    almond_milk: 0.7,
    oat_milk: 0.9,
    soy_milk: 0.9,
    rice: 2.7,
    bread: 1.4,
    pasta: 1.7,
    potato: 0.5,
    tomato: 1.4,
    apple: 0.4,
    banana: 0.9,
    avocado: 2.5,
    lentils: 0.9,
    tofu: 3.0,
    chocolate: 18.7,
    coffee: 17.0,
    nuts: 2.3,
    generic_grocery: 2.0,   // fallback for unidentified items
};

// ─── Mock Receipt Pre-sets ────────────────────────────────────────────────────
const MOCK_RECEIPTS = {
    bad: [
        { item: "Beef Mince 1kg", category: "beef", quantity: 1.0, isGreen: false, leafReward: 0 },
        { item: "Cheddar Cheese 500g", category: "cheese", quantity: 0.5, isGreen: false, leafReward: 0 },
        { item: "Lamb Chops 800g", category: "lamb", quantity: 0.8, isGreen: false, leafReward: 0 },
        { item: "Whole Milk 2L", category: "dairy_milk", quantity: 2.0, isGreen: false, leafReward: 0 },
        { item: "Chocolate Bar 200g", category: "chocolate", quantity: 0.2, isGreen: false, leafReward: 0 },
    ],
    average: [
        { item: "Chicken Breast 500g", category: "chicken", quantity: 0.5, isGreen: false, leafReward: 0 },
        { item: "Brown Rice 1kg", category: "rice", quantity: 1.0, isGreen: false, leafReward: 0 },
        { item: "Whole Milk 1L", category: "dairy_milk", quantity: 1.0, isGreen: false, leafReward: 0 },
        { item: "Bananas 500g", category: "banana", quantity: 0.5, isGreen: true, leafReward: 5 },
        { item: "Pasta 500g", category: "pasta", quantity: 0.5, isGreen: false, leafReward: 0 },
    ],
    green: [
        { item: "Oat Milk 1L (Brand B)", category: "oat_milk", quantity: 1.0, isGreen: true, leafReward: 15 },
        { item: "Organic Lentils 500g", category: "lentils", quantity: 0.5, isGreen: true, leafReward: 20 },
        { item: "Local Apples 1kg", category: "apple", quantity: 1.0, isGreen: true, leafReward: 10 },
        { item: "Organic Tofu 400g", category: "tofu", quantity: 0.4, isGreen: true, leafReward: 10 },
        { item: "Sourdough Bread 400g", category: "bread", quantity: 0.4, isGreen: true, leafReward: 5 },
    ],
};

// Regional average basket footprint (kg CO2e) — used for green score calculation
const REGIONAL_AVERAGE_CO2 = 14.0;

// ─── Gemini AI Receipt Parser ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a grocery receipt parser for an environmental impact app called EcoFi Tracker.
Extract food items from the raw receipt text provided.
Return ONLY a valid JSON array. No explanation, no markdown fences, no backticks, just raw JSON.

Each item must have:
{
  "item": "Human-readable item name with quantity",
  "category": "one of: beef, lamb, mutton, chicken, pork, turkey, fish, eggs, dairy_milk, almond_milk, oat_milk, soy_milk, rice, bread, pasta, potato, tomato, apple, banana, avocado, lentils, tofu, chocolate, coffee, nuts, cheese, generic_grocery",
  "quantity": <estimated kilograms as a decimal number>,
  "isGreen": <true if this is a sustainable/eco-friendly choice vs conventional alternative, false otherwise>
}

Rules:
- For liquids like milk, 1 liter ≈ 1 kg
- For eggs, 1 dozen ≈ 0.7 kg
- If an item is ambiguous, use "generic_grocery" category
- Never include non-food items (bags, receipts, tax)
- "Organic", "local", "free-range" items should have isGreen: true
- Plant-based milks (oat, soy, almond) are always isGreen: true
- Lentils, tofu, and beans are always isGreen: true
- Mark beef, lamb, and mutton as isGreen: false`;

async function parseReceiptWithGemini(rawText) {
    if (!ai) {
        console.warn("⚠️  Gemini not configured, using mock data");
        return null;
    }

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`🤖 Sending receipt to Gemini AI... (attempt ${attempt}/${MAX_RETRIES})`);

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `${SYSTEM_PROMPT}\n\nRaw receipt text:\n${rawText}`,
            });

            let jsonStr = response.text.trim();

            // Strip markdown code fences if Gemini wraps it
            if (jsonStr.startsWith("```")) {
                jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
            }

            const parsed = JSON.parse(jsonStr);
            console.log(`✅ Gemini parsed ${parsed.length} items from receipt`);
            return parsed;
        } catch (err) {
            const isRateLimit = err.message && (err.message.includes("429") || err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED"));

            if (isRateLimit && attempt < MAX_RETRIES) {
                const waitSec = attempt * 5; // 5s, 10s backoff
                console.warn(`⏳ Rate limited, waiting ${waitSec}s before retry...`);
                await new Promise(r => setTimeout(r, waitSec * 1000));
            } else {
                console.error("❌ Gemini parsing failed:", err.message);
                return null; // caller will use mock
            }
        }
    }
    return null;
}

// ─── Score Calculator ─────────────────────────────────────────────────────────
function calculateScore(items) {
    let totalCO2 = 0;
    let leafReward = 0;

    const enrichedItems = items.map((item) => {
        const co2PerKg = CARBON_DB[item.category] ?? CARBON_DB.generic_grocery;
        const qty = item.quantity ?? 1.0;
        const itemCO2 = co2PerKg * qty;
        totalCO2 += itemCO2;

        // Reward items already flagged as green, or items with low CO2 intensity
        const isGreen = item.isGreen || co2PerKg < 2.0;
        const reward = item.leafReward ?? (isGreen ? Math.round(10 / co2PerKg) : 0);
        leafReward += reward;

        // Eco-swap suggestion for high-impact items
        let swap = null;
        let swapSavings = 0;
        let swapLeaf = 0;
        if (item.category === "beef" || item.category === "lamb" || item.category === "mutton") {
            swapSavings = parseFloat((itemCO2 - CARBON_DB.chicken * qty).toFixed(1));
            swap = "Chicken or Lentils";
            swapLeaf = 40;
        } else if (item.category === "dairy_milk") {
            swapSavings = parseFloat((itemCO2 - CARBON_DB.oat_milk * qty).toFixed(1));
            swap = "Oat Milk (Brand B)";
            swapLeaf = 15;
        } else if (item.category === "cheese") {
            swapSavings = parseFloat((itemCO2 - CARBON_DB.tofu * qty).toFixed(1));
            swap = "Tofu (reduced-fat)";
            swapLeaf = 10;
        }

        return {
            item: item.item,
            co2: parseFloat(itemCO2.toFixed(2)),
            isGreen,
            leafReward: reward,
            swap,
            swapSavings,
        };
    });

    const vsAverage = parseFloat((totalCO2 - REGIONAL_AVERAGE_CO2).toFixed(1));
    const greenScore = Math.min(1000, Math.max(0, Math.round(leafReward + Math.max(0, REGIONAL_AVERAGE_CO2 - totalCO2) * 3)));

    return {
        totalCO2: parseFloat(totalCO2.toFixed(1)),
        vsAverage,
        greenScore,
        leafReward,
        items: enrichedItems,
    };
}

// ─── POST /api/analyze ────────────────────────────────────────────────────────
router.post("/analyze", async (req, res) => {
    const { receiptText, mockPreset } = req.body;

    try {
        let rawItems;

        if (mockPreset && MOCK_RECEIPTS[mockPreset]) {
            // Hackathon demo mode: use hardcoded presets
            console.log(`📋 Using mock preset: "${mockPreset}"`);
            rawItems = MOCK_RECEIPTS[mockPreset];
        } else if (receiptText) {
            // Real AI-powered parsing with Gemini
            console.log(`📄 Parsing receipt text (${receiptText.length} chars)...`);
            const parsed = await parseReceiptWithGemini(receiptText);
            rawItems = parsed ?? MOCK_RECEIPTS.average; // graceful fallback
        } else {
            return res.status(400).json({ error: "Provide either receiptText or mockPreset (bad|average|green)" });
        }

        const result = calculateScore(rawItems);
        console.log(`📊 Analysis: ${result.totalCO2}kg CO₂, score=${result.greenScore}, reward=${result.leafReward} $LEAF`);

        res.json(result);
    } catch (err) {
        console.error("❌ /api/analyze error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/sign ───────────────────────────────────────────────────────────
router.post("/sign", async (req, res) => {
    const { userAddress, score, nonce } = req.body;

    if (!userAddress || score === undefined || nonce === undefined) {
        return res.status(400).json({ error: "Required: userAddress, score, nonce" });
    }

    if (score <= 0 || score > 1000) {
        return res.status(400).json({ error: "Score must be between 1 and 1000" });
    }

    try {
        const { signature, signer } = await signMintAuthorization(userAddress, score, nonce);
        res.json({ signature, signer, userAddress, score, nonce });
    } catch (err) {
        console.error("❌ /api/sign error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
