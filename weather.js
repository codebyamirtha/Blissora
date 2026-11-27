/* ============================================================
   BLISSORA — WEATHER & WELLNESS SUGGESTIONS JAVASCRIPT ENGINE
   Includes Free Live Open-Meteo API + Built-in Offline Simulation Engine
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Built-in Cities Database
    const PRESET_CITIES = {
        chennai: {
            name: "Chennai, India",
            temp: 31,
            feelsLike: 35,
            condition: "Sunny & Warm",
            icon: "☀️",
            humidity: 72,
            wind: "14 km/h",
            uv: "High (8)",
            type: "sunny"
        },
        mumbai: {
            name: "Mumbai, India",
            temp: 29,
            feelsLike: 33,
            condition: "Partly Cloudy",
            icon: "⛅",
            humidity: 78,
            wind: "16 km/h",
            uv: "Moderate (6)",
            type: "cloudy"
        },
        delhi: {
            name: "Delhi, India",
            temp: 26,
            feelsLike: 27,
            condition: "Pleasant & Clear",
            icon: "🌤️",
            humidity: 48,
            wind: "10 km/h",
            uv: "Moderate (5)",
            type: "sunny"
        },
        bengaluru: {
            name: "Bengaluru, India",
            temp: 24,
            feelsLike: 24,
            condition: "Gentle Breeze",
            icon: "🍃",
            humidity: 62,
            wind: "18 km/h",
            uv: "Moderate (5)",
            type: "breeze"
        },
        london: {
            name: "London, UK",
            temp: 15,
            feelsLike: 14,
            condition: "Light Rain & Mist",
            icon: "🌧️",
            humidity: 85,
            wind: "20 km/h",
            uv: "Low (2)",
            type: "rain"
        },
        newyork: {
            name: "New York, USA",
            temp: 18,
            feelsLike: 18,
            condition: "Overcast",
            icon: "☁️",
            humidity: 55,
            wind: "15 km/h",
            uv: "Low (3)",
            type: "cloudy"
        },
        tokyo: {
            name: "Tokyo, Japan",
            temp: 20,
            feelsLike: 20,
            condition: "Gentle Showers",
            icon: "🌦️",
            humidity: 70,
            wind: "12 km/h",
            uv: "Low (3)",
            type: "rain"
        },
        paris: {
            name: "Paris, France",
            temp: 17,
            feelsLike: 16,
            condition: "Partly Sunny",
            icon: "⛅",
            humidity: 65,
            wind: "15 km/h",
            uv: "Moderate (4)",
            type: "cloudy"
        }
    };

    // Wellness Suggestions Database by Weather Type
    const WELLNESS_SUGGESTIONS = {
        sunny: {
            title: "☀️ Sunny & Warm Wellness Plan",
            desc: "Natural sunlight signals your brain to produce serotonin, elevating mood and alertness. Take advantage of the bright sky while keeping your body cool and hydrated.",
            tips: [
                "💧 Drink at least 8 to 10 glasses of water to maintain cellular hydration.",
                "🚶 Take an early morning or late afternoon walk (15-20 minutes).",
                "🧴 Apply sunscreen if spending extended time outdoors.",
                "🌿 Find a quiet shaded bench to practice 5 minutes of mindful breathwork."
            ],
            audioTrack: "music/birds.mp3",
            audioLabel: "🐦 Listen to Forest Birds & Breeze"
        },
        rain: {
            title: "🌧️ Rainy & Refreshing Wellness Plan",
            desc: "Rainy weather creates negative air ions that promote tranquility and relaxation. Embrace the soothing ambiance to nourish your mental well-being indoors.",
            tips: [
                "☕ Brew a warm cup of herbal chamomile, peppermint, or ginger tea.",
                "📝 Settle into a cozy corner and write your reflections in your journal.",
                "🧘 Practice 10 minutes of restorative meditation or box breathing.",
                "🕯️ Soften harsh overhead lighting to signal relaxation to your nervous system."
            ],
            audioTrack: "music/rain.mp3",
            audioLabel: "🌧️ Listen to Calming Rain Ambiance"
        },
        cloudy: {
            title: "⛅ Overcast & Balanced Wellness Plan",
            desc: "Cloudy days provide gentle, diffused light that is easy on the eyes. It is the perfect climate for grounded focus, light exercise, and peaceful mindfulness.",
            tips: [
                "🧘 Engage in a 5-minute full body scan meditation to release muscle tightness.",
                "📖 Read a chapter of an inspiring or educational book.",
                "🚶 Go for an unhurried brisk walk without checking your smartphone.",
                "💧 Hydrate with fresh water or warm herbal tea."
            ],
            audioTrack: "music/piano.mp3",
            audioLabel: "🎹 Listen to Peaceful Piano Chords"
        },
        breeze: {
            title: "🍃 Fresh & Breezy Wellness Plan",
            desc: "A cool breeze stimulates tactile awareness and refreshes cognitive stamina. Open your windows or step outside to let fresh air renew your energy.",
            tips: [
                "🌬️ Practice conscious deep inhalations, feeling the cool air in your lungs.",
                "🚶 Go for a brisk walk to stimulate circulation and endorphins.",
                "🌿 Enjoy mindful stretching or gentle yoga near an open window.",
                "😊 Take a moment to smile and appreciate the freshness of the day."
            ],
            audioTrack: "music/birds.mp3",
            audioLabel: "🐦 Listen to Forest Birds & Breeze"
        },
        cold: {
            title: "❄️ Chilly & Crisp Wellness Plan",
            desc: "Colder temperatures encourage inner reflection and restful grounding. Protect your body warmth while keeping your spirit cozy and bright.",
            tips: [
                "🍲 Warm yourself with a nourishing soup, broth, or hot herbal tea.",
                "🧘 Practice deep abdominal breathing to build internal core warmth.",
                "🧤 Layer up comfortably with soft blankets or cozy clothing.",
                "📵 Unwind from digital screens early in the evening for restorative rest."
            ],
            audioTrack: "music/relaxing.mp3",
            audioLabel: "🧘 Listen to Zen Meditation Chimes"
        }
    };

    // DOM Elements
    const cityInput = document.getElementById("city");
    const searchBtn = document.getElementById("searchWeather");
    const cityNameEl = document.getElementById("cityName");
    const tempEl = document.getElementById("temperature");
    const conditionEl = document.getElementById("condition");
    const weatherIconEl = document.getElementById("weatherIcon");
    const feelsLikeEl = document.getElementById("feelsLike");
    const humidityEl = document.getElementById("humidity");
    const windEl = document.getElementById("windSpeed");
    const uvEl = document.getElementById("uvIndex");

    const wellnessTitleEl = document.getElementById("wellnessTitle");
    const wellnessDescEl = document.getElementById("wellnessDesc");
    const wellnessTipsListEl = document.getElementById("wellnessTipsList");
    const weatherAudioBtn = document.getElementById("weatherAudioBtn");

    const cityChips = document.querySelectorAll(".city-chip");
    const conditionPills = document.querySelectorAll(".condition-pill");

    let currentWeatherAudio = null;

    // ============================================================
    // 2. RENDER WEATHER FUNCTION
    // ============================================================
    function renderWeather(data) {
        if (cityNameEl) cityNameEl.textContent = data.name;
        if (tempEl) tempEl.textContent = `${Math.round(data.temp)}°C`;
        if (conditionEl) conditionEl.textContent = data.condition;
        if (weatherIconEl) weatherIconEl.textContent = data.icon || "☀️";

        if (feelsLikeEl) feelsLikeEl.textContent = `${Math.round(data.feelsLike || data.temp)}°C`;
        if (humidityEl) humidityEl.textContent = `${data.humidity || 60}%`;
        if (windEl) windEl.textContent = data.wind || "12 km/h";
        if (uvEl) uvEl.textContent = data.uv || "Moderate (5)";

        // Render Wellness Advice
        const plan = WELLNESS_SUGGESTIONS[data.type] || WELLNESS_SUGGESTIONS.sunny;
        if (wellnessTitleEl) wellnessTitleEl.textContent = plan.title;
        if (wellnessDescEl) wellnessDescEl.textContent = plan.desc;

        if (wellnessTipsListEl) {
            wellnessTipsListEl.innerHTML = "";
            plan.tips.forEach(tip => {
                const li = document.createElement("li");
                li.textContent = tip;
                wellnessTipsListEl.appendChild(li);
            });
        }

        if (weatherAudioBtn) {
            weatherAudioBtn.textContent = plan.audioLabel;
            weatherAudioBtn.dataset.track = plan.audioTrack;
        }
    }

    // ============================================================
    // 3. SEARCH & FETCH WEATHER
    // ============================================================
    async function searchCityWeather(cityName) {
        cityName = cityName.trim();
        if (!cityName) {
            alert("Please enter a city name to check the weather.");
            return;
        }

        const normalizedKey = cityName.toLowerCase().replace(/[^a-z]/g, "");

        // Check local presets first
        if (PRESET_CITIES[normalizedKey]) {
            renderWeather(PRESET_CITIES[normalizedKey]);
            return;
        }

        // Try free Open-Meteo Geocoding & Weather API (Zero API Key needed!)
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();

            if (geoData && geoData.results && geoData.results.length > 0) {
                const loc = geoData.results[0];
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m`);
                const weatherData = await weatherRes.json();

                if (weatherData && weatherData.current) {
                    const cur = weatherData.current;
                    const parsed = parseOpenMeteoCode(cur.weather_code, cur.is_day);

                    renderWeather({
                        name: `${loc.name}, ${loc.country_code || loc.country || ""}`,
                        temp: cur.temperature_2m,
                        feelsLike: cur.apparent_temperature,
                        condition: parsed.condition,
                        icon: parsed.icon,
                        humidity: cur.relative_humidity_2m,
                        wind: `${Math.round(cur.wind_speed_10m)} km/h`,
                        uv: cur.is_day ? "Moderate (5)" : "Night (0)",
                        type: parsed.type
                    });
                    return;
                }
            }
        } catch (err) {
            console.log("Online API lookup bypassed or offline, using smart simulation:", err);
        }

        // Simulated Fallback for any unknown city name
        const hash = cityName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const simTemp = 18 + (hash % 16);
        const types = ["sunny", "cloudy", "rain", "breeze"];
        const chosenType = types[hash % types.length];
        const plan = WELLNESS_SUGGESTIONS[chosenType];

        renderWeather({
            name: `${cityName}`,
            temp: simTemp,
            feelsLike: simTemp + 2,
            condition: chosenType === "rain" ? "Light Rain" : chosenType === "sunny" ? "Clear & Sunny" : "Partly Cloudy",
            icon: chosenType === "rain" ? "🌧️" : chosenType === "sunny" ? "☀️" : "⛅",
            humidity: 50 + (hash % 40),
            wind: `${10 + (hash % 15)} km/h`,
            uv: "Moderate (5)",
            type: chosenType
        });
    }

    function parseOpenMeteoCode(code, isDay) {
        if (code === 0) return { condition: isDay ? "Clear & Sunny" : "Clear Night", icon: isDay ? "☀️" : "🌙", type: isDay ? "sunny" : "cold" };
        if (code <= 3) return { condition: "Partly Cloudy", icon: "⛅", type: "cloudy" };
        if (code >= 51 && code <= 67) return { condition: "Rain Showers", icon: "🌧️", type: "rain" };
        if (code >= 71 && code <= 86) return { condition: "Snow / Chilly", icon: "❄️", type: "cold" };
        if (code >= 95) return { condition: "Thunderstorm", icon: "⛈️", type: "rain" };
        return { condition: "Overcast", icon: "☁️", type: "cloudy" };
    }

    if (searchBtn && cityInput) {
        searchBtn.addEventListener("click", () => searchCityWeather(cityInput.value));
        cityInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") searchCityWeather(cityInput.value);
        });
    }

    // ============================================================
    // 4. QUICK CITY CHIPS
    // ============================================================
    cityChips.forEach(chip => {
        chip.addEventListener("click", function () {
            cityChips.forEach(c => c.classList.remove("active"));
            this.classList.add("active");
            const cityKey = this.dataset.city;
            if (PRESET_CITIES[cityKey]) {
                if (cityInput) cityInput.value = PRESET_CITIES[cityKey].name.split(",")[0];
                renderWeather(PRESET_CITIES[cityKey]);
            }
        });
    });

    // ============================================================
    // 5. CONDITION SIMULATOR TABS
    // ============================================================
    conditionPills.forEach(pill => {
        pill.addEventListener("click", function () {
            conditionPills.forEach(p => p.classList.remove("active"));
            this.classList.add("active");

            const cond = this.dataset.condition;
            const currentCityName = cityNameEl ? cityNameEl.textContent : "Current Location";

            if (cond === "sunny") {
                renderWeather({
                    name: currentCityName,
                    temp: 30,
                    feelsLike: 33,
                    condition: "Bright & Sunny",
                    icon: "☀️",
                    humidity: 50,
                    wind: "12 km/h",
                    uv: "Very High (8)",
                    type: "sunny"
                });
            } else if (cond === "rain") {
                renderWeather({
                    name: currentCityName,
                    temp: 21,
                    feelsLike: 21,
                    condition: "Calming Rain",
                    icon: "🌧️",
                    humidity: 88,
                    wind: "18 km/h",
                    uv: "Low (1)",
                    type: "rain"
                });
            } else if (cond === "cloudy") {
                renderWeather({
                    name: currentCityName,
                    temp: 23,
                    feelsLike: 23,
                    condition: "Overcast & Mild",
                    icon: "☁️",
                    humidity: 65,
                    wind: "15 km/h",
                    uv: "Low (3)",
                    type: "cloudy"
                });
            } else if (cond === "cold") {
                renderWeather({
                    name: currentCityName,
                    temp: 12,
                    feelsLike: 10,
                    condition: "Chilly & Crisp",
                    icon: "❄️",
                    humidity: 70,
                    wind: "22 km/h",
                    uv: "Low (2)",
                    type: "cold"
                });
            }
        });
    });

    // ============================================================
    // 6. AMBIENT AUDIO TRIGGER PILL
    // ============================================================
    if (weatherAudioBtn) {
        weatherAudioBtn.addEventListener("click", function () {
            const trackSrc = this.dataset.track || "music/birds.mp3";

            if (currentWeatherAudio && !currentWeatherAudio.paused) {
                currentWeatherAudio.pause();
                this.style.background = "white";
                this.style.color = "#2E8B57";
            } else {
                if (!currentWeatherAudio) {
                    currentWeatherAudio = new Audio(trackSrc);
                    currentWeatherAudio.loop = true;
                } else {
                    currentWeatherAudio.src = trackSrc;
                }
                currentWeatherAudio.play().then(() => {
                    this.style.background = "#2E8B57";
                    this.style.color = "white";
                }).catch(e => console.log("Audio play error:", e));
            }
        });
    }

    // Initial load: Chennai
    renderWeather(PRESET_CITIES.chennai);
});
