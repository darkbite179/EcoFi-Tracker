const express = require("express");
const axios = require("axios");
const { signMintAuthorization } = require("../utils/signer");

const router = express.Router();

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

// ─── Ollama LLM Parser ────────────────────────────────────────────────────────
async function parseReceiptWithOllama(rawText) {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

    const systemPrompt = `You are a grocery receipt parser for an environmental impact app.
Extract food items from the raw receipt text provided.
Return ONLY a valid JSON array. No explanation, no markdown fences, just raw JSON.

Each item must have:
{
  "item": "Human-readable item name",
  "category": "one of: beef, lamb, chicken, pork, turkey, fish, eggs, dairy_milk, almond_milk, oat_milk, soy_milk, rice, bread, pasta, potato, tomato, apple, banana, avocado, lentils, tofu, chocolate, coffee, nuts, generic_grocery",
  "quantity": <estimated kilograms as a number>,
  "isGreen": <true if this is a sustainable choice vs conventional alternative, false otherwise>
}

If an item is ambiguous, use "generic_grocery". Never include non-food items.`;

    try {
        const response = await axios.post(
            `${ollamaUrl}/api/generate`,
            {
                model: process.env.OLLAMA_MODEL || "llama3:8b",
                prompt: `${systemPrompt}\n\nRaw receipt text:\n${rawText}`,
                stream: false,
                options: { temperature: 0.1 },
            },
            { timeout: 30000 }
        );

        const jsonStr = response.data.response.trim();
        return JSON.parse(jsonStr);
    } catch (err) {
        console.warn("⚠️  Ollama unavailable, falling back to mock data:", err.message);
        return null; // caller will use mock
    }
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
        let suggestion = null;
        if (item.category === "beef" || item.category === "lamb" || item.category === "mutton") {
            suggestion = { swapTo: "Chicken or Lentils", co2Saved: itemCO2 - (CARBON_DB.chicken * qty), bonusLeaf: 40 };
        } else if (item.category === "dairy_milk") {
            suggestion = { swapTo: "Oat Milk (Brand B)", co2Saved: itemCO2 - (CARBON_DB.oat_milk * qty), bonusLeaf: 15 };
        } else if (item.category === "cheese") {
            suggestion = { swapTo: "Tofu (reduced-fat)", co2Saved: itemCO2 - (CARBON_DB.tofu * qty), bonusLeaf: 10 };
        }

        return { ...item, co2_kg: parseFloat(itemCO2.toFixed(2)), isGreen, leafReward: reward, suggestion };
    });

    const savedVsAverage = Math.max(0, REGIONAL_AVERAGE_CO2 - totalCO2);
    const greenScore = Math.min(1000, Math.round(leafReward + savedVsAverage * 3));

    return {
        items: enrichedItems,
        totalCO2: parseFloat(totalCO2.toFixed(2)),
        leafReward,
        greenScore,
        savedCO2: parseFloat(savedVsAverage.toFixed(2)),
        isGreenBasket: totalCO2 < REGIONAL_AVERAGE_CO2,
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
            // Attempt real Ollama parsing
            const parsed = await parseReceiptWithOllama(receiptText);
            rawItems = parsed ?? MOCK_RECEIPTS.average; // graceful fallback
        } else {
            return res.status(400).json({ error: "Provide either receiptText or mockPreset (bad|average|green)" });
        }

        const result = calculateScore(rawItems);
        console.log(`📊 Analysis complete: ${result.totalCO2}kg CO2, score=${result.greenScore}, reward=${result.leafReward} $LEAF`);

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
