// Fetch data from server
export const fetchData = function (URL, callback) {
    fetch(`${URL}&appid=${api_key}`)
        .then(res => res.json())
        .then(data => callback(data));
}

export let temperatureUnit = 'imperial';
const tempSwitchBtn = document.getElementById('switch');

var fahrenheit = false;
tempSwitchBtn.addEventListener('click', () => {
    fahrenheit = !fahrenheit;
    // Check the current temperature unit
    if (fahrenheit) {
        temperatureUnit = 'metric';
        checkHash();
        tempSwitchBtn.querySelector("img").src = "./assets/images/weather_icons/celsius.png";
    } else {
        temperatureUnit = 'imperial';
        checkHash();
        tempSwitchBtn.querySelector("img").src = "./assets/images/weather_icons/fahrenheit.png";
    }
});

import { checkHash, key } from "./route.js";
export const api_key = key;

// calling API to retrieve data 
export const url = {
    currentWeather(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=${temperatureUnit}&appid=${api_key}`;
    },
    forecast(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=${temperatureUnit}&appid=${api_key}`;
    },

    airPollution(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}&appid=${api_key}`;
    },
    reverseGeo(lat, lon) {
        return `https://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5&appid=${api_key}`;
    },
    geo(query) {
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${api_key}`;
    }
}