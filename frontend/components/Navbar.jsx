import { useState } from "react";

export default function Navbar({ walletAddress, onConnect, leafBalance }) {
    const [connecting, setConnecting] = useState(false);

    const handleConnect = async () => {
        setConnecting(true);
        await onConnect?.();
        setConnecting(false);
    };

    const shortAddress = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : null;

    return (
        <nav
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                background: "rgba(8, 13, 8, 0.85)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <div
                style={{
                    maxWidth: 1100,
                    margin: "0 auto",
                    padding: "0 24px",
                    height: 68,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* ── Logo ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <LeafIcon size={28} />
                    <span
                        style={{
                            fontSize: "1.3rem",
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #14d214, #0aa50a)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        EcoFi
                    </span>
                    <span
                        style={{
                            fontSize: "1.3rem",
                            fontWeight: 300,
                            color: "var(--text-secondary)",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Tracker
                    </span>
                </div>

                {/* ── Right side ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {walletAddress && (
                        <div
                            className="metric-card"
                            style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}
                        >
                            <LeafIcon size={14} />
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--green-primary)" }}>
                                {leafBalance ?? "0"} $LEAF
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className={walletAddress ? "btn-secondary" : "btn-primary"}
                        style={{ padding: "10px 20px", fontSize: "0.875rem" }}
                    >
                        {connecting ? (
                            "Connecting…"
                        ) : walletAddress ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span
                                    style={{
                                        width: 8, height: 8, borderRadius: "50%",
                                        background: "var(--green-primary)",
                                        boxShadow: "0 0 6px var(--green-primary)",
                                        display: "inline-block",
                                    }}
                                />
                                {shortAddress}
                            </span>
                        ) : (
                            "Connect Wallet"
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}

function LeafIcon({ size = 24 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M17 8C8 10 5.9 16.17 3.82 19.34C3.17 20.37 4.3 21.53 5.34 20.88C8.5 18.8 11.5 16.5 17 8Z"
                fill="#14d214"
                opacity="0.9"
            />
            <path
                d="M17 8C21 3 21 3 21 3C21 3 21 7 17 8Z"
                fill="#0aa50a"
            />
            <path
                d="M3.82 19.34C3.82 19.34 8 16 12 12"
                stroke="#14d214"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
            />
        </svg>
    );
}
