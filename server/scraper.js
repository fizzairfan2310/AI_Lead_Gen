require('dotenv').config();
const puppeteer = require("puppeteer");

function extractEmails(text) {
    const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
    return [...new Set(text.match(regex) || [])];
}

// Lead scoring: 0–100 based on multiple signals
function scoreLead({ website, emails, pageText }) {
    let score = 0;

    // Good email prefixes = high intent
    const hotPrefixes = ["info", "contact", "hello", "sales", "business", "ceo", "founder", "admin"];
    const hasHotEmail = emails.some(e => hotPrefixes.some(p => e.toLowerCase().startsWith(p)));
    if (hasHotEmail) score += 30;

    // Multiple emails = more legit business
    if (emails.length >= 3) score += 15;
    else if (emails.length >= 2) score += 8;

    // Domain quality
    if (website.includes(".com")) score += 10;
    if (website.includes(".io") || website.includes(".co")) score += 5;
    if (website.includes("wix.com") || website.includes("wordpress.com") || website.includes("blogspot")) score -= 10;

    // Page content signals
    const text = (pageText || "").toLowerCase();
    if (text.includes("contact us") || text.includes("get in touch")) score += 10;
    if (text.includes("services") || text.includes("solutions")) score += 8;
    if (text.includes("portfolio") || text.includes("our work")) score += 5;
    if (text.includes("pricing") || text.includes("hire")) score += 12;

    // Has HTTPS
    if (website.startsWith("https://")) score += 5;

    return Math.min(100, Math.max(10, score));
}

function getScoreLabel(score) {
    if (score >= 70) return { label: "🔥 Hot Lead", color: "#ef4444" };
    if (score >= 45) return { label: "⚡ Warm Lead", color: "#f59e0b" };
    return { label: "❄️ Cold Lead", color: "#60a5fa" };
}

async function getRealLinks(keyword, apiKey) {
    const query = encodeURIComponent(keyword + " contact email");
    const url = `https://serpapi.com/search.json?q=${query}&api_key=${apiKey}&num=20`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("SerpAPI status:", data.error || "OK");

    if (!data.organic_results) return [];

    return data.organic_results
        .map((r) => r.link)
        .filter((l) => l && l.startsWith("http") && !l.includes("linkedin.com"))
        .slice(0, 25);
}

async function scrapeLeads(keyword) {
    const SERP_API_KEY = process.env.SERP_API_KEY;

    let links = [];

    try {
        links = await getRealLinks(keyword, SERP_API_KEY);
        console.log("Links found:", links.length, links);
    } catch (e) {
        console.log("SerpAPI error:", e.message);
        return [];
    }

    if (links.length === 0) return [];

    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const leads = [];

    for (const url of links) {
        if (leads.length >= 20) break;

        try {
            console.log("Visiting:", url);
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: 300000 });

            // Try main page first
            let text = await page.evaluate(() => document.body.innerText);
            let emails = extractEmails(text);

            // If no email found, try /contact page
            if (emails.length === 0) {
                try {
                    const contactUrl = new URL(url).origin + "/contact";
                    await page.goto(contactUrl, { waitUntil: "domcontentloaded", timeout: 8000 });
                    text = await page.evaluate(() => document.body.innerText);
                    emails = extractEmails(text);
                } catch (_) { }
            }

            console.log("Emails on", url, ":", emails);

            if (emails.length > 0) {
                const score = scoreLead({ website: url, emails, pageText: text });
                const { label: scoreLabel, color: scoreColor } = getScoreLabel(score);

                leads.push({
                    website: url,
                    email: emails[0],
                    allEmails: emails.slice(0, 10),
                    score,
                    scoreLabel,
                    scoreColor,
                });
            }
        } catch (e) {
            console.log("Skipped:", url, e.message);
        }
    }

    await browser.close();

    // Sort by score descending (hot leads first)
    leads.sort((a, b) => b.score - a.score);

    return leads;
}

module.exports = { scrapeLeads };