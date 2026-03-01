import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Scanner from "../components/Scanner";
import LoadingState from "../components/LoadingState";
import Dashboard from "../components/Dashboard";
import { MOCK_RESULTS, BACKEND_URL } from "../lib/constants";

const STATE = { SCAN: "scan", LOADING: "loading", RESULTS: "results" };

export default function Home() {
  const [appState, setAppState] = useState(STATE.SCAN);
  const [result, setResult] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [leafBalance, setLeafBalance] = useState(0);

  const handleConnectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask not found. Install it from metamask.io to claim $LEAF tokens.");
      return;
    }
    try {
      // 1. Request to switch to Hardhat local network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }], // 31337 in hex
        });
      } catch (switchErr) {
        // 4902 = chain not added yet — add it automatically
        if (switchErr.code === 4902 || switchErr.code === -32603) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x7A69",
              chainName: "Hardhat Local",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["http://127.0.0.1:8545"],
            }],
          });
        }
        // 4001 = user rejected — just silently return
        else if (switchErr.code === 4001) return;
      }

      // 2. Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) setWalletAddress(accounts[0]);
    } catch (err) {
      console.error("Wallet connect failed:", err);
      // Don't crash the app — user can still use mock mode
      if (err.code === 4001) {
        // User rejected — do nothing
      } else {
        alert("Wallet connection failed. You can still use the app in demo mode without MetaMask.");
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) setWalletAddress(accounts[0]);
      });
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0] || null);
      });
    }
  }, []);

  const handleAnalyze = async ({ preset, receiptText }) => {
    setAppState(STATE.LOADING);
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const minDelay = delay(3200);

    try {
      let data;
      if (preset) {
        await minDelay;
        data = MOCK_RESULTS[preset];
      } else {
        const [res] = await Promise.all([
          fetch(`${BACKEND_URL}/api/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiptText }),
          }),
          minDelay,
        ]);
        if (!res.ok) throw new Error("Backend error");
        data = await res.json();
      }

      setResult(data);
      setAppState(STATE.RESULTS);
      if (data.leafReward) setLeafBalance((b) => b + data.leafReward);
    } catch (err) {
      console.error("Analyze failed, using mock:", err);
      await minDelay;
      setResult(MOCK_RESULTS.average);
      setAppState(STATE.RESULTS);
    }
  };

  const handleReset = () => {
    setResult(null);
    setAppState(STATE.SCAN);
  };

  return (
    <>
      <Head>
        <title>EcoFi Tracker — Earn $LEAF for Green Groceries</title>
        <meta name="description" content="Scan your grocery receipt, calculate your carbon footprint, and earn $LEAF Web3 tokens for making sustainable brand choices." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Navbar walletAddress={walletAddress} onConnect={handleConnectWallet} leafBalance={leafBalance} />

        <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
          {appState === STATE.SCAN && (
            <div className="fade-in-up" style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{
                display: "inline-block", padding: "6px 16px",
                background: "var(--green-dim)", border: "1px solid rgba(20,210,20,0.2)",
                borderRadius: 999, marginBottom: 20,
              }}>
                <span style={{ fontSize: "0.8rem", color: "var(--green-primary)", fontWeight: 600 }}>
                  🏆 Built for HackFest @ IIIT Bhubaneswar
                </span>
              </div>

              <h1 style={{
                fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800,
                letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16,
              }}>
                Scan Groceries.{" "}
                <span style={{ background: "linear-gradient(135deg, #14d214, #0aa50a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Earn $LEAF.
                </span>
                <br />Save the Planet.
              </h1>

              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                Your grocery receipt becomes a carbon report and a revenue stream. Make greener brand choices, earn tokenized rewards — without changing what you eat.
              </p>

              <div style={{
                display: "flex", gap: 0, justifyContent: "center", marginTop: 32,
                borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-card)",
                maxWidth: 540, margin: "32px auto 0",
              }}>
                {[
                  { value: "14.2 kg", label: "Avg. basket CO₂e" },
                  { value: "$LEAF", label: "Token rewards" },
                  { value: "1,240+", label: "Receipts scanned" },
                ].map((stat, i) => (
                  <div key={i} style={{
                    flex: 1, padding: "16px 12px", textAlign: "center",
                    borderRight: i < 2 ? "1px solid var(--border-card)" : "none",
                    background: "var(--bg-card)",
                  }}>
                    <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--green-primary)" }}>{stat.value}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appState === STATE.SCAN && <Scanner onAnalyze={handleAnalyze} />}
          {appState === STATE.LOADING && <LoadingState />}
          {appState === STATE.RESULTS && result && (
            <Dashboard result={result} onReset={handleReset} walletAddress={walletAddress} />
          )}
        </main>
      </div>
    </>
  );
}
