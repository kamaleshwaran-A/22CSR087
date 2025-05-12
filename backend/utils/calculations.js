// Function to calculate the average of stock prices
const calculateAverage = (prices) => {
    if (!prices || prices.length === 0) return 0;
    const sum = prices.reduce((acc, curr) => acc + curr.price, 0);
    return sum / prices.length;
};

// Function to calculate the correlation between two stock price histories
const calculateCorrelation = (prices1, prices2) => {
    if (!prices1 || !prices2 || prices1.length === 0 || prices2.length === 0) return 0;

    const mean1 = calculateAverage(prices1);
    const mean2 = calculateAverage(prices2);

    const covariance = prices1.reduce((acc, curr, idx) => {
        if (idx < prices2.length) {
            return acc + (curr.price - mean1) * (prices2[idx].price - mean2);
        }
        return acc;
    }, 0);

    const stdDev1 = Math.sqrt(prices1.reduce((acc, curr) => acc + Math.pow(curr.price - mean1, 2), 0));
    const stdDev2 = Math.sqrt(prices2.reduce((acc, curr) => acc + Math.pow(curr.price - mean2, 2), 0));

    return covariance / (stdDev1 * stdDev2);
};

module.exports = { calculateAverage, calculateCorrelation };
