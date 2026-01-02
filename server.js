const express = require('express');

const axios = require('axios');

const Database = require('better-sqlite3');

const cors = require('cors');

const { calculateImpermanentLoss, calculateVolatility, calculateRiskScore, predictVolatilityTrend } = require('./analytics');



const app = express();

const db = new Database('mx_liquidity.db');

app.use(cors());

app.use(express.static('public'));



// --- DATABASE INIT ---

db.exec(`

  CREATE TABLE IF NOT EXISTS pools (

    address TEXT PRIMARY KEY,

    token_a TEXT,

    token_b TEXT,

    tvl_usd REAL,

    apr REAL,

    volume_24h REAL,

    price_ratio REAL,

    risk_score REAL,

    last_updated INTEGER

  );

  CREATE TABLE IF NOT EXISTS snapshots (

    pool_address TEXT,

    timestamp INTEGER,

    price_ratio REAL

  );

`);



// --- INDEXER ---

async function indexLiquidityPools() {
    console.log("🔄 Indexing Mainnet Pools...");
    try {
        const response = await axios.get('https://api.multiversx.com/mex/pairs?size=50', { timeout: 10000 });
        let pairs = response.data;

        const stmt = db.prepare(`
            INSERT OR REPLACE INTO pools (address, token_a, token_b, tvl_usd, apr, volume_24h, price_ratio, risk_score, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const snapshotStmt = db.prepare(`INSERT INTO snapshots (pool_address, timestamp, price_ratio) VALUES (?, ?, ?)`);
        const now = Date.now();

        let count = 0;
        for (const p of pairs) {
            // MAPPING FROM YOUR API JSON:
            const address = p.address;
            const tokenA = p.baseSymbol || '???';
            const tokenB = p.quoteSymbol || '???';
            const tvl = parseFloat(p.totalValue) || 0; // The API uses 'totalValue'
            const vol = parseFloat(p.volume24h) || 0;
            const price = parseFloat(p.price) || 1;
            
            // APR isn't in this specific endpoint, so we'll estimate a healthy 
            // 'Protocol Yield' based on Volume/TVL ratio (Standard DeFi math)
            const apr = tvl > 0 ? ((vol * 0.003 * 365) / tvl) * 100 : 0;

            // Only index active pools with at least $1,000 liquidity
            if (tvl < 1000) continue;

            // Risk calculation based on liquidity and volume
            let risk = 15; 
            if (tvl < 50000) risk += 20; // Low liquidity = Higher risk
            if (vol < 1000) risk += 15;  // Low volume = Stagnant

            stmt.run(address, tokenA, tokenB, tvl, Math.min(apr, 150).toFixed(2), vol, price, risk, now);
            snapshotStmt.run(address, now, price);
            count++;
        }
        
        console.log(`✅ Success! Indexed ${count} Live Mainnet Pools.`);
    } catch (error) {
        console.error("❌ API Fetch Error:", error.message);
    }
}


// Helper for Hackathon Demos: If API is down, show mock data

// function generateMockData() {

//     const stmt = db.prepare(`INSERT OR REPLACE INTO pools VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

//     const now = Date.now();

//     stmt.run('mock-pool-1', 'EGLD', 'MEX', 5000000, 24.5, 120000, 0.0002, 15, now);

//     stmt.run('mock-pool-2', 'EGLD', 'USDC', 12000000, 12.1, 450000, 32.5, 8, now);

//     console.log("🛠️ Mock Data Injected for Demo.");

// }



// --- API ENDPOINTS ---

app.get('/api/pools', (req, res) => {

    const pools = db.prepare('SELECT * FROM pools ORDER BY tvl_usd DESC').all();

    res.json(pools);

});



app.get('/api/pool/:address', (req, res) => {

    const pool = db.prepare('SELECT * FROM pools WHERE address = ?').get(req.params.address);

    const history = db.prepare('SELECT timestamp, price_ratio FROM snapshots WHERE pool_address = ? ORDER BY timestamp ASC').all(req.params.address);

   

    // Add the IL Simulation logic

    const scenarios = [

        { change: "-10%", il: calculateImpermanentLoss(pool.price_ratio, pool.price_ratio * 0.9) },

        { change: "0%", il: 0 },

        { change: "+10%", il: calculateImpermanentLoss(pool.price_ratio, pool.price_ratio * 1.1) }

    ];



    res.json({ pool, history, scenarios });

});



// Start Server

indexLiquidityPools();

setInterval(indexLiquidityPools, 300000); // Refresh every 5 mins

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));

setInterval(indexLiquidityPools, 600000); // Automatically refreshes data every 10 minutes