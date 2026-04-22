const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = process.env.CITY_NAME;

const getWeatherData = async () => {
    const cacheKey = `weather_${CITY}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        console.log('Returning cached weather data');
        return cachedData;
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);
        
        const weatherInfo = {
            temperature: response.data.main.temp,
            condition: response.data.weather[0].main,
            cloudCoverage: response.data.clouds.all, // % cloudiness
            humidity: response.data.main.humidity
        };

        cache.set(cacheKey, weatherInfo);
        console.log('Fetched and cached new weather data');
        return weatherInfo;

    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        throw new Error('Could not fetch weather data');
    }
};

module.exports = { getWeatherData };
