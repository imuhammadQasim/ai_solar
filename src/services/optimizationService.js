const { getWeatherData } = require('./weatherService');
const { getLatestInverterData } = require('./influxService');

/**
 * Basic Optimization Logic
 * Suggests actions based on cloud coverage and weather conditions.
 */
const getSolarOptimizationAdvice = async () => {
    try {
        const weather = await getWeatherData();
        const latestData = await getLatestInverterData();
        
        const advice = {
            status: "Normal",
            suggestion: "No action needed.",
            weather: weather,
            currentProduction: latestData ? latestData.power : 0
        };

        // Logic: If cloud coverage > 70% and it's daytime, grid charging might be better
        if (weather.cloudCoverage > 70) {
            advice.status = "Low Solar Efficiency";
            advice.suggestion = "Cloudy skies detected. Suggest switching to grid charging or reducing heavy load usage.";
        } else if (weather.condition === 'Rain' || weather.condition === 'Thunderstorm') {
            advice.status = "Weather Warning";
            advice.suggestion = "Inclement weather detected. Ensure battery is charged via grid if solar production drops.";
        } else if (weather.cloudCoverage < 20) {
            advice.status = "Peak Solar Production";
            advice.suggestion = "Clear skies! Maximize heavy load usage (washing machines, EV charging) now.";
        }

        // Feature: Add warning if current production is unexpectedly low
        if (latestData && latestData.power < 500 && weather.cloudCoverage < 30) {
            advice.status = "Production Alert";
            advice.suggestion = "Low production detected despite clear skies. Check for panel shading or inverter issues.";
        }


        return advice;

    } catch (error) {
        console.error('Optimization error:', error.message);
        return { error: "Could not generate optimization advice" };
    }
};

module.exports = { getSolarOptimizationAdvice };
