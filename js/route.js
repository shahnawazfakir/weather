import { updateWeather, error404, currentLocationBtn } from "./app.js"

const defaultLocation = { lat: 42.373611, lon: -71.110558 } // Cambridge, MA

let cl_lat = "";
let cl_lon = "";

export const currentLocation = function () {
    const currentLocationBtn = document.getElementById("location");
    currentLocationBtn.querySelector('.span').textContent = 'Locating...';
    window.navigator.geolocation.getCurrentPosition(
        (res) => {
            const { latitude, longitude } = res.coords;
            cl_lat = latitude;
            cl_lon = longitude;
            const locationHash = `#/weather?lat=${latitude}&lon=${longitude}`;
            window.location.hash = locationHash;
            currentLocationBtn.querySelector('.span').textContent = 'Located';
            currentLocationBtn.setAttribute("disabled", "");
        },
        (err) => {
            window.location.hash = `#/weather?lat=${defaultLocation.lat}&lon=${defaultLocation.lon}`;
        }
    );
};

const searchedLocation = query => updateWeather(...query.split("&"));

const routes = new Map([
    ["/current-location", currentLocation],
    ["/weather", searchedLocation]
]);

export const checkHash = function () {
    const requestURL = window.location.hash.slice(1);
    const [route, query] = requestURL.includes("?") ? requestURL.split("?") : [requestURL];
    routes.get(route) ? routes.get(route)(query) : error404();
};

import { test_key } from "../assets/font/font.js"
export const key = test_key;

window.addEventListener("hashchange", checkHash);

window.addEventListener("load", function () {
    if (!window.location.hash) {
        if (window.location.hash.includes(cl_lat) && window.location.hash.includes(cl_lon)) {
            currentLocationBtn.setAttribute("disabled", "");
        }
        window.location.hash = "#/current-location";
    } else {
        checkHash();
    }
});