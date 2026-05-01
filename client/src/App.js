import React, { useState } from "react";
import axios from "axios";
import { Player } from "@lottiefiles/react-lottie-player";
import mascotData from "./assets/mascot.json";

// ─── HTML Report Generator ───────────────────────────────────────────────────
function generateHTMLReport(leads, keyword, tone) {
  const now = new Date().toLocaleString();
  const toneEmoji = { friendly: "😊", professional: "💼", aggressive: "🔥" };

  const leadCards = leads
    .map(
      (lead, i) => `
    <div class="lead-card">
      <div class="lead-header">
        <span class="lead-num">#${i + 1}</span>
        <a href="${lead.website}" target="_blank" class="lead-site">🌐 ${lead.website}</a>
        <span class="score-badge" style="background:${lead.scoreColor}22; color:${lead.scoreColor}; border:1px solid ${lead.scoreColor}44">
          ${lead.scoreLabel} &nbsp;·&nbsp; ${lead.score}/100
        </span>
      </div>

      <div class="emails">
        <span class="email-label">📧 Emails:</span>
        ${(lead.allEmails || [lead.email])
          .map((e) => `<span class="email-chip">${e}</span>`)
          .join("")}
      </div>

      <div class="email-body">
        <div class="email-body-header">
          <span>✉️ AI Generated Email &nbsp;<span class="tone-tag">${toneEmoji[lead.tone] || "💼"} ${lead.tone || tone}</span></span>
          <button class="copy-btn" onclick="copyText(this, \`${lead.message.replace(/`/g, "\\`")}\`)">📋 Copy</button>
        </div>
        <p class="email-text">${lead.message.replace(/\n/g, "<br/>")}</p>
      </div>
    </div>
  `
    )
    .join("");

  const hotCount = leads.filter((l) => l.score >= 70).length;
  const warmCount = leads.filter((l) => l.score >= 45 && l.score < 70).length;
  const coldCount = leads.filter((l) => l.score < 45).length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Lead Report — ${keyword}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.08)} 66%{transform:translate(-30px,50px) scale(0.95)} }
    @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-70px,30px) scale(1.1)} 70%{transform:translate(40px,-60px) scale(0.92)} }
    @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(50px,40px) scale(1.05)} }
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#030712;color:#f9fafb;padding:40px 24px;min-height:100vh;overflow-x:hidden}
    .orb { position:fixed; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:-1; }
    .orb1 { width:500px; height:500px; background:radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%); top:-100px; left:-80px; animation:orbFloat1 18s ease-in-out infinite; }
    .orb2 { width:600px; height:600px; background:radial-gradient(circle, rgba(96,165,250,0.14) 0%, transparent 70%); top:30%; right:-150px; animation:orbFloat2 22s ease-in-out infinite; }
    .orb3 { width:450px; height:450px; background:radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%); bottom:-80px; left:30%; animation:orbFloat3 16s ease-in-out infinite; }
    .container{max-width:900px;margin:0 auto}
    h1{font-size:2rem;font-weight:700;color:#34d399;margin-bottom:4px}
    .subtitle{color:#6b7280;font-size:0.9rem;margin-bottom:32px}
    .stats{display:flex;gap:16px;margin-bottom:32px;flex-wrap:wrap}
    .stat-box{background:#111827;border:1px solid #1f2937;border-radius:12px;padding:16px 24px;flex:1;min-width:140px}
    .stat-num{font-size:2rem;font-weight:700}
    .stat-label{font-size:0.8rem;color:#9ca3af;margin-top:4px}
    .lead-card{background:#111827;border:1px solid #1f2937;border-radius:16px;padding:24px;margin-bottom:16px;transition:.2s}
    .lead-card:hover{border-color:#34d39944}
    .lead-header{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
    .lead-num{background:#1f2937;color:#9ca3af;font-size:0.8rem;padding:2px 10px;border-radius:6px;font-weight:600}
    .lead-site{color:#34d399;text-decoration:none;font-weight:500;font-size:0.9rem}
    .lead-site:hover{text-decoration:underline}
    .score-badge{font-size:0.78rem;padding:4px 12px;border-radius:20px;font-weight:600}
    .emails{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:14px}
    .email-label{color:#9ca3af;font-size:0.8rem}
    .email-chip{background:#1e3a5f;color:#60a5fa;font-size:0.75rem;padding:3px 10px;border-radius:6px}
    .email-body{background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px}
    .email-body-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px}
    .email-body-header span{color:#9ca3af;font-size:0.85rem;font-weight:500}
    .tone-tag{background:#1f2937;padding:2px 8px;border-radius:6px;font-size:0.75rem;color:#a78bfa;margin-left:6px}
    .copy-btn{background:#1f2937;color:#34d399;border:1px solid #34d39944;border-radius:8px;padding:6px 14px;font-size:0.8rem;cursor:pointer;font-family:'Inter',sans-serif;transition:.2s}
    .copy-btn:hover{background:#34d39922}
    .copy-btn.copied{color:#a78bfa;border-color:#a78bfa44}
    .email-text{color:#d1d5db;font-size:0.875rem;line-height:1.7;white-space:pre-line}
    footer{text-align:center;color:#374151;font-size:0.8rem;margin-top:48px}
  </style>
</head>
<body>
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="orb orb3"></div>
  <div class="container">
    <h1>🤖 AI Lead Report</h1>
    <p class="subtitle">Keyword: <strong style="color:#f9fafb">${keyword}</strong> &nbsp;·&nbsp; Generated: ${now} &nbsp;·&nbsp; Tone: ${toneEmoji[tone] || "💼"} ${tone}</p>

    <div class="stats">
      <div class="stat-box"><div class="stat-num" style="color:#34d399">${leads.length}</div><div class="stat-label">Total Leads</div></div>
      <div class="stat-box"><div class="stat-num" style="color:#ef4444">${hotCount}</div><div class="stat-label">🔥 Hot Leads (70+)</div></div>
      <div class="stat-box"><div class="stat-num" style="color:#f59e0b">${warmCount}</div><div class="stat-label">⚡ Warm Leads (45–69)</div></div>
      <div class="stat-box"><div class="stat-num" style="color:#60a5fa">${coldCount}</div><div class="stat-label">❄️ Cold Leads (&lt;45)</div></div>
    </div>

    ${leadCards}

    <footer>Generated by AI Lead Generator &nbsp;·&nbsp; ${now}</footer>
  </div>

  <script>
    function copyText(btn, text) {
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
      });
    }
  </script>
</body>
</html>`;
}

// ─── Lottie Configuration ────────────────────────────────────────────────────
const LOTTIE_URL = "https://lottie.host/8251e6b3-6c8d-4f18-971c-4b5f448c347b/4n3m8K8S8H.json";

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [keyword, setKeyword] = useState("");
  const [tone, setTone] = useState("professional");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState({});

  const generateLeads = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setLeads([]);
    try {
      const res = await axios.post("http://localhost:5000/generate-leads", {
        keyword,
        tone,
      });
      setLeads(res.data.results);
    } catch (err) {
      setError("Something went wrong. Make sure server is running.");
    }
    setLoading(false);
  };

  const regenerateEmails = async (newTone) => {
    if (leads.length === 0) return;
    setRegenLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/regenerate-emails", {
        websites: leads.map((l) => l.website),
        tone: newTone,
      });
      setLeads((prev) =>
        prev.map((lead) => {
          const updated = res.data.emails.find((e) => e.website === lead.website);
          return updated ? { ...lead, message: updated.message, tone: newTone } : lead;
        })
      );
    } catch (err) {
      setError("Email regeneration failed. Server running?");
    }
    setRegenLoading(false);
  };

  const handleToneChange = (newTone) => {
    setTone(newTone);
    if (leads.length > 0) {
      regenerateEmails(newTone);
    }
  };

  const copyEmail = (idx, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied((prev) => ({ ...prev, [idx]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [idx]: false })), 2000);
    });
  };

  const openHTMLReport = () => {
    const html = generateHTMLReport(leads, keyword, tone);
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const downloadHTMLReport = () => {
    const html = generateHTMLReport(leads, keyword, tone);
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${keyword.replace(/\s+/g, "-")}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TONES = [
    { value: "friendly", label: "😊 Friendly", desc: "Warm & casual" },
    { value: "professional", label: "💼 Professional", desc: "Formal & polished" },
    { value: "aggressive", label: "🔥 Aggressive", desc: "Bold & urgent" },
  ];

  const S = {
    root: {
      minHeight: "100vh",
      background: "#050810",
      color: "white",
      padding: "40px 24px",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    container: { maxWidth: "920px", margin: "0 auto", position: "relative", zIndex: 1 },
    header: { textAlign: "center", marginBottom: "44px" },
    h1: {
      fontSize: "2.8rem",
      fontWeight: "800",
      background: "linear-gradient(135deg, #34d399 0%, #60a5fa 50%, #a78bfa 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "10px",
      letterSpacing: "-1px",
      lineHeight: 1.1,
    },
    subtitle: { color: "#4b5563", fontSize: "0.95rem", letterSpacing: "0.01em" },
    badge: {
      background: "rgba(52,211,153,0.1)",
      color: "#34d399",
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: "600",
      letterSpacing: "0.05em",
      display: "inline-block",
      marginBottom: "12px",
      border: "1px solid rgba(52,211,153,0.2)",
    },
    panel: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "24px",
      padding: "32px",
      marginBottom: "32px",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
    },
    sectionLabel: {
      color: "#9ca3af",
      fontSize: "0.8rem",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginBottom: "12px",
      display: "block",
    },
    toneRow: { display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" },
    toneBtn: (active) => ({
      flex: 1,
      minWidth: "120px",
      background: active ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${active ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: "14px",
      padding: "11px 16px",
      color: active ? "#34d399" : "#6b7280",
      cursor: "pointer",
      textAlign: "center",
      fontWeight: active ? "600" : "400",
      fontSize: "0.9rem",
      transition: "all 0.25s",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      boxShadow: active ? "0 0 20px rgba(52,211,153,0.1), inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
    }),
    toneBtnDesc: { fontSize: "0.7rem", opacity: 0.6, display: "block", marginTop: "3px" },
    inputRow: { display: "flex", gap: "12px", marginBottom: "32px" },
    input: {
      flex: 1,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "14px",
      padding: "15px 22px",
      color: "white",
      fontSize: "1rem",
      outline: "none",
      fontFamily: "'Inter', sans-serif",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      transition: "border-color 0.2s, box-shadow 0.2s",
    },
    genBtn: (isLoading) => ({
      background: isLoading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #10b981, #059669)",
      color: isLoading ? "#6b7280" : "white",
      border: isLoading ? "1px solid rgba(255,255,255,0.08)" : "none",
      borderRadius: "14px",
      padding: "15px 28px",
      fontWeight: "700",
      fontSize: "1rem",
      cursor: isLoading ? "not-allowed" : "pointer",
      whiteSpace: "nowrap",
      fontFamily: "'Inter', sans-serif",
      boxShadow: isLoading ? "none" : "0 4px 24px rgba(16,185,129,0.35)",
      transition: "all 0.25s",
    }),
    statsBar: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statsLeft: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" },
    statChip: (color) => ({
      background: color + "12",
      color,
      border: `1px solid ${color}28`,
      borderRadius: "20px",
      padding: "5px 14px",
      fontSize: "0.78rem",
      fontWeight: "600",
      backdropFilter: "blur(8px)",
    }),
    htmlBtn: {
      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      padding: "10px 20px",
      fontSize: "0.85rem",
      fontWeight: "600",
      cursor: "pointer",
      fontFamily: "'Inter', sans-serif",
      boxShadow: "0 4px 18px rgba(124,58,237,0.35)",
      transition: "all 0.25s",
    },
    actionBtn: (background, boxShadow) => ({
      background,
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "10px 22px",
      fontSize: "0.85rem",
      fontWeight: "600",
      cursor: "pointer",
      fontFamily: "'Inter', sans-serif",
      boxShadow,
      transition: "all 0.25s",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }),
    card: {
      background: "rgba(255,255,255,0.034)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "24px",
      marginBottom: "14px",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
      transition: "border-color 0.25s, box-shadow 0.25s, transform 0.2s",
    },
    cardHeader: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: "12px",
    },
    leadNum: {
      background: "rgba(255,255,255,0.06)",
      color: "#6b7280",
      fontSize: "0.72rem",
      padding: "3px 10px",
      borderRadius: "6px",
      fontWeight: "700",
      letterSpacing: "0.05em",
    },
    siteLink: {
      color: "#34d399",
      textDecoration: "none",
      fontWeight: "500",
      fontSize: "0.875rem",
    },
    emailsRow: {
      display: "flex",
      gap: "6px",
      flexWrap: "wrap",
      marginBottom: "14px",
      alignItems: "center",
    },
    emailChip: {
      background: "rgba(96,165,250,0.1)",
      color: "#60a5fa",
      fontSize: "0.72rem",
      padding: "3px 10px",
      borderRadius: "6px",
      border: "1px solid rgba(96,165,250,0.15)",
    },
    emailBox: {
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      padding: "16px",
      backdropFilter: "blur(10px)",
    },
    emailBoxHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
      flexWrap: "wrap",
      gap: "8px",
    },
    emailBoxLabel: { color: "#9ca3af", fontSize: "0.82rem", fontWeight: "500" },
    copyBtn: (isCopied) => ({
      background: isCopied ? "rgba(167,139,250,0.12)" : "rgba(52,211,153,0.08)",
      color: isCopied ? "#a78bfa" : "#34d399",
      border: `1px solid ${isCopied ? "rgba(167,139,250,0.3)" : "rgba(52,211,153,0.25)"}`,
      borderRadius: "8px",
      padding: "6px 14px",
      fontSize: "0.78rem",
      cursor: "pointer",
      fontFamily: "'Inter', sans-serif",
      transition: "all 0.2s",
      backdropFilter: "blur(8px)",
    }),
    emailText: {
      color: "#cbd5e1",
      fontSize: "0.875rem",
      lineHeight: "1.75",
      whiteSpace: "pre-line",
      margin: 0,
    },

    /* Loading */
    loadingWrap: {
      textAlign: "center",
      padding: "80px 0",
    },
    loadingText: {
      color: "#64748b",
      fontSize: "1rem",
      marginTop: "8px",
    },
    loadingSubtext: {
      color: "#374151",
      fontSize: "0.85rem",
      marginTop: "8px",
    },

    /* Regen banner */
    regenBanner: {
      background: "rgba(52,211,153,0.06)",
      border: "1px solid rgba(52,211,153,0.2)",
      borderRadius: "14px",
      padding: "14px 20px",
      marginBottom: "16px",
      color: "#34d399",
      fontSize: "0.88rem",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      backdropFilter: "blur(12px)",
    },

    /* Error */
    errorBox: {
      background: "rgba(248,113,113,0.08)",
      border: "1px solid rgba(248,113,113,0.2)",
      borderRadius: "12px",
      padding: "12px 18px",
      color: "#f87171",
      fontSize: "0.88rem",
      marginBottom: "16px",
      backdropFilter: "blur(8px)",
    },
    /* Mascot */
    mascotWrap: {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      pointerEvents: "none",
    },
    speechBubble: {
      background: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "18px",
      padding: "12px 18px",
      marginBottom: "12px",
      maxWidth: "240px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      position: "relative",
      pointerEvents: "auto",
    },
    speechText: {
      color: "#f1f5f9",
      fontSize: "0.85rem",
      lineHeight: "1.5",
      margin: 0,
      fontWeight: "500",
    },
    mascotImg: {
      width: "160px",
      height: "160px",
      cursor: "pointer",
      pointerEvents: "auto",
    },
  };

  return (
    <div className="app-wrapper" style={S.root}>

      <div style={S.container}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div>
            <span style={S.badge}>✦ AI-Powered</span>
          </div>
          <h1 style={S.h1}>
            <span className="gradient-text">AI Lead Generator</span>
          </h1>
          <p style={S.subtitle}>
            Find real leads · Score them intelligently · Generate AI cold emails · Export beautiful reports
          </p>
        </div>

        {/* ── Tone + Input Panel ── */}
        <div style={S.panel}>
          {/* Tone */}
          <p style={S.sectionLabel}>
            Select Email Tone
            {leads.length > 0 && (
              <span style={{ color: "#34d399", marginLeft: "8px", textTransform: "none", fontSize: "0.72rem", fontWeight: "400" }}>
                — switch to regenerate all emails live ✨
              </span>
            )}
          </p>
          <div style={{ ...S.toneRow, marginBottom: "20px" }}>
            {TONES.map((t) => (
              <button
                key={t.value}
                className="tone-btn"
                style={S.toneBtn(tone === t.value)}
                onClick={() => handleToneChange(t.value)}
              >
                {t.label}
                <span style={S.toneBtnDesc}>{t.desc}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <p style={S.sectionLabel}>Search Query</p>
          <div style={S.inputRow}>
            <input
              style={S.input}
              placeholder='e.g. "real estate agency Dubai"'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateLeads()}
            />
            <button
              className="gen-btn"
              onClick={generateLeads}
              disabled={loading}
              style={S.genBtn(loading)}
            >
              {loading ? "⏳ Searching..." : "⚡ Generate Leads"}
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={S.errorBox}>⚠️ {error}</div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={S.loadingWrap}>
            <div className="spinner" />
            <p style={S.loadingText}>🔍 Scraping up to 20 websites + generating AI emails...</p>
            <p style={S.loadingSubtext}>This may take 1–2 minutes. Please wait ☕</p>
          </div>
        )}

        {/* ── Results ── */}
        {leads.length > 0 && (
          <div>
            {/* Stats bar */}
            <div style={S.statsBar}>
              <div style={S.statsLeft}>
                <span style={S.statChip("#34d399")}>✅ {leads.length} leads</span>
                <span style={S.statChip("#ef4444")}>🔥 {leads.filter((l) => l.score >= 70).length} hot</span>
                <span style={S.statChip("#f59e0b")}>⚡ {leads.filter((l) => l.score >= 45 && l.score < 70).length} warm</span>
                <span style={S.statChip("#60a5fa")}>❄️ {leads.filter((l) => l.score < 45).length} cold</span>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  className="html-btn"
                  onClick={openHTMLReport}
                  style={S.actionBtn(
                    "linear-gradient(135deg, #0f766e, #0d9488)",
                    "0 4px 16px rgba(13,148,136,0.3)"
                  )}
                >
                  🌐 Open Report
                </button>
                <button
                  className="html-btn"
                  onClick={downloadHTMLReport}
                  style={S.actionBtn(
                    "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    "0 4px 16px rgba(124,58,237,0.3)"
                  )}
                >
                  ⬇️ Download
                </button>
              </div>
            </div>

            {/* Regen banner */}
            {regenLoading && (
              <div style={S.regenBanner}>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⚙️</span>
                Regenerating emails with <strong style={{ marginLeft: 4 }}>{tone}</strong> tone... please wait
              </div>
            )}

            {/* Lead Cards */}
            <div>
              {leads.map((lead, i) => (
                <div
                  key={i}
                  className="lead-card-anim lead-card-hover"
                  style={{ ...S.card, animationDelay: `${i * 0.06}s` }}
                >
                  {/* Card header */}
                  <div style={S.cardHeader}>
                    <span style={S.leadNum}>#{i + 1}</span>
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="site-link"
                      style={S.siteLink}
                    >
                      🌐 {lead.website}
                    </a>
                    <span
                      className="score-badge"
                      style={{
                        background: (lead.scoreColor || "#60a5fa") + "18",
                        color: lead.scoreColor || "#60a5fa",
                        border: `1px solid ${(lead.scoreColor || "#60a5fa")}35`,
                        borderRadius: "100px",
                        padding: "4px 13px",
                        fontSize: "0.73rem",
                        fontWeight: "700",
                        marginLeft: "auto",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {lead.scoreLabel} · {lead.score}/100
                    </span>
                  </div>

                  {/* Emails */}
                  <div style={S.emailsRow}>
                    <span style={{ color: "#475569", fontSize: "0.75rem" }}>📧</span>
                    {(lead.allEmails || [lead.email]).map((em, j) => (
                      <span key={j} style={S.emailChip}>{em}</span>
                    ))}
                  </div>

                  {/* AI Email box */}
                  <div style={S.emailBox}>
                    <div style={S.emailBoxHeader}>
                      <span style={S.emailBoxLabel}>
                        ✉️ AI Email &nbsp;
                        <span style={{
                          background: "rgba(167,139,250,0.1)",
                          color: "#a78bfa",
                          border: "1px solid rgba(167,139,250,0.2)",
                          fontSize: "0.68rem",
                          padding: "2px 9px",
                          borderRadius: "6px",
                          fontWeight: "600",
                        }}>
                          {tone === "friendly" ? "😊" : tone === "professional" ? "💼" : "🔥"} {tone}
                        </span>
                      </span>
                      <button
                        className="copy-btn-el"
                        style={S.copyBtn(copied[i])}
                        onClick={() => copyEmail(i, lead.message)}
                      >
                        {copied[i] ? "✅ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <p style={S.emailText}>{lead.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Mascot ── */}
      <div style={S.mascotWrap}>
        <div key={loading || leads.length || error} className="speech-anim" style={S.speechBubble}>
          <p style={S.speechText}>
            {loading
              ? "🔍 Scanning the web... I'm looking for the best matches for you!"
              : error
                ? "⚠️ Oops! Something went wrong. Let's try another search?"
                : leads.length > 0
                  ? `🚀 Boom! I found ${leads.length} high-quality leads. Want to try a different tone?`
                  : "👋 Hi! Ready to boost your sales? Enter a keyword to find leads!"
            }
          </p>
          <div style={{
            position: "absolute",
            bottom: "-8px",
            right: "40px",
            width: "16px",
            height: "16px",
            background: "rgba(255, 255, 255, 0.08)",
            borderRight: "1px solid rgba(255, 255, 255, 0.12)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            transform: "rotate(45deg)",
            backdropFilter: "blur(20px)",
          }} />
        </div>
        <div style={S.mascotImg}>
          <Player
            autoplay
            loop
            src={mascotData}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

    </div>
  );
}

export default App;