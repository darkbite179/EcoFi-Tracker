import { useEffect, useState } from "react";

const STEPS = [
    { icon: "🧾", text: "Extracting items from receipt…" },
    { icon: "🌍", text: "Calculating carbon footprint…" },
    { icon: "⛓️", text: "Preparing blockchain reward…" },
    { icon: "🍃", text: "Minting $LEAF tokens…" },
];

export default function LoadingState() {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % STEPS.length);
        }, 900);
        return () => clearInterval(interval);
    }, []);

    const current = STEPS[stepIndex];

    return (
        <div
            className="glass-card fade-in-up"
            style={{
                padding: "60px 40px",
                maxWidth: 480,
                margin: "0 auto",
                textAlign: "center",
            }}
        >
            {/* ── Spinner ── */}
            <div style={{ position: "relative", display: "inline-flex", marginBottom: 32 }}>
                <svg
                    className="spinner"
                    width={72}
                    height={72}
                    viewBox="0 0 72 72"
                    fill="none"
                >
                    <circle
                        cx="36" cy="36" r="30"
                        stroke="rgba(20,210,20,0.12)"
                        strokeWidth="6"
                    />
                    <path
                        d="M36 6 A30 30 0 0 1 66 36"
                        stroke="#14d214"
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                </svg>
                {/* Icon in the center */}
                <span
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                    }}
                >
                    {current.icon}
                </span>
            </div>

            {/* ── Step text ── */}
            <p
                key={stepIndex}
                className="fade-in-up"
                style={{
                    color: "var(--green-primary)",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    marginBottom: 12,
                    minHeight: 28,
                }}
            >
                {current.text}
            </p>

            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                This usually takes a few seconds…
            </p>

            {/* ── Progress dots ── */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 28 }}>
                {STEPS.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: i === stepIndex ? 20 : 6,
                            height: 6,
                            borderRadius: 3,
                            background: i === stepIndex ? "var(--green-primary)" : "var(--text-muted)",
                            transition: "all 0.3s ease",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
