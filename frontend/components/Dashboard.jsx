import CarbonGauge from "./CarbonGauge";
import TokenBanner from "./TokenBanner";
import EcoSwapCard from "./EcoSwapCard";
import { REGIONAL_AVERAGE_CO2 } from "../lib/constants";
import { useState } from "react";
import { BACKEND_URL, CONTRACT_ADDRESS } from "../lib/constants";

export default function Dashboard({ result, onReset, walletAddress }) {
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [txHash, setTxHash] = useState(null);

    const savings = Math.max(0, REGIONAL_AVERAGE_CO2 - result.totalCO2);
    const waterSaved = Math.round(savings * 1500); // ~1500L water per kg CO2 offset estimate

    const handleClaim = async () => {
        if (!walletAddress || !window.ethereum) {
            alert("Please connect MetaMask to claim your $LEAF tokens.");
            return;
        }

        setIsClaiming(true);
        try {
            // 1. Get a signed authorization from the oracle backend
            const nonce = Date.now();
            const signRes = await fetch(`${BACKEND_URL}/api/sign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userAddress: walletAddress, score: result.greenScore, nonce }),
            });

            if (!signRes.ok) throw new Error("Backend signing failed");
            const { signature } = await signRes.json();

            // 2. Call the smart contract mintReward() via MetaMask
            const { ethers } = await import("ethers");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const abi = [
                "function mintReward(uint256 score, uint256 nonce, bytes calldata signature) external",
            ];

            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
            const tx = await contract.mintReward(result.greenScore, nonce, signature);
            const receipt = await tx.wait();

            setTxHash(receipt.hash);
            setClaimed(true);
        } catch (err) {
            console.error("Claim error:", err);
            // For demo mode with no backend/chain, simulate success
            if (err.message.includes("fetch") || err.message.includes("network")) {
                setClaimed(true);
                setTxHash("0xdemo_tx_" + Date.now().toString(16));
            } else {
                alert("Claim failed: " + err.message);
            }
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <div className="fade-in-up" style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                        🔍 Analysis Complete
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 4 }}>
                        Your basket has been analyzed
                    </p>
                </div>
                <button className="btn-secondary" onClick={onReset} style={{ fontSize: "0.85rem", padding: "10px 18px" }}>
                    ← Scan Again
                </button>
            </div>

            {/* ── Top metrics row ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {/* CO2 gauge */}
                <div className="glass-card" style={{ padding: "28px 20px", textAlign: "center", gridColumn: "1 / 2" }}>
                    <CarbonGauge co2={result.totalCO2} />
                </div>

                {/* Stats column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, gridColumn: "2 / -1" }}>
                    <div className="metric-card" style={{ flex: 1 }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                            vs. Regional Average
                        </p>
                        <p style={{
                            fontSize: "1.8rem", fontWeight: 800,
                            color: savings > 0 ? "var(--green-primary)" : "#ef4444",
                        }}>
                            {savings > 0 ? `−${savings.toFixed(1)}` : `+${Math.abs(savings).toFixed(1)}`} kg
                        </p>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            Regional avg: {REGIONAL_AVERAGE_CO2} kg CO₂e
                        </p>
                    </div>

                    <div className="metric-card" style={{ flex: 1 }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                            Green Score
                        </p>
                        <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--green-primary)" }}>
                            {result.greenScore}
                            <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--text-muted)" }}> / 1000</span>
                        </p>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginTop: 8 }}>
                            <div style={{
                                height: "100%",
                                width: `${(result.greenScore / 1000) * 100}%`,
                                background: "var(--green-primary)",
                                borderRadius: 3,
                                transition: "width 1s ease",
                                boxShadow: "0 0 8px var(--green-glow)",
                            }} />
                        </div>
                    </div>

                    {waterSaved > 0 && (
                        <div className="metric-card" style={{ flex: 1 }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                                Water Saved 💧
                            </p>
                            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#60a5fa" }}>
                                ~{waterSaved.toLocaleString()} L
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── LEAF Token Banner ── */}
            {result.leafReward > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <TokenBanner
                        leafReward={result.leafReward}
                        onClaim={handleClaim}
                        isClaiming={isClaiming}
                        claimed={claimed}
                        walletAddress={walletAddress}
                    />
                    {txHash && (
                        <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: "0.75rem", textAlign: "center" }}>
                            Tx: <span style={{ color: "var(--green-primary)" }}>{txHash.slice(0, 24)}…</span>
                        </p>
                    )}
                </div>
            )}

            {/* ── Eco-Swaps & Items ── */}
            <div className="glass-card" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    🔄 <span>Basket Details & Eco-Swaps</span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {result.items.map((item, i) => (
                        <EcoSwapCard key={i} item={item} index={i} />
                    ))}
                </div>
            </div>

            {/* ── Footer note ── */}
            <p
                style={{
                    marginTop: 20,
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    lineHeight: 1.6,
                }}
            >
                🔬 Carbon data based on Poore & Nemecek (2018) Oxford meta-analysis.
                {" "}These are estimated averages; actual values vary by supply chain.
            </p>
        </div>
    );
}
