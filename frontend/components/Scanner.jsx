import { useRef, useState } from "react";

const PRESETS = [
    { id: "bad", label: "🥩 High Carbon Basket", emoji: "🔴" },
    { id: "average", label: "🍗 Average Basket", emoji: "🟡" },
    { id: "green", label: "🌿 Green Champion Basket", emoji: "🟢" },
];

export default function Scanner({ onAnalyze }) {
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [receiptText, setReceiptText] = useState("");
    const [dragging, setDragging] = useState(false);
    const fileRef = useRef(null);

    const handleFileRead = (file) => {
        const reader = new FileReader();
        reader.onload = () => setReceiptText(reader.result);
        reader.readAsText(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileRead(file);
    };

    const handleAnalyzeClick = () => {
        if (!selectedPreset && !receiptText.trim()) return;
        onAnalyze?.({ preset: selectedPreset, receiptText });
    };

    const canAnalyze = selectedPreset || receiptText.trim().length > 0;

    return (
        <div
            className="glass-card fade-in-up"
            style={{ padding: "40px", maxWidth: 640, margin: "0 auto", width: "100%" }}
        >
            {/* ── Header ── */}
            <div style={{ marginBottom: 32, textAlign: "center" }}>
                <div style={{ fontSize: "2.8rem", marginBottom: 12 }}>🧾</div>
                <h2
                    style={{
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 8,
                    }}
                >
                    Scan Your Receipt
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Earn{" "}
                    <span style={{ color: "var(--green-primary)", fontWeight: 600 }}>$LEAF tokens</span> by
                    making greener grocery choices
                </p>
            </div>

            {/* ── Demo Preset Selector ── */}
            <div style={{ marginBottom: 28 }}>
                <p
                    style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 12,
                    }}
                >
                    Quick Demo — Pick a Receipt Type
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {PRESETS.map((p) => (
                        <button
                            key={p.id}
                            className={`preset-btn ${selectedPreset === p.id ? "selected" : ""}`}
                            onClick={() => {
                                setSelectedPreset(p.id);
                                setReceiptText("");
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Divider ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                }}
            >
                <div style={{ flex: 1, height: 1, background: "var(--border-card)" }} />
                OR PASTE / UPLOAD RECEIPT TEXT
                <div style={{ flex: 1, height: 1, background: "var(--border-card)" }} />
            </div>

            {/* ── Drop zone ── */}
            <div
                className={`drop-zone ${dragging ? "active" : ""}`}
                style={{
                    padding: "24px",
                    marginBottom: 24,
                    cursor: "pointer",
                    textAlign: "center",
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                <input
                    ref={fileRef}
                    type="file"
                    accept=".txt"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileRead(e.target.files[0])}
                />
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📁</div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Drop a .txt receipt file or{" "}
                    <span style={{ color: "var(--green-primary)", fontWeight: 600 }}>click to browse</span>
                </p>
            </div>

            {/* ── Text paste area ── */}
            <textarea
                value={receiptText}
                onChange={(e) => { setReceiptText(e.target.value); setSelectedPreset(null); }}
                placeholder={"Paste raw receipt text here…\ne.g. ORG BF 1LB  $12.99\nWHL MLK 2L     $3.49"}
                rows={5}
                style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-card)",
                    borderRadius: 12,
                    color: "var(--text-primary)",
                    fontFamily: "'Space Grotesk', monospace",
                    fontSize: "0.85rem",
                    padding: "14px 16px",
                    resize: "vertical",
                    outline: "none",
                    marginBottom: 24,
                    lineHeight: 1.7,
                }}
            />

            {/* ── CTA ── */}
            <button
                className="btn-primary"
                style={{ width: "100%", padding: "16px", fontSize: "1rem", borderRadius: 14 }}
                disabled={!canAnalyze}
                onClick={handleAnalyzeClick}
            >
                {canAnalyze ? "🔍  Scan & Analyze Receipt" : "Select a preset or paste your receipt"}
            </button>

            {/* ── Footer note ── */}
            <p
                style={{
                    marginTop: 16,
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                }}
            >
                🔒 Receipt data is processed locally. Nothing is stored.
            </p>
        </div>
    );
}
