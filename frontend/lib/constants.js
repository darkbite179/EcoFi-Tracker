// ─── Mock Receipt Pre-sets ────────────────────────────────────────────────────
// These match the backend MOCK_RECEIPTS exactly. Used for instant demo without
// needing the backend to be running.

export const MOCK_RESULTS = {
    bad: {
        totalCO2: 32.4,
        leafReward: 0,
        greenScore: 0,
        savedCO2: 0,
        isGreenBasket: false,
        items: [
            { item: "Beef Mince 1kg", category: "beef", co2_kg: 27.0, isGreen: false, leafReward: 0, suggestion: { swapTo: "Chicken or Lentils", co2Saved: 20.1, bonusLeaf: 40 } },
            { item: "Cheddar Cheese 500g", category: "cheese", co2_kg: 6.75, isGreen: false, leafReward: 0, suggestion: { swapTo: "Tofu (reduced-fat)", co2Saved: 4.25, bonusLeaf: 10 } },
            { item: "Whole Milk 2L", category: "dairy_milk", co2_kg: 6.4, isGreen: false, leafReward: 0, suggestion: { swapTo: "Oat Milk (Brand B)", co2Saved: 4.6, bonusLeaf: 15 } },
            { item: "Lamb Chops 800g", category: "lamb", co2_kg: 20.8, isGreen: false, leafReward: 0, suggestion: { swapTo: "Chicken or Lentils", co2Saved: 15.3, bonusLeaf: 40 } },
            { item: "Chocolate Bar 200g", category: "chocolate", co2_kg: 3.74, isGreen: false, leafReward: 0, suggestion: null },
        ],
    },
    average: {
        totalCO2: 14.2,
        leafReward: 5,
        greenScore: 5,
        savedCO2: 0,
        isGreenBasket: false,
        items: [
            { item: "Chicken Breast 500g", category: "chicken", co2_kg: 3.45, isGreen: false, leafReward: 0, suggestion: { swapTo: "Oat Milk (Brand B)", co2Saved: 1.1, bonusLeaf: 15 } },
            { item: "Brown Rice 1kg", category: "rice", co2_kg: 2.7, isGreen: false, leafReward: 0, suggestion: null },
            { item: "Whole Milk 1L", category: "dairy_milk", co2_kg: 3.2, isGreen: false, leafReward: 0, suggestion: { swapTo: "Oat Milk (Brand B)", co2Saved: 2.3, bonusLeaf: 15 } },
            { item: "Bananas 500g", category: "banana", co2_kg: 0.45, isGreen: true, leafReward: 5, suggestion: null },
            { item: "Pasta 500g", category: "pasta", co2_kg: 0.85, isGreen: false, leafReward: 0, suggestion: null },
        ],
    },
    green: {
        totalCO2: 4.3,
        leafReward: 60,
        greenScore: 89,
        savedCO2: 9.7,
        isGreenBasket: true,
        items: [
            { item: "Oat Milk 1L (Brand B)", category: "oat_milk", co2_kg: 0.9, isGreen: true, leafReward: 15, suggestion: null },
            { item: "Organic Lentils 500g", category: "lentils", co2_kg: 0.45, isGreen: true, leafReward: 20, suggestion: null },
            { item: "Local Apples 1kg", category: "apple", co2_kg: 0.4, isGreen: true, leafReward: 10, suggestion: null },
            { item: "Organic Tofu 400g", category: "tofu", co2_kg: 1.2, isGreen: true, leafReward: 10, suggestion: null },
            { item: "Sourdough Bread 400g", category: "bread", co2_kg: 0.56, isGreen: true, leafReward: 5, suggestion: null },
        ],
    },
};

export const REGIONAL_AVERAGE_CO2 = 14.0;
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://ecofi-tracker.onrender.com";
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xE49Dd0f38d5C1Bb803Ac4f3D6114e977B6d684fd";
export const CHAIN_ID_LOCAL = 31337;
