const express = require('express');
const axios = require('axios');
const { calculateAverage, calculateCorrelation } = require('./utils/calculations');
const app = express();
const PORT = 5000;

const BASE_URL = 'http://20.244.56.144/evaluation-service';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDMzMDg5LCJpYXQiOjE3NDcwMzI3ODksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6Ijk3YTcwN2MzLWVmNzItNDBmZi1hMTlkLWE2MDg4MTAxZWZlOSIsInN1YiI6ImthbWFsZXNod2FyYW5hLjIyY3NlQGtvbmd1LmVkdSJ9LCJlbWFpbCI6ImthbWFsZXNod2FyYW5hLjIyY3NlQGtvbmd1LmVkdSIsIm5hbWUiOiJrYW1hbGVzaHdhcmFuIGEiLCJyb2xsTm8iOiIyMmNzcjA4NyIsImFjY2Vzc0NvZGUiOiJqbXBaYUYiLCJjbGllbnRJRCI6Ijk3YTcwN2MzLWVmNzItNDBmZi1hMTlkLWE2MDg4MTAxZWZlOSIsImNsaWVudFNlY3JldCI6ImVjTlF1dkt6Z2JraFVtR2YifQ.OJA-IW7mm3YCxb7UCeRRkBbduprOf781JPchNhKjLbI'; // Replace with your actual token

// API: Average Stock Price
app.get('/stocks/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const { minutes, aggregation } = req.query;

    try {
        const response = await axios.get(`${BASE_URL}/stocks/${ticker}?minutes=${minutes}`, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });
        const priceHistory = response.data;

        if (aggregation === 'average') {
            const averageStockPrice = calculateAverage(priceHistory);
            res.json({ averageStockPrice, priceHistory });
        } else {
            res.status(400).json({ error: 'Invalid aggregation type' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock data', details: error.message });
    }
});

// API: Correlation of Price Movement
app.get('/stockcorrelation', async (req, res) => {
    const { minutes, ticker: tickers } = req.query;

    if (!Array.isArray(tickers) || tickers.length !== 2) {
        return res.status(400).json({ error: 'Exactly two tickers must be provided' });
    }

    try {
        const [response1, response2] = await Promise.all([
            axios.get(`${BASE_URL}/stocks/${tickers[0]}?minutes=${minutes}`, {
                headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
            }),
            axios.get(`${BASE_URL}/stocks/${tickers[1]}?minutes=${minutes}`, {
                headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
            })
        ]);

        const prices1 = response1.data;
        const prices2 = response2.data;

        const correlation = calculateCorrelation(prices1, prices2);
        res.json({
            correlation,
            stocks: {
                [tickers[0]]: { averagePrice: calculateAverage(prices1), priceHistory: prices1 },
                [tickers[1]]: { averagePrice: calculateAverage(prices2), priceHistory: prices2 }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock data', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
