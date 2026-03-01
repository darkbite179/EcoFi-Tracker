import { useEffect, useRef } from "react";

/**
 * Animated SVG arc gauge showing total CO2 footprint
 * Red end = bad, transitions toward green as CO2 is low
 */
export default function CarbonGauge({ co2, maxCO2 = 40 }) {
    const ratio = Math.min(co2 / maxCO2, 1);

    // SVG arc params
    const r = 70;
    const cx = 90;
    const cy = 90;
    const sweep = 220; // degrees of arc
    const circumference = (sweep / 360) * 2 * Math.PI * r;
    const dashOffset = circumference * (1 - ratio);

    // Color interpolation: low CO2 = green, high CO2 = red/amber
    const hue = Math.max(0, 120 - ratio * 120); // 120 (green) → 0 (red)
    const arcColor = `hsl(${hue}, 80%, 55%)`;

    const startAngle = -110;
    const endAngle = startAngle + sweep;

    function polarToCart(angleDeg, radius) {
        const rad = ((angleDeg - 90) * Math.PI) / 180;
        return {
            x: cx + radius * Math.cos(rad),
            y: cy + radius * Math.sin(rad),
        };
    }

    function arcPath(start, end, radius) {
        const s = polarToCart(start, radius);
        const e = polarToCart(end, radius);
        const large = end - start > 180 ? 1 : 0;
        return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
    }

    return (
        <div style={{ textAlign: "center" }}>
            <svg width={180} height={160} viewBox="0 0 180 160" style={{ overflow: "visible" }}>
                {/* Track */}
                <path
                    d={arcPath(startAngle, endAngle, r)}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={14}
                    strokeLinecap="round"
                />
                {/* Animated fill */}
                <path
                    d={arcPath(startAngle, endAngle, r)}
                    fill="none"
                    stroke={arcColor}
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{
                        transition: "stroke-dashoffset 1.5s ease, stroke 1.5s ease",
                        filter: `drop-shadow(0 0 8px ${arcColor}80)`,
                    }}
                />
                {/* Center text */}
                <text
                    x={cx}
                    y={cy - 4}
                    textAnchor="middle"
                    fill={arcColor}
                    fontSize={26}
                    fontWeight={700}
                    fontFamily="Space Grotesk, sans-serif"
                    style={{ filter: `drop-shadow(0 0 6px ${arcColor}80)` }}
                >
                    {co2}
                </text>
                <text
                    x={cx}
                    y={cy + 18}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.45)"
                    fontSize={11}
                    fontFamily="Space Grotesk, sans-serif"
                    fontWeight={500}
                >
                    kg CO₂e
                </text>
                {/* Labels */}
                <text x={polarToCart(startAngle + 4, r + 20).x} y={polarToCart(startAngle + 4, r + 20).y}
                    fill="rgba(255,255,255,0.3)" fontSize={10} textAnchor="middle" fontFamily="Space Grotesk, sans-serif">0</text>
                <text x={polarToCart(endAngle - 4, r + 20).x} y={polarToCart(endAngle - 4, r + 20).y}
                    fill="rgba(255,255,255,0.3)" fontSize={10} textAnchor="middle" fontFamily="Space Grotesk, sans-serif">{maxCO2}</text>
            </svg>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: -8 }}>
                Total Basket Footprint
            </p>
        </div>
    );
}
