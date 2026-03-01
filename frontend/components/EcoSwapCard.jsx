export default function EcoSwapCard({ item, index }) {
    const isGreen = item.isGreen;
    const hasSuggestion = item.suggestion && !isGreen;

    return (
        <div
            className="metric-card fade-in-up"
            style={{
                animationDelay: `${index * 80}ms`,
                borderColor: isGreen ? "rgba(20,210,20,0.15)" : "rgba(255,255,255,0.06)",
                padding: "16px 20px",
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                {/* ── Item info ── */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: "1.1rem" }}>{isGreen ? "🌿" : "⚠️"}</span>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                            {item.item}
                        </span>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span
                            style={{
                                fontSize: "0.78rem",
                                color: "var(--text-muted)",
                                background: "rgba(255,255,255,0.04)",
                                padding: "2px 8px",
                                borderRadius: 6,
                            }}
                        >
                            {item.co2_kg} kg CO₂e
                        </span>
                        <span
                            className={isGreen ? "badge-green" : "badge-red"}
                        >
                            {isGreen ? "✓ Green choice" : "High impact"}
                        </span>
                    </div>

                    {/* ── Swap suggestion ── */}
                    {hasSuggestion && (
                        <div
                            style={{
                                marginTop: 10,
                                padding: "10px 14px",
                                background: "rgba(20,210,20,0.05)",
                                border: "1px solid rgba(20,210,20,0.12)",
                                borderRadius: 10,
                            }}
                        >
                            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                <span style={{ color: "var(--green-primary)", fontWeight: 600 }}>💡 Swap to:</span>{" "}
                                {item.suggestion.swapTo}
                            </p>
                            <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                    🌍 Save {item.suggestion.co2Saved.toFixed(1)} kg CO₂e
                                </span>
                                <span style={{ fontSize: "0.75rem", color: "var(--green-primary)", fontWeight: 600 }}>
                                    +{item.suggestion.bonusLeaf} $LEAF
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── LEAF reward badge ── */}
                {item.leafReward > 0 && (
                    <div
                        style={{
                            background: "var(--green-dim)",
                            border: "1px solid rgba(20,210,20,0.25)",
                            borderRadius: 10,
                            padding: "8px 12px",
                            textAlign: "center",
                            minWidth: 68,
                            flexShrink: 0,
                        }}
                    >
                        <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--green-primary)" }}>
                            +{item.leafReward}
                        </p>
                        <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600 }}>$LEAF</p>
                    </div>
                )}
            </div>
        </div>
    );
}
