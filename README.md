# 🤖 AI Lead Generator & Outreach Engine

A high-performance, full-stack automation tool designed to solve the universal challenge of manual lead generation. This tool automates the end-to-end workflow—from real-time web discovery to intelligent lead scoring and personalized AI-driven outreach.

## ✨ Features

- **🔍 Real-Time Lead Discovery:** Engineered using **Puppeteer** and **SerpAPI** to scan the web for the latest business opportunities.
- **🔥 Intelligent Lead Scoring:** Custom algorithm that ranks leads (Hot, Warm, Cold) based on business signals, domain authority, and contact intent.
- **✉️ AI Outreach Engine:** Generates personalized cold emails instantly.
- **🎭 Live Tone Switching:** Switch between *Friendly*, *Professional*, or *Aggressive* tones and watch emails regenerate live.
- **💎 Premium UI:** A modern **Glassmorphic interface** with animated orbs and a custom AI mascot.
- **📊 One-Click Export:** Download or view beautiful HTML reports of your leads.

## 🛠️ Tech Stack

- **Frontend:** React.js, Glassmorphism CSS, Lottie-React.
- **Backend:** Node.js, Express.js.
- **Automation/AI:** Puppeteer, SerpAPI, Ollama (Llama 3.2).

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed.
- [Ollama](https://ollama.com/) running locally with the `llama3.2` model.

### 2. Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   # In the root directory
   cd server && npm install
   cd ../client && npm install
   ```
3. Create a `.env` file in the `server` folder and add your API key:
   ```env
   SERP_API_KEY=your_serpapi_key_here
   PORT=5000
   ```

### 3. Run the App
```bash
# Start Server
cd server && npm start

# Start Client
cd client && npm start
```

## 🤖 The AI Mascot
Integrated a custom interactive AI mascot to enhance UX, providing live feedback during the scraping and generation process.

---
*Built with ❤️ for developers and founders who are tired of manual prospecting.*
