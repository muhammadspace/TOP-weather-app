// I am aware that the api key is exposed publicly. Since this app uses no backend and the api key is free, I left it exposed for simplicity. 
const key = `c62194ab34e8d4cc6bb83533e537fbb7`

function displayError() {
    if (!document.querySelector('span')) {
        let search = document.querySelector('.search-wrapper');
        let span = document.createElement('span');
        span.innerText = 'No results found! Please try again.';
        span.classList.add('error');
        search.appendChild(span);
    }
}

async function process(response) {
    let raw = await response.json();

    const reversegeo = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${raw.coord.lat}&lon=${raw.coord.lon}&limit=1&appid=${key}`, { mode: 'cors' });
    const rgdata = await reversegeo.json();

    const location = rgdata['0'].name;
    const state = rgdata['0'].state;
    const country = rgdata['0'].country;

    return {
        location,
        state,
        country,
        cloudiness: raw.clouds.all,
        feels_like: raw.main.feels_like,
        humidity: raw.main.humidity,
        pressure: raw.main.pressure,
        temp: raw.main.temp,
        temp_min: raw.main.temp_min,
        temp_max: raw.main.temp_max,
        desc: raw.weather['0'].description,
        wind_speed: raw.wind.speed,
        wind_deg: raw.wind.deg,
        icon: raw.weather['0'].icon
    }
}

async function getCoords(location) {
    let latlon;

    try {
        const geocoder = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${key}`, { mode: 'cors' });
        const gcdata = await geocoder.json();
        latlon = { lat: gcdata[0].lat, lon: gcdata[0].lon};
    }
    catch (err) {
        displayError();
    }
    
    return latlon;
}

async function getWeatherData(location, unit) {
    let coords = await getCoords(location);
    let data;

    const api = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${key}&units=${unit}`; 
    const response = await fetch(api, { mode: 'cors' });
    data = process(response);
    
    
    return data;
}

async function renderApp(location, unit) {
    let weather = await getWeatherData(location, unit);
    
    let temp = document.querySelector('.temperature'),
        loc = document.querySelector('.location'),
        desc = document.querySelector('.desc'),
        icon = document.querySelector('.icon'),
        details = document.querySelector('.details');
    
    icon.src = `http://openweathermap.org/img/w/${weather.icon}.png`;
    temp.innerText = Number.parseInt(weather.temp);
    loc.innerText = weather.location;
    desc.innerText = weather.desc;

    details.replaceChildren();
    for (const [key, val] of Object.entries(weather)) {
        if (key === 'cloudiness' || key === 'feels_like' || key === 'humidity' || key === 'wind_speed') {
            let div = document.createElement('div'),
                h4 = document.createElement('h4'),
                p = document.createElement('p');
                
            h4.innerText = key.replace('_', ' ');
            h4.innerText = h4.innerText.replace(h4.innerText.charAt(0), h4.innerText.charAt(0).toUpperCase());
            p.innerText = val;
            
            p.classList.add(key);
            if (key === 'wind_speed') {
                if (unit === 'metric') 
                    p.innerText += ' km/h';
                else
                    p.innerText += ' mph';
            }

                
            div.append(h4, p);
            details.appendChild(div);
        }
    }

    
}

let searchVal = 'cairo';
let unit = 'metric';
renderApp(searchVal, unit);

const searchField = document.querySelector('#search-field');
searchField.addEventListener('input', (e) => searchVal = searchField.value);

const searchBtn = document.querySelector('.search-button');
searchBtn.addEventListener('click', (e) => renderApp(searchVal, unit));

const toggleUnit = document.querySelector('.toggle-unit');
toggleUnit.addEventListener('click', (e) => {
    if (toggleUnit.innerText === 'Fahrenheit') {
        toggleUnit.innerText = 'Celsius';
        unit = 'imperial';
    }
    else {
        toggleUnit.innerText = 'Fahrenheit';
        unit = 'metric';
    }
    renderApp(searchVal, unit);
});
