var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import countries from './countries.js';
// import * as L from 'leaflet';
let previousMarker = null;
const map = L.map('Map', { zoomControl: false, minZoom: 1.1 }).setView([0, 0], 5);
document.addEventListener('DOMContentLoaded', () => {
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tiles = L.tileLayer(tileURL, { attribution });
    tiles.addTo(map);
});
const selects = document.querySelectorAll("select");
selects.forEach((select, index) => {
    for (let country_code in countries) {
        let selected = index === 0 && country_code === "QS" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        select.insertAdjacentHTML("beforeend", option);
    }
});
(_a = document.getElementById('submit')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    event.preventDefault();
    // const data: string[] = ['hi', 'iam', 'good'];
    const cityID = (_b = document.getElementById('inputs')) === null || _b === void 0 ? void 0 : _b.value;
    const countryID = (_c = document.getElementById('country')) === null || _c === void 0 ? void 0 : _c.value;
    if (cityID && countryID) {
        const data = { cityID, countryID };
        // console.log({cityID, countryID});
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
        const options2 = Object.assign({}, options);
        try {
            const fetching = yield fetch('/weather', options);
            if (!fetching.ok) {
                throw new Error(`HTTP ERROR Status:${fetching.status}`);
            }
            const json = yield fetching.json();
            console.log(json);
            DisplayWeather(json.data.weatherData);
            const fetching2 = yield fetch('/location', options2);
            if (!fetching2.ok) {
                throw new Error(`HTTP ERROR Status:${fetching.status}`);
            }
            const json2 = yield fetching2.json();
            console.log(json2);
            ObtainCoords(json2.data.locationData[0]);
        }
        catch (e) {
            console.log('Error in fetch:', e);
            const output = document.querySelector('.output');
            if (output) {
                const err = document.createElement('p');
                err.innerHTML = 'City Does Not Exist In This Country!';
                err.classList.add("error-class");
                output.innerHTML = '';
                output.appendChild(err);
            }
        }
    }
}));
function DisplayWeather(data) {
    var _a, _b;
    const output = document.querySelector('.output');
    const cityID = (_a = document.querySelector('#inputs')) === null || _a === void 0 ? void 0 : _a.value;
    const countryID = (_b = document.getElementById('country')) === null || _b === void 0 ? void 0 : _b.value;
    const city = document.createElement('h1');
    const flag = document.createElement('img');
    const temp = document.createElement('h1');
    const main = document.createElement('h2');
    const icon = document.createElement('img');
    const minmax = document.createElement('h4');
    const roots = document.createElement('div');
    const cityContainer = document.createElement('div');
    const mainContainer = document.createElement('div');
    city.textContent = `${cityID === null || cityID === void 0 ? void 0 : cityID.toUpperCase()}`;
    temp.textContent = `Temperature : ${data.main.temp} °C`;
    if (countryID !== "QS") {
        flag.src = `https://flagsapi.com/${countryID}/shiny/64.png`;
    }
    main.textContent = `${data.weather[0].main} ⟶ ${data.weather[0].description}`;
    icon.src = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    minmax.textContent = `MIN: ${data.main.temp_min} °C ||| MAX: ${data.main.temp_max} °C`;
    city.classList.add('city-class');
    flag.classList.add('flag-class');
    temp.classList.add('temp-class');
    main.classList.add('main-class');
    icon.classList.add('icon-class');
    minmax.classList.add('min-class');
    roots.classList.add('roots-class');
    cityContainer.classList.add('city-container');
    mainContainer.classList.add('main-container');
    cityContainer.append(flag, city);
    mainContainer.append(temp, main, minmax);
    roots.append(cityContainer, mainContainer, icon);
    if (output) {
        output.innerHTML = '';
        output.appendChild(roots);
    }
}
function ObtainCoords(data) {
    const lat = data.lat;
    const lon = data.lon;
    AddMarker(lat, lon);
}
function AddMarker(lat, lon) {
    console.log("Marker added at:", lat, lon);
    const pinIcon = L.icon({
        iconUrl: 'public/RedPin.png',
        iconSize: [20, 30],
        iconAnchor: [10, 30],
    });
    if (previousMarker) {
        map.removeLayer(previousMarker);
    }
    const markerLatLng = L.latLng(lat, lon);
    const marker = L.marker(markerLatLng, { icon: pinIcon }).addTo(map);
    map.setView([lat, lon], map.getZoom());
    previousMarker = marker;
}
