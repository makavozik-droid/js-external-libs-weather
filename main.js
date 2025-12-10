import { gsap } from "gsap";

console.log("Magic Weather with GSAP ✨");

// Базові елементи
const form = document.getElementById("city-form");
const input = document.getElementById("city-input");
const cardsContainer = document.getElementById("weather-cards");
const statusEl = document.getElementById("status-message");

if (!form || !input || !cardsContainer || !statusEl) {
  console.error("Не знайдено необхідні елементи на сторінці");
}

// Анімація заголовка при завантаженні сторінки
gsap.from(".header", {
  y: -40,
  opacity: 0,
  duration: 0.8,
  ease: "power2.out",
});

// Легка безкінечна "магія" заголовка (невеликий пульс)
gsap.to(".title", {
  scale: 1.03,
  duration: 2,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut",
});

// Обробка форми
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const cityName = input.value.trim();
  if (!cityName) return;

  statusEl.textContent = `Шукаю місто "${cityName}"...`;
  cardsContainer.innerHTML = "";

  getCityCoordinates(cityName);
});

// ---------- API: геокодинг + погода (fetch) ----------

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

  // GSAP-анімація карток після рендеру
  animateWeatherCards();
}

// ---------- GSAP анімація карток погоди ----------

function animateWeatherCards() {
  gsap.from(".weather-card", {
    opacity: 0,
    y: 30,
    duration: 0.5,
    stagger: 0.1,
    ease: "power2.out",
  });
}

// ---------- GSAP демо-анімації (5 штук) ----------

// 1. Пульс коробок (масштаб вгору-вниз)
const pulseBtn = document.getElementById("gsap-pulse-btn");
pulseBtn.addEventListener("click", () => {
  gsap.to(".gsap-box", {
    scale: 1.2,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    ease: "power1.inOut",
  });
});

// 2. Струсити коробки (маленький shake)
const shakeBtn = document.getElementById("gsap-shake-btn");
shakeBtn.addEventListener("click", () => {
  gsap.fromTo(
    ".gsap-box",
    { x: -5 },
    { x: 5, duration: 0.05, yoyo: true, repeat: 7, ease: "power1.inOut" }
  );
});

// 3. Обертання коробок
const spinBtn = document.getElementById("gsap-spin-btn");
spinBtn.addEventListener("click", () => {
  gsap.to(".gsap-box", {
    rotationY: "+=360",
    duration: 0.8,
    ease: "back.out(1.7)",
  });
});

// 4. Розкидати хаотично
const randomBtn = document.getElementById("gsap-random-btn");
randomBtn.addEventListener("click", () => {
  gsap.to(".gsap-box", {
    x: () => gsap.utils.random(-80, 80),
    y: () => gsap.utils.random(-40, 40),
    duration: 0.6,
    ease: "power2.out",
  });
});

// 5. Повернути як було
const resetBtn = document.getElementById("gsap-reset-btn");
resetBtn.addEventListener("click", () => {
  gsap.to(".gsap-box", {
    x: 0,
    y: 0,
    rotationY: 0,
    scale: 1,
    duration: 0.5,
    ease: "power2.out",
  });
});
