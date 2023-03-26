// I am aware that the api key is exposed publicly. Since this app uses no backend and the api key is free, I left it exposed for simplicity. 
const key = `c62194ab34e8d4cc6bb83533e537fbb7`

async function process(response) {
    let raw = await response.json();

    const reversegeo = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${raw.coord.lat}&lon=${raw.coord.lon}&limit=1&appid=${key}`);
    const rgdata = await reversegeo.json();

    const location = rgdata['0'].name;
    const state = rgdata['0'].state;
    const country = rgdata['0'].country;

    console.log(raw);

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
    const geocoder = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${key}`, { mode: 'cors' });
    const gcdata = await geocoder.json();
    let latlon = { lat: gcdata[0].lat, lon: gcdata[0].lon};
    
    return latlon;
}

async function getWeatherData(location) {
    let coords = await getCoords(location);
    
    const api = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${key}&units=metric`; 
    const response = await fetch(api, { mode: 'cors' });
    
    let data = process(response);

    return data;
}

let img = document.querySelector('img');
let weatherData;

getWeatherData('sydney').then(data => {
    console.log(data);
    img.src = `http://openweathermap.org/img/w/${data.icon}.png`;
    weatherData = data;
});
