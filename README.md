# 🦅 Sentinel Dashboard
### AI-Powered Crypto Analytics Terminal

Sentinel is a professional-grade cryptocurrency dashboard that fuses real-time market data with **Generative AI** to provide actionable trading intelligence. Unlike standard charts, Sentinel employs a team of "AI Agents" to analyze trends, news, and on-chain flow for you.

---

## 🚀 Key Features
- **AI Analyst Insights:** Every page features a specialized AI model (Executive, Mechanic, Risk Officer) that reads the charts and explains what's happening in plain English.
- **Real-Time Sentiment:** The Newsroom doesn't just list headlines; it reads them and gauges the global market mood (Greed vs. Fear).
- **On-Chain Anomaly Detection:** Statistical algorithms automatically flag "Whale" transactions that deviate from normal patterns.
- **Correlation Radar:** Detects when assets like BTC and ETH start decoupling, offering unique alpha opportunities.

---

## 🗺️ Page Guide

### 1. 🪐 **Orbit (Executive Overview)**
* **Purpose:** The command center for a high-level view of the market.
* **Key Functions:**
    * **Executive Summary:** AI-generated paragraph summarizing the macro trend.
    * **Price Action Analysis:** Main candlestick chart with key levels.
    * **KPIGrid:** Instant access to Price, 24h Change, Volume, and RSI.
    * **Recent Activity:** A feed of significant market movements.

### 2. 🔧 **The Mechanic (Technical Analysis)**
* **Purpose:** Deep-dive technical analysis for finding entry and exit points.
* **Key Functions:**
    * **Technical Diagnosis:** AI explains specific indicator setups (e.g., "RSI is overbought while price hits upper Bollinger Band").
    * **Indicators:** RSI, SMA (50/200), and Bollinger Bands visualized.
    * **Gauges:** Visual meters showing exactly where price sits relative to key averages.

### 3. 🛡️ **Risk Officer (Drawdown & Volatility)**
* **Purpose:** Protect capital by understanding downside risk.
* **Key Functions:**
    * **Risk Assessment:** AI evaluates if the asset is overextended or in a safe accumulation zone.
    * **Drawdown Charts:** Visualizes how far price is from All-Time Highs.
    * **VaR (Value at Risk):** Statistical estimation of potential daily losses.
    * **Win/Loss Analysis:** Historical probability of positive vs. negative days.

### 4. 📰 **The Newsroom (Sentiment Engine)**
* **Purpose:** Understand the narrative driving the price.
* **Key Functions:**
    * **Daily Intelligence Briefing:** AI reads top headlines and writes a daily market summary.
    * **Bullish/Bearish Drivers:** Identifies the specific events moving markets up or down.
    * **AI Sentiment Scoring:** Assigns a "Bullish", "Bearish", or "Neutral" tag to every single article.

### 5. 🐳 **Whale Watcher (On-Chain Flow)**
* **Purpose:** Track "Smart Money" movements to front-run volatility.
* **Key Functions:**
    * **On-Chain Intelligence:** AI analyzes flow stats to detect accumulation or dumping.
    * **Anomaly Detection:** Highlights transactions that are statistically unusual (Z-Score > 2).
    * **Exchange Net Flow:** Visualizes money entering vs. leaving exchanges.

### 6. 📡 **The Scanner (Market Opportunities)**
* **Purpose:** Find the best assets to trade right now.
* **Key Functions:**
    * **Opportunity Radar:** AI scans all assets to recommend the best risk/reward setup.
    * **RSI Heatmap:** Instantly spots Oversold (<30) or Overbought (>70) assets.
    * **Trend Filter:** Sorts assets by Volume, Gainers, and Losers.

### 7. 🔗 **The Correlator (Asset Relationships)**
* **Purpose:** Identify decoupling events for relative strength trading.
* **Key Functions:**
    * **Rolling Correlation:** Tracks how closely two assets (e.g., BTC & ETH) move together over 30 days.
    * **Divergence Alerts:** Warns when a stable relationship breaks (often a precursor to a big move).
    * **Scatter Plots:** Visualizes daily return distributions.

### 8. 📐 **The Architect (Pattern Recognition)**
* **Purpose:** Advanced structure analysis using institutional tools.
* **Key Functions:**
    * **Fibonacci Retracements:** Auto-calculated support and resistance levels.
    * **Volume Profile (VPVR):** Shows where the most trading occurred at specific price levels.
    * **Smart Money Flow (OBV):** Tracks if volume is confirming price trends.

---

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts
* **Backend:** Supabase (Database, Auth, Realtime)
* **AI Engine:** Google Gemini Pro (via Supabase Edge Functions)
* **Data:** CoinGecko API (Prices), NewsAPI (Headlines)
