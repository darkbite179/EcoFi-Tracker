const http = require("http");
const data = JSON.stringify({
    receiptText: "1kg Chicken Breast, 2L Whole Milk, 500g Organic Lentils, 1kg Basmati Rice, 6 Free Range Eggs, 1L Oat Milk, 200g Dark Chocolate"
});

const r = http.request({
    hostname: "localhost", port: 3001, path: "/api/analyze",
    method: "POST", headers: { "Content-Type": "application/json", "Content-Length": data.length }
}, (res) => {
    let b = "";
    res.on("data", (c) => b += c);
    res.on("end", () => {
        const j = JSON.parse(b);
        console.log("\n=== GEMINI AI RECEIPT ANALYSIS ===");
        console.log("Total CO2:", j.totalCO2, "kg");
        console.log("vs Average:", j.vsAverage, "kg");
        console.log("Green Score:", j.greenScore + "/1000");
        console.log("$LEAF Reward:", j.leafReward);
        console.log("\nItems:");
        j.items.forEach((i, n) => {
            console.log(`  ${n + 1}. ${i.item} — ${i.co2} kg CO2 ${i.isGreen ? "🌿" : "❌"}${i.swap ? " → Swap: " + i.swap : ""}`);
        });
        console.log("=================================\n");
    });
});
r.on("error", (e) => console.error(e.message));
r.write(data);
r.end();
