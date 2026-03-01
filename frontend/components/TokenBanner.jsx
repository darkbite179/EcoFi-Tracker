export default function TokenBanner({ leafReward, onClaim, isClaiming, claimed, walletAddress }) {
    if (leafReward === 0) return null;

    return (
        <div className="leaf-banner" style={{ padding: "28px 32px" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 20,
                }}
            >
                {/* ── Left: reward info ── */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <span style={{ fontSize: "2rem" }}>🍃</span>
                        <span
                            className="text-glow"
                            style={{
                                fontSize: "2.4rem",
                                fontWeight: 800,
                                color: "var(--green-primary)",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            +{leafReward} $LEAF
                        </span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                        {claimed
                            ? "✅ Tokens successfully minted to your wallet!"
                            : "You earned rewards for making eco-friendly choices"}
                    </p>
                </div>

                {/* ── Right: claim button ── */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    {!claimed ? (
                        <button
                            className="btn-primary"
                            onClick={onClaim}
                            disabled={isClaiming || !walletAddress}
                            style={{ minWidth: 160, padding: "14px 24px" }}
                        >
                            {isClaiming ? (
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <svg className="spinner" width={16} height={16} viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="6" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
                                        <path d="M8 2 A6 6 0 0 1 14 8" stroke="#050f05" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Minting…
                                </span>
                            ) : (
                                "⛓️  Claim to Wallet"
                            )}
                        </button>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                color: "var(--green-primary)",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                            }}
                        >
                            <span style={{ fontSize: "1.2rem" }}>✅</span> Claimed!
                        </div>
                    )}

                    {!walletAddress && !claimed && (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Connect your wallet to claim
                        </p>
                    )}

                    {/* Uniswap swap hint */}
                    {claimed && (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            💱 Swap for USDC on Uniswap (testnet)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
