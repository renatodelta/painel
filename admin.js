// CONFIGURAÇÃO DOS VALORES PADRÃO (FALLBACKS)
const DEFAULT_BIRTHDAYS = [
  { name: "Renato", date: "15/05", member: "renato" },
  { name: "Elizabeth", date: "20/06", member: "elizabeth" },
  { name: "Luiza", date: "10/08", member: "luiza" },
  { name: "Camila", date: "05/10", member: "camila" },
  { name: "Pedro", date: "12/12", member: "pedro" }
];

const DEFAULT_MENU = {
  1: { cafe: ["Pão na Chapa", "Leite", "Mamão", ""], almoco: ["Arroz", "Feijão", "Bife", "Batata"], lanche: ["Sanduíche", "Suco", "Maçã", ""], jantar: ["Omelete", "Salada", "Arroz", ""] }, // Seg
  2: { cafe: ["Iogurte", "Granola", "Banana", ""], almoco: ["Strogonoff", "Arroz", "Batata Palha", ""], lanche: ["Biscoito", "Água Coco", "Uva", ""], jantar: ["Torta Frango", "Salada", "", ""] }, // Ter
  3: { cafe: ["Ovos Mexidos", "Torrada", "Suco", ""], almoco: ["Peixe", "Purê", "Brócolis", ""], lanche: ["Muffin", "Iogurte", "Pera", ""], jantar: ["Wrap Frango", "Salada", "", ""] }, // Qua
  4: { cafe: ["Tapioca", "Café com Leite", "Melão", ""], almoco: ["Carne Panela", "Mandioca", "Arroz", "Feijão"], lanche: ["Bolo de Fubá", "Chá", "Goiaba", ""], jantar: ["Pizza Caseira", "Suco", "", ""] }, // Qui
  5: { cafe: ["Cuscuz", "Ovo Frito", "Suco", ""], almoco: ["Feijoada", "Couve", "Farofa", "Laranja"], lanche: ["Pão de Mel", "Suco", "Melão", ""], jantar: ["Lanche Natural", "Suco", "", ""] }, // Sex
  6: { cafe: ["Waffles", "Geleia", "Morangos", ""], almoco: ["Churrasco", "Pão de Alho", "Farofa", ""], lanche: ["Sorvete", "Cookie", "", ""], jantar: ["Hambúrguer", "Batata Frita", "", ""] }, // Sáb
  0: { cafe: ["Panquecas", "Suco Laranja", "Frutas", ""], almoco: ["Arroz", "Feijão", "Ovo Frito", "Salada"], lanche: ["Bolo", "Café", "Biscoito", ""], jantar: ["Sopa", "Torradas", "", ""] } // Dom
};

const DAY_NAMES = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
  0: "Domingo"
};

// ESTADO GLOBAL
let currentBirthdays = [];
let currentMenu = {};
let currentTransitionTime = 15;
let currentWeatherLocation = {
  city: "São José dos Campos",
  lat: -23.1791,
  lon: -45.8872
};
let currentCountdown = {
  targetDate: "2026-06-26",
  label: "aniversário Pedro Henrique"
};
let currentBackgroundMusic = {
  enabled: false,
  url: "",
  volume: 25
};

let testAudioEl = null;

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  initGeneralTab();
  initMusicTab();
  initPhotosTab();
  initMenuTab();
  renderBirthdaysList();
});

// Alternância de Abas
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => {
    const attr = btn.getAttribute('onclick');
    return attr && attr.includes(tabId);
  });
  if (targetBtn) targetBtn.classList.add('active');
  
  const targetContent = document.getElementById(tabId);
  if (targetContent) targetContent.classList.add('active');
}

// Carregar dados salvos do D1 / settings.php (com fallback no localStorage)
async function loadData() {
  try {
    const response = await fetch('settings.php');
    if (response.ok) {
      const settings = await response.json();
      if (settings && !settings.error) {
        if (settings.photoTransitionTime) currentTransitionTime = parseInt(settings.photoTransitionTime);
        if (settings.birthdays) currentBirthdays = settings.birthdays;
        else currentBirthdays = DEFAULT_BIRTHDAYS;

        if (settings.menuSemana) currentMenu = settings.menuSemana;
        else currentMenu = DEFAULT_MENU;

        if (settings.weatherLocation) currentWeatherLocation = settings.weatherLocation;
        if (settings.countdown) currentCountdown = settings.countdown;
        if (settings.backgroundMusic) currentBackgroundMusic = settings.backgroundMusic;

        console.log("Configurações carregadas com sucesso via API!");
        return;
      }
    }
  } catch (err) {
    console.warn("Erro ao buscar dados remotos, caindo no localStorage:", err);
  }

  // Fallback: ler do localStorage
  const savedTransition = localStorage.getItem("photoTransitionTime");
  currentTransitionTime = savedTransition ? parseInt(savedTransition) : 15;

  const savedBirthdays = localStorage.getItem("birthdays");
  currentBirthdays = savedBirthdays ? JSON.parse(savedBirthdays) : DEFAULT_BIRTHDAYS;

  const savedMenu = localStorage.getItem("menuSemana");
  currentMenu = savedMenu ? JSON.parse(savedMenu) : DEFAULT_MENU;

  const savedWeather = localStorage.getItem("weatherLocation");
  if (savedWeather) currentWeatherLocation = JSON.parse(savedWeather);

  const savedCountdown = localStorage.getItem("countdown");
  if (savedCountdown) currentCountdown = JSON.parse(savedCountdown);

  const savedMusic = localStorage.getItem("backgroundMusic");
  if (savedMusic) currentBackgroundMusic = JSON.parse(savedMusic);
}

// Inicializar aba Geral & Clima & Contagem
function initGeneralTab() {
  const cityInput = document.getElementById("weather-city-input");
  const latInput = document.getElementById("weather-lat-input");
  const lonInput = document.getElementById("weather-lon-input");

  if (cityInput) cityInput.value = currentWeatherLocation.city || "";
  if (latInput) latInput.value = currentWeatherLocation.lat || "";
  if (lonInput) lonInput.value = currentWeatherLocation.lon || "";

  const countdownLabel = document.getElementById("countdown-label-input");
  const countdownDate = document.getElementById("countdown-date-input");

  if (countdownLabel) countdownLabel.value = currentCountdown.label || "aniversário Pedro Henrique";
  if (countdownDate) countdownDate.value = currentCountdown.targetDate || "2026-06-26";
}

// Buscar coordenadas via Open-Meteo Geocoding API gratuita
async function lookupCityCoordinates() {
  const cityInput = document.getElementById("weather-city-input");
  const latInput = document.getElementById("weather-lat-input");
  const lonInput = document.getElementById("weather-lon-input");

  const query = cityInput.value.trim();
  if (!query) {
    alert("Digite o nome da cidade para buscar.");
    return;
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=pt&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.results && data.results.length > 0) {
      const result = data.results[0];
      const lat = parseFloat(result.latitude.toFixed(4));
      const lon = parseFloat(result.longitude.toFixed(4));
      const resolvedName = result.admin1 ? `${result.name}, ${result.admin1}` : result.name;

      cityInput.value = resolvedName;
      latInput.value = lat;
      lonInput.value = lon;

      currentWeatherLocation = {
        city: resolvedName,
        lat: lat,
        lon: lon
      };

      alert(`Localização encontrada: ${resolvedName} (${lat}, ${lon})`);
    } else {
      alert("Cidade não encontrada. Tente incluir o estado ou país (ex: 'São José dos Campos, SP').");
    }
  } catch (err) {
    console.error("Erro na busca de coordenadas:", err);
    alert("Erro ao conectar com o serviço de geocodificação. Você pode preencher Latitude e Longitude manualmente.");
  }
}

// Sincronizar contagem com o próximo aniversário da lista
function syncWithNextBirthday() {
  if (!currentBirthdays || currentBirthdays.length === 0) {
    alert("Nenhum aniversariante cadastrado na aba Aniversários.");
    return;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const currentYear = now.getFullYear();

  let nextBday = null;
  let minDaysDiff = Infinity;
  let nextDateObj = null;

  currentBirthdays.forEach(b => {
    const [day, month] = b.date.split("/").map(Number);
    // Tenta aniversário neste ano
    let bdayDate = new Date(currentYear, month - 1, day);
    if (bdayDate < now) {
      // Já passou este ano, joga para o próximo ano
      bdayDate = new Date(currentYear + 1, month - 1, day);
    }

    const diffDays = Math.ceil((bdayDate - now) / (1000 * 60 * 60 * 24));
    if (diffDays < minDaysDiff) {
      minDaysDiff = diffDays;
      nextBday = b;
      nextDateObj = bdayDate;
    }
  });

  if (nextBday && nextDateObj) {
    const formattedDate = nextDateObj.toISOString().split("T")[0]; // YYYY-MM-DD
    const labelInput = document.getElementById("countdown-label-input");
    const dateInput = document.getElementById("countdown-date-input");

    if (labelInput) labelInput.value = `aniversário de ${nextBday.name}`;
    if (dateInput) dateInput.value = formattedDate;

    currentCountdown = {
      label: `aniversário de ${nextBday.name}`,
      targetDate: formattedDate
    };

    alert(`Sincronizado com o próximo aniversário: ${nextBday.name} em ${nextBday.date} (${minDaysDiff} dias restante(s)).`);
  }
}

// Inicializar aba de Música de Fundo
function initMusicTab() {
  const enabledInput = document.getElementById("music-enabled");
  const urlInput = document.getElementById("music-url-input");
  const volumeInput = document.getElementById("music-volume");
  const volumeLabel = document.getElementById("music-volume-label");

  if (enabledInput) enabledInput.checked = !!currentBackgroundMusic.enabled;
  if (urlInput) urlInput.value = currentBackgroundMusic.url || "";
  if (volumeInput) {
    volumeInput.value = currentBackgroundMusic.volume !== undefined ? currentBackgroundMusic.volume : 25;
    if (volumeLabel) volumeLabel.textContent = `${volumeInput.value}%`;

    volumeInput.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      if (volumeLabel) volumeLabel.textContent = `${val}%`;
      currentBackgroundMusic.volume = val;
      if (testAudioEl) {
        testAudioEl.volume = val / 100;
      }
    });
  }
}

// Preencher sugestão de música rápida
function setMusicPreset(url, title) {
  const urlInput = document.getElementById("music-url-input");
  const enabledInput = document.getElementById("music-enabled");

  if (urlInput) urlInput.value = url;
  if (enabledInput) enabledInput.checked = true;

  currentBackgroundMusic.url = url;
  currentBackgroundMusic.enabled = true;
}

// Testar áudio no Admin
function toggleTestAudio() {
  const btn = document.getElementById("btn-test-music");
  const urlInput = document.getElementById("music-url-input");
  const volumeInput = document.getElementById("music-volume");
  const testContainer = document.getElementById("admin-audio-test-container");

  const url = urlInput ? urlInput.value.trim() : "";
  if (!url) {
    alert("Insira um link do YouTube ou áudio para testar.");
    return;
  }

  // Se já estiver tocando, parar
  if (btn.classList.contains("playing")) {
    if (testAudioEl) {
      testAudioEl.pause();
      testAudioEl.src = "";
    }
    if (testContainer) testContainer.innerHTML = "";
    btn.classList.remove("playing");
    btn.innerHTML = '<i class="fa-solid fa-play"></i> Testar Áudio';
    return;
  }

  // Iniciar teste
  btn.classList.add("playing");
  btn.innerHTML = '<i class="fa-solid fa-stop"></i> Parar Teste';

  const vol = (volumeInput ? parseInt(volumeInput.value) : 25) / 100;

  // Extrair ID do YouTube se for link do YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|live\/|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    testContainer.innerHTML = `
      <iframe width="1" height="1" 
        src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1" 
        frameborder="0" allow="autoplay">
      </iframe>
    `;
  } else {
    // Áudio direto / WebRadio
    if (!testAudioEl) {
      testAudioEl = new Audio();
    }
    testAudioEl.src = url;
    testAudioEl.volume = vol;
    testAudioEl.play().catch(e => {
      alert("Não foi possível reproduzir este link de áudio: " + e.message);
      btn.classList.remove("playing");
      btn.innerHTML = '<i class="fa-solid fa-play"></i> Testar Áudio';
    });
  }
}

// Formatar tempo em segundos para exibição legível
function formatTimeLabel(seconds) {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}min ${remainingSeconds}s` : `${minutes}min`;
  }
  return `${seconds}s`;
}

// Inicializar aba de Fotos
function initPhotosTab() {
  const slider = document.getElementById("photo-transition");
  const label = document.getElementById("photo-transition-label");
  if (!slider) return;
  
  slider.value = currentTransitionTime;
  if (label) label.textContent = formatTimeLabel(currentTransitionTime);
  
  slider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    if (label) label.textContent = formatTimeLabel(val);
    currentTransitionTime = val;
  });
}

// Inicializar aba de Cardápio
function initMenuTab() {
  const container = document.getElementById("menu-grid-container");
  if (!container) return;
  container.innerHTML = "";

  const weekDaysOrder = [1, 2, 3, 4, 5, 6, 0];

  weekDaysOrder.forEach(dayIndex => {
    const dayData = currentMenu[dayIndex] || { cafe: ["", "", "", ""], almoco: ["", "", "", ""], lanche: ["", "", "", ""], jantar: ["", "", "", ""] };
    const dayCard = document.createElement("div");
    dayCard.className = "menu-day-col";
    
    let html = `<div class="day-title">${DAY_NAMES[dayIndex]}</div>`;
    
    const meals = [
      { key: "cafe", label: "Café" },
      { key: "almoco", label: "Almoço" },
      { key: "lanche", label: "Lanche" },
      { key: "jantar", label: "Jantar" }
    ];

    meals.forEach(meal => {
      const items = dayData[meal.key] || ["", "", "", ""];
      const value = items.filter(i => i.trim() !== "").join(", ");
      
      html += `
        <div class="meal-input-group">
          <div class="meal-label">${meal.label}</div>
          <input type="text" 
                 class="meal-input" 
                 data-day="${dayIndex}" 
                 data-meal="${meal.key}" 
                 value="${value}"
                 placeholder="Ex: Arroz, Feijão, Carne">
        </div>
      `;
    });

    dayCard.innerHTML = html;
    container.appendChild(dayCard);
  });
}

// Renderizar lista de aniversariantes
function renderBirthdaysList() {
  const container = document.getElementById("birthdays-list-container");
  if (!container) return;
  container.innerHTML = "";

  if (currentBirthdays.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-dim); font-size: 14px; padding: 20px;">Nenhum aniversariante cadastrado.</div>`;
    return;
  }

  const sorted = [...currentBirthdays].sort((a, b) => {
    const [dayA, monthA] = a.date.split("/").map(Number);
    const [dayB, monthB] = b.date.split("/").map(Number);
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  sorted.forEach((bday, index) => {
    const card = document.createElement("div");
    card.className = "bday-card";
    
    const avatarLetter = bday.name ? bday.name[0].toUpperCase() : "?";
    
    card.innerHTML = `
      <div class="bday-card-left">
        <div class="bday-avatar" style="background-color: var(--${bday.member || 'generic'})">${avatarLetter}</div>
        <div class="bday-info">
          <span class="bday-name">${bday.name}</span>
          <span class="bday-date">${bday.date}</span>
        </div>
      </div>
      <button class="btn-delete" onclick="deleteBirthday(${index})" title="Excluir">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    
    container.appendChild(card);
  });
}

// Adicionar Aniversariante
function addBirthday() {
  const nameInput = document.getElementById("bday-name");
  const dateInput = document.getElementById("bday-date");
  const memberRadio = document.querySelector('input[name="bday-member"]:checked');

  const name = nameInput.value.trim();
  const date = dateInput.value.trim();

  if (!name) {
    alert("Por favor, insira o nome.");
    return;
  }

  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
  if (!dateRegex.test(date)) {
    alert("Formato de data inválido. Use DD/MM (ex: 20/06).");
    return;
  }

  const member = memberRadio ? memberRadio.value : "generic";

  currentBirthdays.push({ name, date, member });
  
  nameInput.value = "";
  dateInput.value = "";
  
  renderBirthdaysList();
}

// Excluir Aniversariante
function deleteBirthday(index) {
  const sorted = [...currentBirthdays].sort((a, b) => {
    const [dayA, monthA] = a.date.split("/").map(Number);
    const [dayB, monthB] = b.date.split("/").map(Number);
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  const target = sorted[index];
  
  const realIndex = currentBirthdays.findIndex(b => b.name === target.name && b.date === target.date);
  if (realIndex !== -1) {
    currentBirthdays.splice(realIndex, 1);
  }

  renderBirthdaysList();
}

// Salvar todas as configurações
async function saveAllSettings() {
  // 1. Coletar cardápio
  const newMenu = {};
  document.querySelectorAll(".meal-input").forEach(input => {
    const day = parseInt(input.getAttribute("data-day"));
    const meal = input.getAttribute("data-meal");
    const val = input.value.trim();

    const items = val ? val.split(",").map(i => i.trim()).filter(i => i.length > 0) : [];
    while (items.length < 4) {
      items.push("");
    }

    if (!newMenu[day]) {
      newMenu[day] = {};
    }
    newMenu[day][meal] = items.slice(0, 4);
  });

  // 2. Coletar Geral & Clima & Contagem
  const cityInput = document.getElementById("weather-city-input");
  const latInput = document.getElementById("weather-lat-input");
  const lonInput = document.getElementById("weather-lon-input");

  currentWeatherLocation = {
    city: cityInput ? cityInput.value.trim() : (currentWeatherLocation.city || "São José dos Campos"),
    lat: latInput && latInput.value ? parseFloat(latInput.value) : (currentWeatherLocation.lat || -23.1791),
    lon: lonInput && lonInput.value ? parseFloat(lonInput.value) : (currentWeatherLocation.lon || -45.8872)
  };

  const countdownLabel = document.getElementById("countdown-label-input");
  const countdownDate = document.getElementById("countdown-date-input");

  currentCountdown = {
    label: countdownLabel ? countdownLabel.value.trim() : (currentCountdown.label || "aniversário Pedro Henrique"),
    targetDate: countdownDate && countdownDate.value ? countdownDate.value : (currentCountdown.targetDate || "2026-06-26")
  };

  // 3. Coletar Música de Fundo
  const musicEnabled = document.getElementById("music-enabled");
  const musicUrl = document.getElementById("music-url-input");
  const musicVol = document.getElementById("music-volume");

  currentBackgroundMusic = {
    enabled: musicEnabled ? musicEnabled.checked : false,
    url: musicUrl ? musicUrl.value.trim() : "",
    volume: musicVol ? parseInt(musicVol.value) : 25
  };

  const payload = {
    photoTransitionTime: currentTransitionTime,
    birthdays: currentBirthdays,
    menuSemana: newMenu,
    weatherLocation: currentWeatherLocation,
    countdown: currentCountdown,
    backgroundMusic: currentBackgroundMusic
  };

  // 4. Salvar via settings.php (Cloudflare D1 ou PHP Local)
  try {
    const response = await fetch('settings.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const resData = await response.json();
    if (resData.error) {
      throw new Error(resData.error);
    }
    console.log("Configurações salvas no servidor com sucesso!");
  } catch (err) {
    console.warn("Falha ao salvar no backend, mantendo localmente:", err);
  }

  // 5. Backup local imediato
  localStorage.setItem("photoTransitionTime", currentTransitionTime.toString());
  localStorage.setItem("birthdays", JSON.stringify(currentBirthdays));
  localStorage.setItem("menuSemana", JSON.stringify(newMenu));
  localStorage.setItem("weatherLocation", JSON.stringify(currentWeatherLocation));
  localStorage.setItem("countdown", JSON.stringify(currentCountdown));
  localStorage.setItem("backgroundMusic", JSON.stringify(currentBackgroundMusic));

  // Exibir Toast de confirmação
  const toast = document.getElementById("toast");
  if (toast) {
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}
