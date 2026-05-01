const express = require("express");
const cors = require("cors");
const { scrapeLeads } = require("./scraper");
const { generateEmail } = require("./ai");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-leads", async (req, res) => {
    const { keyword, tone = "professional" } = req.body;
    console.log("Keyword received:", keyword, "| Tone:", tone);

    try {
        console.log("Starting scrape...");
        const leads = await scrapeLeads(keyword);
        console.log("Leads found:", leads.length);

        if (leads.length === 0) {
            return res.json({ results: [] });
        }

        const results = await Promise.all(
            leads.map(async (lead) => {
                console.log("Generating email for:", lead.website, "| Tone:", tone);
                const message = await generateEmail(lead.website, tone);
                return { ...lead, message, tone };
            })
        );

        console.log("Final results:", results.length);
        res.json({ results });
    } catch (err) {
        console.error("ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Regenerate emails only (no re-scraping) when tone changes
app.post("/regenerate-emails", async (req, res) => {
    const { websites, tone = "professional" } = req.body;
    console.log("Regenerating emails | Tone:", tone, "| Count:", websites.length);
    try {
        const emails = await Promise.all(
            websites.map(async (website) => {
                const message = await generateEmail(website, tone);
                return { website, message };
            })
        );
        res.json({ emails });
    } catch (err) {
        console.error("Regen ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));