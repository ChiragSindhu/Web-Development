// ==================== CONFIG ====================
const WEATHER_API_KEY = 'a341c029a9ed48ad85354611211803'; // Move to backend in production
const NEWS_API_KEY = 'dab2d1282bf44773817f2c4f4c79bb12'; // Get free key from newsapi.org

let currentUnit = localStorage.getItem('unit') || 'c';
let currentData = null;
let map = null;
let mapMarker = null;

// ==================== SERVICES ====================
const weatherService = {
    async searchCities(query) {
        if (query.length < 2) return [];
        const res = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
        );
        return await res.json();
    },

    async getWeather(query) {
        const res = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=yes`
        );
        if (!res.ok) throw new Error('Location not found');
        return await res.json();
    }
};

const newsService = {
    async getTopHeadlines() {
        if (!NEWS_API_KEY || NEWS_API_KEY.includes('YOUR')) return [];
        try {
            const res = await fetch(`https://newsapi.org/v2/top-headlines?category=general&language=en&apiKey=${NEWS_API_KEY}`);
            const data = await res.json();
            return data.articles?.slice(0, 6) || [];
        } catch (e) {
            console.warn("News API failed - using placeholders");
            return [];
        }
    }
};

// ==================== UTILS ====================
function formatTemp(tempC) {
    if (currentUnit === 'f') {
        return Math.round((tempC * 9/5) + 32);
    }
    return Math.round(tempC);
}

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

function startLiveClock(timezone) {
    const timeEl = document.getElementById('current-time');
    if (window.clockInterval) clearInterval(window.clockInterval);

    window.clockInterval = setInterval(() => {
        const formatter = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: timezone
        });
        timeEl.textContent = formatter.format(new Date());
    }, 1000);
}

// ==================== UI RENDERERS ====================
function renderCurrentWeather(data) {
    const container = document.getElementById('current-weather');
    const condition = data.current.condition.text;
    const icon = data.current.condition.icon;

    container.innerHTML = `
        <div class="lg:col-span-2">
            <div class="flex items-center gap-6">
                <img src="https:${icon}" alt="${condition}" class="w-28 h-28">
                <div>
                    <div class="text-7xl font-light tracking-tighter text-white">
                        ${formatTemp(data.current.temp_c)}<span class="text-4xl align-super text-zinc-400">${currentUnit.toUpperCase()}</span>
                    </div>
                    <div class="text-2xl text-zinc-300">${condition}</div>
                    <div class="text-zinc-400 mt-2">Feels like ${formatTemp(data.current.feelslike_c)}°${currentUnit.toUpperCase()}</div>
                </div>
            </div>
            <div class="mt-8 text-3xl font-medium text-white">${data.location.name}, ${data.location.country}</div>
            <div class="text-zinc-400">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
        
        <div class="grid grid-cols-2 gap-6 text-sm">
            <div class="space-y-6">
                <div>Humidity: <span class="font-medium text-white">${data.current.humidity}%</span></div>
                <div>Wind: <span class="font-medium text-white">${data.current.wind_kph} km/h</span></div>
                <div>UV Index: <span class="font-medium text-white">${data.current.uv}</span></div>
            </div>
            <div class="space-y-6">
                <div>Visibility: <span class="font-medium text-white">${data.current.vis_km} km</span></div>
                <div>Pressure: <span class="font-medium text-white">${data.current.pressure_mb} mb</span></div>
                <div>Cloud Cover: <span class="font-medium text-white">${data.current.cloud}%</span></div>
            </div>
        </div>
    `;
}

function renderHourlyForecast(hours) {
    const container = document.getElementById('hourly-forecast');
    container.innerHTML = hours.slice(0, 12).map(hour => {
        const time = new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        return `
            <div class="bg-zinc-800/70 min-w-[110px] rounded-2xl p-4 text-center snap-center card-hover">
                <div class="text-xs text-zinc-400">${time}</div>
                <img src="https:${hour.condition.icon}" class="w-12 h-12 mx-auto my-3">
                <div class="text-xl font-medium">${formatTemp(hour.temp_c)}°</div>
            </div>
        `;
    }).join('');
}

function renderDailyForecast(days) {
    const container = document.getElementById('daily-forecast');
    container.innerHTML = days.map((day, i) => {
        const date = i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
        return `
            <div class="flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl px-5 py-4 transition-colors">
                <div class="w-20 font-medium">${date}</div>
                <img src="https:${day.day.condition.icon}" class="w-9 h-9">
                <div class="flex gap-6 text-sm">
                    <span class="text-white">${formatTemp(day.day.maxtemp_c)}°</span>
                    <span class="text-zinc-500">${formatTemp(day.day.mintemp_c)}°</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderAstronomy(astro) {
    const container = document.getElementById('astronomy');
    container.innerHTML = `
        <div class="flex justify-between">
            <div>Sunrise <span class="block text-2xl text-amber-300">${astro.sunrise}</span></div>
            <div class="text-right">Sunset <span class="block text-2xl text-orange-400">${astro.sunset}</span></div>
        </div>
        <div class="pt-4 border-t border-zinc-700 flex justify-between text-sm">
            <div>Moon Phase: <span class="font-medium">${astro.moon_phase}</span></div>
            <div>Illumination: <span class="font-medium">${astro.moon_illumination}%</span></div>
        </div>
    `;
}

function renderAirQuality(aq) {
    const pm10 = aq.pm10 || 0;
    let quality = "Good";
    let color = "text-emerald-400";

    if (pm10 > 100) { quality = "Hazardous"; color = "text-red-400"; }
    else if (pm10 > 50) { quality = "Unhealthy"; color = "text-orange-400"; }

    document.getElementById('air-quality').innerHTML = `
        <span class="${color} text-6xl font-light">${pm10}</span>
        <span class="text-base text-zinc-400 block mt-1">PM10 — ${quality}</span>
    `;
}

function renderNews(articles) {
    const container = document.getElementById('news-grid');
    if (!articles.length) {
        container.innerHTML = `<p class="text-zinc-500 col-span-3 text-center py-12">News API key required. Add your NewsAPI key in app.js.</p>`;
        return;
    }

    container.innerHTML = articles.map(article => `
        <a href="${article.url}" target="_blank" class="group bg-zinc-900 rounded-3xl overflow-hidden hover:ring-2 hover:ring-blue-500/30 transition-all">
            <img src="${article.urlToImage || 'https://picsum.photos/600/340'}" class="w-full h-40 object-cover">
            <div class="p-5">
                <h3 class="line-clamp-2 font-medium group-hover:text-blue-400 transition-colors">${article.title}</h3>
                <p class="text-xs text-zinc-500 mt-3">${article.source.name}</p>
            </div>
        </a>
    `).join('');
}

function initMap(lat, lon, name) {
    if (map) {
        map.setView([lat, lon], 10);
        if (mapMarker) map.removeLayer(mapMarker);
    } else {
        map = L.map('map', { zoomControl: false }).setView([lat, lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);
    }
    mapMarker = L.marker([lat, lon]).addTo(map).bindPopup(name).openPopup();
}

// ==================== MAIN APP ====================
async function loadWeather(query) {
    const loading = document.getElementById('loading');
    loading.classList.remove('hidden');

    try {
        const data = await weatherService.getWeather(query);
        currentData = data;

        renderCurrentWeather(data);
        renderHourlyForecast(data.forecast.forecastday[0].hour);
        renderDailyForecast(data.forecast.forecastday);
        renderAstronomy(data.forecast.forecastday[0].astro);
        renderAirQuality(data.current.air_quality || {});
        initMap(data.location.lat, data.location.lon, data.location.name);
        startLiveClock(data.location.tz_id);

        // Load news (independent)
        const news = await newsService.getTopHeadlines();
        renderNews(news);
    } catch (err) {
        alert('Error: ' + err.message);
        console.error(err);
    } finally {
        loading.classList.add('hidden');
    }
}

async function updateSuggestions() {
    const input = document.getElementById('search-input');
    const datalist = document.getElementById('city-suggestions');
    
    const cities = await weatherService.searchCities(input.value);
    datalist.innerHTML = cities.map(city => 
        `<option value="${city.name}, ${city.region || city.country}"></option>`
    ).join('');
}

// Event Listeners
function initializeEventListeners() {
    const searchInput = document.getElementById('search-input');
    const debouncedSuggestions = debounce(updateSuggestions, 300);

    searchInput.addEventListener('input', debouncedSuggestions);
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await loadWeather(searchInput.value);
        }
    });

    document.getElementById('unit-toggle').addEventListener('click', () => {
        currentUnit = currentUnit === 'c' ? 'f' : 'c';
        localStorage.setItem('unit', currentUnit);
        if (currentData) renderCurrentWeather(currentData);
    });
}

async function getCurrentLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        await loadWeather(`${latitude},${longitude}`);
    }, () => alert("Unable to retrieve your location"));
}

// Initialize App
window.onload = async () => {
    initializeEventListeners();
    await loadWeather("New York"); // Default city
};