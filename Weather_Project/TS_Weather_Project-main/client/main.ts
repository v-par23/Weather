import countries from './countries.js';
// import * as L from 'leaflet';

let previousMarker: L.Marker | null = null;
const map = L.map('Map', { zoomControl: false, minZoom: 1.1 }).setView([0, 0], 5);

document.addEventListener('DOMContentLoaded', () => {
    const attribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tiles = L.tileLayer(tileURL, { attribution });
    tiles.addTo(map);
});

const selects: NodeListOf<HTMLSelectElement> = document.querySelectorAll("select");

selects.forEach((select:HTMLSelectElement, index:number) => {
    for(let country_code in countries) {
        let selected = index === 0 && country_code === "QS"? "selected" : ""; 
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        select.insertAdjacentHTML("beforeend", option);
    }
});

document.getElementById('submit')?.addEventListener('click', async(event)=>{
    event.preventDefault();
    // const data: string[] = ['hi', 'iam', 'good'];
    const cityID: string | null = (document.getElementById('inputs') as HTMLInputElement)?.value;
    const countryID: string | null = (document.getElementById('country') as HTMLInputElement)?.value;

    if (cityID && countryID){
        const data : {cityID:string; countryID:string} = {cityID , countryID};
        // console.log({cityID, countryID});
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
        const options2: RequestInit = { ...options};

        try{
            const fetching = await fetch('/weather', options);
            if (!fetching.ok) {
                throw new Error(`HTTP ERROR Status:${fetching.status}`);
            }

            const json = await fetching.json();
            console.log(json);
            DisplayWeather(json.data.weatherData);

            const fetching2 = await fetch('/location', options2);
            if (!fetching2.ok) {
                throw new Error(`HTTP ERROR Status:${fetching.status}`);
            }

            const json2 = await fetching2.json();
            console.log(json2);
            ObtainCoords(json2.data.locationData[0]);
        }catch(e){
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
}});


function DisplayWeather(data:any){
    const output: HTMLSelectElement | null = document.querySelector('.output');
    const cityID: string = (document.querySelector('#inputs') as HTMLInputElement)?.value;
    const countryID: string = (document.getElementById('country')as HTMLInputElement)?.value; 

    const city: HTMLHeadingElement = document.createElement('h1');
    const flag: HTMLImageElement = document.createElement('img');
    const temp: HTMLHeadingElement = document.createElement('h1');
    const main: HTMLHeadingElement = document.createElement('h2');
    const icon: HTMLImageElement = document.createElement('img');
    const minmax: HTMLHeadingElement = document.createElement('h4');
    const roots: HTMLDivElement = document.createElement('div');
    const cityContainer: HTMLDivElement = document.createElement('div');
    const mainContainer: HTMLDivElement = document.createElement('div');

    city.textContent = `${cityID?.toUpperCase()}`;
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

function ObtainCoords(data:any){
    const lat: number = data.lat;
    const lon: number = data.lon;
    AddMarker(lat,lon);
}

function AddMarker(lat:number, lon:number){
    console.log("Marker added at:", lat,lon);

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