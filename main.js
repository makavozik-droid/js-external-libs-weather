console.log("Magic Weather is ready");

const form = document.getElementById("city-form");
const input = document.getElementById("city-input");
const cardsContainer = document.getElementById("weather-cards");
const statusEl = document.getElementById("status-message");

if (!form || !input || !cardsContainer) {
  console.error("Не знайдено елементи форми або контейнер для карток");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const cityName = input.value.trim();
  if (!cityName) return;

  statusEl.textContent = `Шукаю місто "${cityName}"...`;
  cardsContainer.innerHTML = "";

  getCityCoordinates(cityName);
});

async function getCityCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&language=uk&format=json`;

  try {
    console.log("Запит геокодингу:", url);
    const response = await fetch(url);
    const data = await response.json();
    console.log("Відповідь геокодингу:", data);

    if (!data.results || data.results.length === 0) {
      statusEl.textContent = "Місто не знайдено 😢";
      return;
    }

    const { latitude, longitude, name } = data.results[0];

    statusEl.textContent = `Знайдено місто: ${name}. Завантажую погоду...`;
    getWeather(latitude, longitude, name);
  } catch (error) {
    console.error("Помилка геокодингу:", error);
    statusEl.textContent = "Сталася помилка при пошуку міста.";
  }
}

async function getWeather(lat, lon, cityName) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

  try {
    console.log("Запит погоди:", url);
    const response = await fetch(url);
    const data = await response.json();
    console.log("Відповідь погоди:", data);

    if (!data.daily) {
      statusEl.textContent = "Не вдалося отримати прогноз погоди.";
      return;
    }

    statusEl.textContent = `Прогноз погоди для: ${cityName}`;
    renderWeatherCards(data.daily, cityName);
  } catch (error) {
    console.error("Помилка завантаження погоди:", error);
    statusEl.textContent = "Сталася помилка при завантаженні погоди.";
  }
}

function renderWeatherCards(daily, cityName) {
  cardsContainer.innerHTML = "";

  const dates = daily.time;
  const tempsMax = daily.temperature_2m_max;
  const tempsMin = daily.temperature_2m_min;
  const codes = daily.weathercode;

  dates.forEach((date, index) => {
    const card = document.createElement("div");
    card.classList.add("weather-card");

    card.innerHTML = `
      <h3>${cityName}</h3>
      <p><strong>${date}</strong></p>
      <p>Макс: ${tempsMax[index]}°C</p>
      <p>Мін: ${tempsMin[index]}°C</p>
      <p>Код погоди: ${codes[index]}</p>
    `;

    cardsContainer.appendChild(card);
  });

  if (dates.length === 0) {
    statusEl.textContent = "Немає даних для відображення.";
  }
}
