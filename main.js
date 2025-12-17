import { gsap } from "gsap";

console.log("Magic Weather with GSAP ✨");

// ===== БАЗОВІ ЕЛЕМЕНТИ =====
const form = document.getElementById("city-form");
const input = document.getElementById("city-input");
const cardsContainer = document.getElementById("weather-cards");
const statusEl = document.getElementById("status-message");
const animationLayer = document.getElementById("weather-animation-layer");

if (!form || !input || !cardsContainer || !statusEl || !animationLayer) {
  console.error("Не знайдено необхідні елементи на сторінці");
}

// ===== GSAP АНІМАЦІЇ ХЕДЕРА =====

gsap.from(".header", {
  y: -40,
  opacity: 0,
  duration: 0.8,
  ease: "power2.out",
});

gsap.to(".title", {
  scale: 1.03,
  duration: 2,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut",
});

// ===== МАГІЧНІ ПЕРЕДБАЧЕННЯ =====

const magicalForecasts = {
  clear: [
    "Сонце дарує натхнення ✨",
    "Світло всередині вас сильніше за будь-яку погоду 💛",
    "Сьогодні день здійснення маленьких мрій 🌞",
  ],
  cloudy: [
    "Небо думає… як і ви ☁️",
    "Трохи тіней — щоб світити яскравіше 💫",
    "Хмари не затримають вашої ясності ✨",
  ],
  fog: [
    "Туман знімає зайвий шум 🌫️",
    "Попереду — ясність, крок за кроком ✨",
    "Не бійтеся пауз — у них народжується сила 💛",
  ],
  snow: [
    "Сніжинки приносять ніжність ❄️",
    "Хай м'якість дня торкнеться серця ☕",
    "Сьогодні світ лагідніший, ніж здається ✨",
  ],
  rain: [
    "Дощ оновлює — дозвольте зайвому піти 🌧️",
    "Найкращий день для турботи про себе 💙",
    "Хай краплі змиють втому та сумніви ✨",
  ],
  wind: [
    "Вітер приносить зміни ✨",
    "Ваш день підтримано повітрям 💨",
    "Нове вже на порозі — вдихніть глибше 🌬️",
  ],
  storm: [
    "Сила в повітрі — і у вас теж ⚡",
    "Грози народжують великі зміни ✨",
    "Щось вражаюче вже близько 💛",
  ],
  default: [
    "Спокій лікує — і сьогодні він поруч 🌿",
    "Ваш імунітет сьогодні у режимі 'герой' 🛡️",
    "Пийте воду, дихайте глибше, сяйте яскравіше ✨",
  ],
};

function getWeatherType(code) {
  if (code === 0) return "clear";
  if ([1, 2, 3].includes(code)) return "cloudy";
  if ([45, 48].includes(code)) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 95 && code <= 99) return "storm";
  // для анімацій default будемо вважати як "wind"
  return "wind";
}

function getMagicText(type) {
  const arr = magicalForecasts[type] || magicalForecasts.default;
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

// ===== ЛОГІКА ФОРМИ =====

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const cityName = input.value.trim();
  if (!cityName) return;

  statusEl.textContent = `Шукаю місто "${cityName}"...`;
  cardsContainer.innerHTML = "";
  clearWeatherAnimation();

  getCityCoordinates(cityName);
});

// ===== РОБОТА З API (GEOCODING + FORECAST) =====

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

    const codes = data.daily.weathercode;
    if (codes && codes.length > 0) {
      const todayCode = codes[0];
      const type = getWeatherType(todayCode);
      setWeatherAnimation(type);
    }
  } catch (error) {
    console.error("Помилка завантаження погоди:", error);
    statusEl.textContent = "Сталася помилка при завантаженні погоди.";
  }
}

// ===== РЕНДЕР КАРТОК =====

function renderWeatherCards(daily, cityName) {
  cardsContainer.innerHTML = "";

  const dates = daily.time;
  const tempsMax = daily.temperature_2m_max;
  const tempsMin = daily.temperature_2m_min;
  const codes = daily.weathercode;

  dates.forEach((date, index) => {
    const code = codes[index];
    const type = getWeatherType(code);
    const magic = getMagicText(type);

    const card = document.createElement("div");
    card.classList.add("weather-card");

    card.innerHTML = `
      <h3>${cityName}</h3>
      <p><strong>${date}</strong></p>
      <p>Макс: ${tempsMax[index]}°C</p>
      <p>Мін: ${tempsMin[index]}°C</p>
      <p class="magic-text">${magic}</p>
    `;

    cardsContainer.appendChild(card);
  });

  if (dates.length === 0) {
    statusEl.textContent = "Немає даних для відображення.";
  }

  animateWeatherCards();
}

// Анімація карток
function animateWeatherCards() {
  gsap.from(".weather-card", {
    opacity: 0,
    y: 30,
    duration: 0.5,
    stagger: 0.1,
    ease: "power2.out",
  });
}

// ===== АНІМАЦІЇ ПОГОДИ (ШАР) =====

function clearWeatherAnimation() {
  animationLayer.innerHTML = "";
}

function setWeatherAnimation(type) {
  clearWeatherAnimation();

  // fog -> блискітки; default уже замінили на wind у getWeatherType
  let actualType = type;
  if (!["clear", "cloudy", "fog", "snow", "rain", "wind", "storm"].includes(type)) {
    actualType = "wind";
  }

  const width = animationLayer.clientWidth || 800;
  const height = animationLayer.clientHeight || 500;

  function randomX() {
    return Math.random() * width;
  }

  function randomY() {
    return Math.random() * height;
  }

  // створюємо певну кількість елементів в залежності від типу
  if (actualType === "clear") {
    for (let i = 0; i < 6; i++) {
      const el = document.createElement("div");
      el.classList.add("wa-sun");
      el.style.left = randomX() + "px";
      el.style.bottom = "-40px";
      el.style.animationDuration = 10 + Math.random() * 8 + "s";
      el.style.animationDelay = Math.random() * 5 + "s";
      animationLayer.appendChild(el);
    }
  }

  if (actualType === "cloudy") {
    for (let i = 0; i < 5; i++) {
      const el = document.createElement("div");
      el.classList.add("wa-cloud");
      el.style.top = 20 + Math.random() * 80 + "px";
      el.style.left = -80 - Math.random() * 80 + "px";
      el.style.animationDuration = 20 + Math.random() * 10 + "s";
      animationLayer.appendChild(el);
    }
  }

  if (actualType === "rain") {
    for (let i = 0; i < 50; i++) {
      const el = document.createElement("div");
      el.classList.add("wa-raindrop");
      el.style.left = Math.random() * width + "px";
      el.style.top = -60 - Math.random() * 80 + "px";
      el.style.animationDuration = 1.8 + Math.random() * 0.8 + "s";
      el.style.animationDelay = Math.random() * 1.5 + "s";
      animationLayer.appendChild(el);
    }
  }

  if (actualType === "snow") {
    for (let i = 0; i < 35; i++) {
      const el = document.createElement("div");
      el.classList.add("wa-snowflake");
      el.textContent = "✻";
      el.style.left = Math.random() * width + "px";
      el.style.top = -40 - Math.random() * 60 + "px";
      el.style.animationDuration = 6 + Math.random() * 4 + "s";
      el.style.animationDelay = Math.random() * 3 + "s";
      animationLayer.appendChild(el);
    }
  }

  if (actualType === "wind") {
    for (let i = 0; i < 30; i++) {
      const el = document.createElement("div");
      el.classList.add("wa-leaf");
      el.style.left = -40 - Math.random() * 60 + "px";
      el.style.top = Math.random() * height + "px";
      el.style.animationDuration = 6 + Math.random() * 4 + "s";
      el.style.animationDelay = Math.random() * 3 + "s";
      animationLayer.appendChild(el);
    }
  }

  if (actualType === "storm") {
    // трохи хмар
    for (let i = 0; i < 3; i++) {
      const cloud = document.createElement("div");
      cloud.classList.add("wa-cloud");
      cloud.style.top = 20 + Math.random() * 60 + "px";
      cloud.style.left = -80 - Math.random() * 80 + "px";
      cloud.style.animationDuration = 18 + Math.random() * 8 + "s";
      animationLayer.appendChild(cloud);
    }
    // блискавки
    for (let i = 0; i < 3; i++) {
      const bolt = document.createElement("div");
      bolt.classList.add("wa-lightning");
      bolt.style.left = 80 + Math.random() * (width - 160) + "px";
      bolt.style.top = 20 + Math.random() * 80 + "px";
      bolt.style.animationDuration = 4 + Math.random() * 3 + "s";
      bolt.style.animationDelay = Math.random() * 3 + "s";
      animationLayer.appendChild(bolt);
    }
  }

  if (actualType === "fog") {
    for (let i = 0; i < 25; i++) {
      const el = document.createElement("div");
      el.classList.add("wa-sparkle");
      el.style.left = Math.random() * width + "px";
      el.style.top = 40 + Math.random() * (height - 80) + "px";
      el.style.animationDuration = 3 + Math.random() * 2 + "s";
      el.style.animationDelay = Math.random() * 2 + "s";
      animationLayer.appendChild(el);
    }
  }
}

// ===== GSAP DEMО-КНОПКИ =====

const pulseBtn = document.getElementById("gsap-pulse-btn");
const shakeBtn = document.getElementById("gsap-shake-btn");
const spinBtn = document.getElementById("gsap-spin-btn");
const randomBtn = document.getElementById("gsap-random-btn");
const resetBtn = document.getElementById("gsap-reset-btn");

if (pulseBtn && shakeBtn && spinBtn && randomBtn && resetBtn) {
  pulseBtn.addEventListener("click", () => {
    gsap.to(".gsap-box", {
      scale: 1.2,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
    });
  });

  shakeBtn.addEventListener("click", () => {
    gsap.fromTo(
      ".gsap-box",
      { x: -5 },
      { x: 5, duration: 0.05, yoyo: true, repeat: 7, ease: "power1.inOut" }
    );
  });

  spinBtn.addEventListener("click", () => {
    gsap.to(".gsap-box", {
      rotationY: "+=360",
      duration: 0.8,
      ease: "back.out(1.7)",
    });
  });

  randomBtn.addEventListener("click", () => {
    gsap.to(".gsap-box", {
      x: () => gsap.utils.random(-80, 80),
      y: () => gsap.utils.random(-40, 40),
      duration: 0.6,
      ease: "power2.out",
    });
  });

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
}
