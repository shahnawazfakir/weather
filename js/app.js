import { fetchData, temperatureUnit, url } from "./api.js";
import * as module from "./module.js";

const addEventOnElements = function (elements, eventType, callback) {
    for (const element of elements) element.addEventListener(eventType, callback);
}

const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");
const toggleSearch = () => searchView.classList.toggle("active");
addEventOnElements(searchTogglers, "click", toggleSearch);

// Search Integration
const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");

function getWindSpeedString(windSpeed) {
    const speedInKm = parseInt(module.mps_to_km(windSpeed));
    const speedInMph = parseInt(module.mps_to_mph(windSpeed));
    const unit = temperatureUnit === 'imperial' ? 'mph' : 'km/h';
    const speed = temperatureUnit === 'imperial' ? speedInMph : speedInKm;
    return `${speed} <sub>${unit}</sub>`;
}

function getDayAfterTomorrow() {
    const currentDate = new Date();
    const dayAfterTomorrow = new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    return dayAfterTomorrow.toLocaleString("en-US", { weekday: "long" });
}

function getDayAfterTomorrow1() {
    const currentDate = new Date();
    const dayAfterTomorrow = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    return dayAfterTomorrow.toLocaleString("en-US", { weekday: "long" });
}

let searchTimeout = null;
const searchTimeoutDuration = 500;

// search suggestions
searchField.addEventListener("input", function () {
    searchTimeout ?? clearTimeout(searchTimeout);

    if (!searchField.value) {
        searchResult.classList.remove("active");
        searchResult.innerHTML = "";
        searchField.classList.remove("searching");
    } else {
        searchField.classList.add("searching");
    }

    if (searchField.value) {
        searchTimeout = setTimeout(() => {
            fetchData(url.geo(searchField.value), function (locations) {
                searchField.classList.remove("searching");
                searchResult.classList.add("active");
                searchResult.innerHTML = `
                    <ul class="view-list" data-search-list></ul>
                `;

                const items = [];
                for (const { name, lat, lon, country, state } of locations) {
                    const searchItem = document.createElement("li");
                    searchItem.classList.add("view-item");

                    searchItem.innerHTML = `
                        <span class="m-icon"><img width="20" height="20" src="./assets/images/weather_icons/location.png" alt="location"></span>
                        <div>
                            <p class="item-title">${name}</p>
                            <p class="label-2 item-subtitle">${state || ""} ${country}</p>
                        </div>
                        <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-toggler></a>
                    `;

                    searchResult.querySelector("[data-search-list]").appendChild(searchItem);
                    items.push(searchItem.querySelector("[data-search-toggler]"));
                }

                addEventOnElements(items, "click", function () {
                    toggleSearch();
                    searchResult.classList.remove("active");
                    currentLocationBtn.querySelector('.span').textContent = 'Current Location';
                    currentLocationBtn.removeAttribute("disabled");
                })
            });
        }, searchTimeoutDuration);
    }
});

function toggleDarkMode() {
    const root = document.querySelector(':root');
    root.classList.toggle('light-mode');
}

var switchButton = document.getElementById("switch2");
var isDarkMode = false;

switchButton.addEventListener("click", function () {
    isDarkMode = !isDarkMode; // Toggle the mode

    if (isDarkMode) {
        // Switch to light mode
        switchButton.querySelector("img").src = "./assets/icons/weather_icons/01d.svg";
        toggleDarkMode(true);
    } else {
        // Switch to dark mode
        switchButton.querySelector("img").src = "./assets/images/weather_icons/01n.svg";
        toggleDarkMode(false);
    }
});

// press enter to search the first item in the search list
searchField.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default Enter key behavior

        searchTimeout ?? clearTimeout(searchTimeout);

        if (!searchField.value) {
            searchResult.classList.remove("active");
            searchResult.innerHTML = "";
            searchField.classList.remove("searching");
        } else {
            searchField.classList.add("searching");
        }

        if (searchField.value) {
            searchTimeout = setTimeout(() => {
                fetchData(url.geo(searchField.value), function (locations) {
                    searchField.classList.remove("searching");
                    searchResult.classList.add("active");
                    searchResult.innerHTML = `
                        <ul class="view-list" data-search-list></ul>
                    `;

                    const items = [];
                    for (const { name, lat, lon, country, state } of locations) {
                        const searchItem = document.createElement("li");
                        searchItem.classList.add("view-item");

                        searchItem.innerHTML = `
                            <span class="m-icon"><img width="20" height="20" src="./assets/images/weather_icons/location.png" alt="location"></span>
                            <div>
                                <p class="item-title">${name}</p>

                                <p class="label-2 item-subtitle">${state || ""} ${country}</p>
                            </div>
                            <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-toggler></a>
                        `;

                        searchResult.querySelector("[data-search-list]").appendChild(searchItem);
                        items.push(searchItem.querySelector("[data-search-toggler]"));
                    }

                    addEventOnElements(items, "click", function () {
                        toggleSearch();
                        searchResult.classList.remove("active");
                    });

                    const firstItem = searchResult.querySelector(".view-item:first-child [data-search-toggler]");
                    if (firstItem) {
                        firstItem.click();
                        currentLocationBtn.querySelector('.span').textContent = 'Current Location';
                        currentLocationBtn.removeAttribute("disabled");
                    }
                });
            }, searchTimeoutDuration);
        }
    }
});

const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
export const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const errorContent = document.querySelector("[data-error-content]");

currentLocationBtn.addEventListener("click", function () {
    currentLocationBtn.setAttribute("disabled", "");
});

// Render weather data in html page
export const updateWeather = function (lat, lon) {
    loading.style.display = "grid";
    container.style.overflowY = "hidden";
    container.classList.remove("fade-in");
    errorContent.style.display = "none";

    const currentWeatherSection = document.querySelector("[data-current-weather]");
    const highlightSection = document.querySelector("[data-highlights]");
    const hourlySection = document.querySelector("[data-hourly-forecast]");
    const forecastSection = document.querySelector("[data-5-day-forecast]")

    currentWeatherSection.innerHTML = "";
    highlightSection.innerHTML = "";
    hourlySection.innerHTML = "";
    forecastSection.innerHTML = "";

    // Current Weather Section
    fetchData(url.currentWeather(lat, lon), function (currentWeather) {
        const {
            weather,
            dt: dateUnix,
            dt: dateTimeUnix,
            sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
            main: { temp, feels_like, pressure, humidity, temp_max, temp_min },
            wind: { deg: windDirection, speed: windSpeed },
            rain,
            visibility,
            timezone
        } = currentWeather

        const rainValue = rain ? rain['1h'] : 0
        const [{ description, icon }] = weather;

        let visibility_dist = 0;
        let units = "";

        if (temperatureUnit == "imperial") {
            visibility_dist = parseInt(module.km_to_miles(visibility / 1000));
            units = "mi";
        } else {
            visibility_dist = parseInt((visibility / 1000));
            units = "km";
        }

        const card = document.createElement("div");
        card.classList.add("card", "card-lg", "current-weather-card");

        card.innerHTML = `
            <h2 class="title-2 card-title">Now</h2>
            <div class="weapper">
                <p class="heading">${parseInt(temp)}&deg;</p>
                <img src="./assets/images/weather_icons/${icon}.svg" alt="${description}"
                    class="weather-icon">
            </div>

            <p class="body-3">${description}</p>
            <ul class="meta-list">
                <li class="meta-item">
                    <img width="24" height="24" src="./assets/images/weather_icons/calender.png" alt="calendar"/>
                    <p class="title-3 meta-text">${module.getDate(dateUnix, timezone)}</p>
                <li>

                <li class="meta-item">
                <img width="24" height="24" src="./assets/images/weather_icons/location1.png" alt="location">
                    <p class="title-3 meta-text" data-location></p>
                </li>
            </ul>
        `;

        fetchData(url.reverseGeo(lat, lon), function ([{ name, country }]) {
            card.querySelector("[data-location]").innerHTML = `${name}, ${country}`
        });

        currentWeatherSection.appendChild(card);

        // Today's Weather
        fetchData(url.airPollution(lat, lon), function (airPollution) {
            const [{
                main: { aqi },
                components: { no2, o3, so2, pm2_5 }
            }] = airPollution.list

            const card = document.createElement("div");

            card.classList.add("card", "card-lg");
            card.innerHTML = `
                <h2 class="title-2" id="highlights-label">Todays Highlights</h2>
                
                <div class="highlight-list">

                <div class="card card-sm highlight-card two">
                    <h3 class="title-3">Sunrise & Sunset</h3>
                    <div class="card-list">
                        <div class="card-item">
                            <img src="./assets/images/weather_icons/sunrise.svg" width="64" height="64"
                            alt="" class="weather-icon" title="">
                            <div>
                                <p class="label-1">Sunrise</p>
                                <p class="title-4">${module.getTime(sunriseUnixUTC, timezone)}</p>
                            </div>
                        </div>
                        <div class="card-item">
                            <img src="./assets/images/weather_icons/sunset.svg" width="64" height="64"
                            alt="" class="weather-icon2" title="">
                            <div>
                                <p class="label-1">Sunset</p>
                                <p class="title-4">${module.getTime(sunsetUnixUTC, timezone)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card card-sm highlight-card one">
                    <h3 class="title-3">Air Quality Index</h3>

                    <div class="wrapper">
                        <img src="./assets/images/weather_icons/wind.svg" width="64" height="64"
                        alt="" class="weather-icon" title="">
                        <ul class="card-list">
                            <li class="card-item">
                                <p class="title-1">${pm2_5.toPrecision(2)}</p>
                                <p class="label-1">PM<sub>2.5</sub></p>
                            </li>

                            <li class="card-item">
                                <p class="title-1">${so2.toPrecision(2)}</p>
                                <p class="label-1">SO<sub>2</sub></p>
                            </li>

                            <li class="card-item">
                                <p class="title-1">${no2.toPrecision(2)}</p>
                                <p class="label-1">NO<sub>2</sub></p>
                            </li>

                            <li class="card-item">
                                <p class="title-1">${o3.toPrecision(3)}</p>
                                <p class="label-1">O<sub>3</sub></p>
                            </li>
                        </ul>

                    </div>

                    <span class="badge aqi-${aqi} label-${aqi}" title="${module.aqiText[aqi].message}">
                        ${module.aqiText[aqi].level}
                    </span>

                    </div>

                    <div class="card card-sm highlight-card">
                        <h3 class="title-3">Humidity</h3>
                        <div class="wrapper">
                        <img src="./assets/images/weather_icons/humidity.svg" width="80" height="80"
                        alt="" class="weather-icon" title="">
                            <p class="title-1">${humidity}<sub>%</sub></p>
                        </div>
                    </div>

                    <div class="card card-sm highlight-card">
                        <h3 class="title-3">Feels Like</h3>
                        <div class="wrapper">
                            <img src="./assets/images/weather_icons/thermometer.svg" width="64" height="64"
                            alt="" class="weather-icon" title="">
                            <p class="title-1">${parseInt(feels_like)}&deg;</p>
                        </div>
                    </div>
                    
                    <div class="card card-sm highlight-card">
                        <h3 class="title-3">Temp High</h3>
                        <div class="wrapper">
                            <img src="./assets/images/weather_icons/temp_max.svg" width="64" height="64"
                            alt="" class="weather-icon" title="">
                            <p class="title-1">${parseInt(temp_max)}&deg;</p>
                        </div>
                    </div>

                    <div class="card card-sm highlight-card">
                        <h3 class="title-3">Temp Low</h3>
                        <div class="wrapper">
                            <img src="./assets/images/weather_icons/temp_min.svg" width="64" height="64"
                            alt="" class="weather-icon" title="">
                            <p class="title-1">${parseInt(temp_min)}&deg;</p>
                        </div>
                    </div>
                    
                    <div class="card card-sm highlight-card">
                        <h3 class="title-3">Visibility</h3>
                        <div class="wrapper">
                            <img src="./assets/images/weather_icons/visibility.svg" width="50" height="50"
                            alt="" class="weather-icon" title="">
                            <p class="title-1">${visibility_dist} ${units}</p>
                        </div>
                    </div>

                    
                    <div class="card card-sm highlight-card">
                        <h3 class="title-3">Pressure</h3>
                        <div class="wrapper">
                            <img src="./assets/images/weather_icons/pressure.svg" width="60" height="65"
                            alt="" class="weather-icon" title="">
                            <p class="title-1">${module.hPa_to_inches(pressure).toFixed(2)}<sub>in</sub></p>
                        </div>
                    </div>

                    <div class="card card-sm highlight-card">
                        <h3 class="title-3">Precipitation</h3>
                        <div class="wrapper">
                            <img src="./assets/images/weather_icons/precipitation.svg" width="60" height="60" alt="" class="weather-icon" title="">
                            <p class="title-1">${rainValue.toPrecision(1)} <sub>mm</sub></p>
                        </div>
                    </div>
                
                    <div class="card card-sm highlight-card">
                        <h3 class="title-3">Wind</h3>
                        <div class="wrapper">
                        <img src="./assets/images/weather_icons/direction.png" width="48" height="48"
                        alt="direction" class="weather-icon1" style="transform: rotate(${windDirection - 180}deg)">
                            <p class="title-1">${getWindSpeedString(windSpeed)}</p>
                        </div>
                    </div>
            `;

            highlightSection.appendChild(card);
        });

        // 24 Hour Forecast
        fetchData(url.forecast(lat, lon), function (forecast) {
            const {
                list: forecastList,
                city: { timezone }
            } = forecast

            hourlySection.innerHTML = `
                <h2 class="title-2">Today</h2>
                <div class="slider-container">
                    <ul class="slider-list" data-temp></ul>
                </div>
                <h3 class="title-2">Tomorrow</h3>
                <div class="slider-container">
                    <ul class="slider-list" data-temp-tomorrow>
                </div>
                <h3 class="title-2">${getDayAfterTomorrow()}</h3>
                <div class="slider-container">
                    <ul class="slider-list" data-temp-tomorrow1>
                </div>
                <h3 class="title-2">${getDayAfterTomorrow1()}</h3>
                <div class="slider-container">
                <ul class="slider-list" data-temp-tomorrow2>
                </div>
            `;

            for (const [index, data] of forecastList.entries()) {
                if (index > 36) break;

                const {
                    dt: dateTimeUnix,
                    main: { temp },
                    weather
                } = data
                const [{ icon, description }] = weather

                const tempLi = document.createElement("li");
                tempLi.classList.add("slider-item");

                const forecastDate = new Date(dateTimeUnix * 1000);
                const currentDate = new Date();

                if (forecastDate.getDate() === currentDate.getDate()) {
                    tempLi.innerHTML = `
                      <div class="card card-sm slider-card">
                        <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>
                        <img src="./assets/images/weather_icons/${icon}.svg" width="64" height="64" 
                        alt="${description}" class="weather-icon" title="${description}">
                        <p class="body-3">${parseInt(temp)}&deg;</p>
                      </div>
                    `;
                    hourlySection.querySelector("[data-temp]").appendChild(tempLi);
                } else if (forecastDate.getDate() === currentDate.getDate() + 1) {
                    tempLi.innerHTML = `
                      <div class="card card-sm slider-card">
                        <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>
                        <img src="./assets/images/weather_icons/${icon}.svg" width="64" height="64"
                        alt="${description}" class="weather-icon" title="${description}">
                        <p class="body-3">${parseInt(temp)}&deg;</p>
                      </div>
                    `;

                    hourlySection.querySelector("[data-temp]").appendChild(tempLi);
                    hourlySection.querySelector("[data-temp-tomorrow]").appendChild(tempLi);
                } else if (forecastDate.getDate() === currentDate.getDate() + 2) {
                    tempLi.innerHTML = `
                      <div class="card card-sm slider-card">
                        <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>
                        <img src="./assets/images/weather_icons/${icon}.svg" width="64" height="64"
                        alt="${description}" class="weather-icon" title="${description}">
                        <p class="body-3">${parseInt(temp)}&deg;</p>
                      </div>
                    `;

                    hourlySection.querySelector("[data-temp]").appendChild(tempLi);
                    hourlySection.querySelector("[data-temp-tomorrow]").appendChild(tempLi);
                    hourlySection.querySelector("[data-temp-tomorrow1]").appendChild(tempLi);
                } else if (forecastDate.getDate() === currentDate.getDate() + 3) {
                    tempLi.innerHTML = `
                      <div class="card card-sm slider-card">
                        <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>
                        <img src="./assets/images/weather_icons/${icon}.svg" width="64" height="64"
                        alt="${description}" class="weather-icon" title="${description}">
                        <p class="body-3">${parseInt(temp)}&deg;</p>
                      </div>
                    `;

                    hourlySection.querySelector("[data-temp]").appendChild(tempLi);
                    hourlySection.querySelector("[data-temp-tomorrow]").appendChild(tempLi);
                    hourlySection.querySelector("[data-temp-tomorrow1]").appendChild(tempLi);
                    hourlySection.querySelector("[data-temp-tomorrow2]").appendChild(tempLi);
                }
            }

            // 5 Day Forecast
            forecastSection.innerHTML = `
                <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>
                <div class="card card-lg forecast-card">
                    <ul data-forecast-list></ul>
                </div>
            `;

            for (let i = 7, len = forecastList.length; i < len; i += 8) {
                const {
                    main: { temp_max },
                    weather,
                    dt_txt
                } = forecastList[i]
                const [{ icon, description }] = weather
                const date = new Date(dt_txt);

                const li = document.createElement("li");
                li.classList.add("card-item");

                li.innerHTML = `
                    <div class="icon-wrapper">
                        <img src="./assets/images/weather_icons/${icon}.svg" width="48" height=48"
                        alt="${description}" class="weather-icon" title="${description}">
                        <span class="span">
                            <p class="title-2">${parseInt(temp_max)}&deg;</p>
                        </span>
                    </div>

                    <p class="label-1">${date.getDate()} ${module.monthNames[date.getUTCMonth()]}</p>
                    <p class="label-1">${module.weekDayNames[date.getUTCDay()]}</p>
                `;

                forecastSection.querySelector("[data-forecast-list]").appendChild(li);
            }

            loading.style.display = "none";
            container.style.overflowY = "overlay";
            container.classList.add("fade-in");
        });
    });
}

export const error404 = () => errorContent.style.display = "flex";