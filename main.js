import $ from "jquery";

console.log("Magic Weather with jQuery");

// Кешуємо jQuery-елементи
const $form = $("#city-form");
const $input = $("#city-input");
const $cardsContainer = $("#weather-cards");
const $statusEl = $("#status-message");

if (
  $form.length === 0 ||
  $input.length === 0 ||
  $cardsContainer.length === 0 ||
  $statusEl.length === 0
) {
  console.error("Не знайдено необхідні елементи на сторінці");
}

// Обробник форми через jQuery
$form.on("submit", (event) => {
  event.preventDefault();

  const cityName = $input.val().trim();
  if (!cityName) return;

  $statusEl.text(`Шукаю місто "${cityName}"...`);
  $cardsContainer.empty();

  getCityCoordinates(cityName);
});

// --------- ФУНКЦІЇ РОБОТИ З API (fetch залишаємо, тут важливий саме jQuery для DOM) ---------

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
      $statusEl.text("Місто не знайдено 😢");
      return;
    }

    const { latitude, longitude, name } = data.results[0];

    $statusEl.text(`Знайдено місто: ${name}. Завантажую погоду...`);
    getWeather(latitude, longitude, name);
  } catch (error) {
    console.error("Помилка геокодингу:", error);
    $statusEl.text("Сталася помилка при пошуку міста.");
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
      $statusEl.text("Не вдалося отримати прогноз погоди.");
      return;
    }

    $statusEl.text(`Прогноз погоди для: ${cityName}`);
    renderWeatherCards(data.daily, cityName);
  } catch (error) {
    console.error("Помилка завантаження погоди:", error);
    $statusEl.text("Сталася помилка при завантаженні погоди.");
  }
}

function renderWeatherCards(daily, cityName) {
  $cardsContainer.empty();

  const dates = daily.time;
  const tempsMax = daily.temperature_2m_max;
  const tempsMin = daily.temperature_2m_min;
  const codes = daily.weathercode;

  dates.forEach((date, index) => {
    const $card = $("<div>").addClass("weather-card");

    $card.html(`
      <h3>${cityName}</h3>
      <p><strong>${date}</strong></p>
      <p>Макс: ${tempsMax[index]}°C</p>
      <p>Мін: ${tempsMin[index]}°C</p>
      <p>Код погоди: ${codes[index]}</p>
    `);

    $cardsContainer.append($card);
  });

  if (dates.length === 0) {
    $statusEl.text("Немає даних для відображення.");
  }
}

// --------- ДЕМО ПРИКЛАДИ JQUERY ДЛЯ ДОМАШКИ ---------

// 1. Показати / сховати блок з підказкою (slideToggle)
$("#toggle-info-btn").on("click", () => {
  $("#info-box").slideToggle(200);
});

// 2. Підсвітити / зняти підсвітку з карток погоди (toggleClass)
$("#highlight-cards-btn").on("click", () => {
  $(".weather-card").toggleClass("highlight");
});

// 3. Анімація заголовка (fadeOut / fadeIn / animate)
$("#animate-title-btn").on("click", () => {
  $(".title")
    .fadeOut(200)
    .fadeIn(200)
    .animate({ letterSpacing: "4px" }, 200)
    .animate({ letterSpacing: "1px" }, 200);
});
