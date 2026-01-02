const math = require('mathjs');



// Helper: Calculate simple average of an array

function calculateAverage(data) {

    if (data.length === 0) return 0;

    return data.reduce((a, b) => a + b, 0) / data.length;

}



/**

 * Predicts future volatility trend using MA Crossover.

 * @param {Array<number>} historicalVolatility - Daily volatility values (e.g., last 30 days)

 * @returns {Object} - Insight object

 */

function predictVolatilityTrend(historicalVolatility) {

    // We need at least 15 data points to do a decent comparison

    if (historicalVolatility.length < 15) {

        return { trend: "Unknown", message: "Not enough data" };

    }



    // 1. Define our windows

    const shortTermWindow = 5;  // "The Runner" (Last 5 days)

    const longTermWindow = 15; // "The Walker" (Last 15 days)



    // 2. Get the data slices

    // Slice the last 5 items

    const recentVolData = historicalVolatility.slice(-shortTermWindow);

    // Slice the last 15 items

    const longVolData = historicalVolatility.slice(-longTermWindow);



    // 3. Calculate Averages (Moving Averages)

    const shortMA = calculateAverage(recentVolData);

    const longMA = calculateAverage(longVolData);



    // 4. Compare (The Crossover Logic)

    let trend = "";

    let message = "";

    let riskLevel = "";



    if (shortMA > longMA * 1.1) {

        // Short term is 10% higher than long term -> Spiking!

        trend = "Rising 📈";

        message = "Volatility is spiking above average. High IL risk incoming.";

        riskLevel = "HIGH";

    } else if (shortMA < longMA * 0.9) {

        // Short term is 10% lower than long term -> Calming down.

        trend = "Falling 📉";

        message = "Volatility is dropping. Safer entry point.";

        riskLevel = "LOW";

    } else {

        trend = "Stable ➡";

        message = "Volatility is normal.";

        riskLevel = "MEDIUM";

    }



    return {

        shortMA: shortMA.toFixed(4),

        longMA: longMA.toFixed(4),

        trend,

        message,

        riskLevel

    };

}



module.exports = { predictVolatilityTrend }; // Export to use in server.js





/**

 * Predicts risk trend using a Moving Average Crossover.

 * Runner (5-period) vs Walker (15-period)

 */

function getVolatilityPrediction(history) {

    if (history.length < 15) return { trend: "Neutral", color: "white" };



    const prices = history.map(h => h.price_ratio);

   

    // Calculate last 5 days avg (Runner)

    const shortTerm = prices.slice(-5).reduce((a, b) => a + b) / 5;

    // Calculate last 15 days avg (Walker)

    const longTerm = prices.slice(-15).reduce((a, b) => a + b) / 15;



    if (shortTerm > longTerm * 1.05) {

        return { trend: "Risk Rising 📈", color: "#f43f5e", advice: "Volatility spiking. Watch for IL." };

    } else if (shortTerm < longTerm * 0.95) {

        return { trend: "Risk Falling 📉", color: "#10b981", advice: "Price stabilizing. Safer entry." };

    } else {

        return { trend: "Stable ➡", color: "#e2e8f0", advice: "Normal market conditions." };

    }

}









// analytics.js



function calculateImpermanentLoss(startPrice, endPrice) {

    const priceRatio = endPrice / startPrice;

    const il = (2 * Math.sqrt(priceRatio) / (1 + priceRatio)) - 1;

    return Math.abs(il * 100); // Return as percentage

}



function calculateVolatility(prices) {

    if (prices.length < 2) return 0;

    const returns = [];

    for (let i = 1; i < prices.length; i++) {

        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);

    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;

    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;

    return Math.sqrt(variance);

}



function calculateRiskScore(volatility, tvl, il) {

    // Simple logic: high volatility + low TVL = High Risk

    let score = (volatility * 100) + (il * 2);

    if (tvl < 1000000) score += 20; // Extra risk for low liquidity

    return Math.min(Math.round(score), 100);

}



function predictVolatilityTrend(historicalVolatility) {

    if (historicalVolatility.length < 5) return { trend: "Stable", riskLevel: "LOW" };

    // Simplified MA logic for the prediction

    const recent = historicalVolatility.slice(-3).reduce((a, b) => a + b) / 3;

    const older = historicalVolatility.slice(0, 3).reduce((a, b) => a + b) / 3;

   

    return recent > older ?

        { trend: "Rising 📈", riskLevel: "HIGH" } :

        { trend: "Falling 📉", riskLevel: "LOW" };

}



// THIS IS THE KEY PART: Exporting all functions so server.js can see them

module.exports = {

    calculateImpermanentLoss,

    calculateVolatility,

    calculateRiskScore,

    predictVolatilityTrend

};

// Add a more robust Volatility calculation
function calculateStandardDeviation(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function getVolatilityPrediction(history) {
    if (history.length < 15) return { trend: "Neutral", risk: "LOW" };

    const prices = history.map(h => h.price_ratio);
    const shortTerm = prices.slice(-5);
    const longTerm = prices.slice(-15);

    const shortStd = calculateStandardDeviation(shortTerm);
    const longStd = calculateStandardDeviation(longTerm);

    // If short-term volatility is 2x the long-term, it's a spike
    if (shortStd > longStd * 2) {
        return { 
            trend: "Spiking 🚀", 
            risk: "CRITICAL", 
            advice: "High IL Risk: Price divergence detected." 
        };
    }
    return { trend: "Stable 🟢", risk: "LOW", advice: "Healthy consolidation." };
}