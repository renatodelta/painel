// CONFIGURAÇÃO
const GOOGLE_PHOTOS_ALBUM_URL = 'https://photos.app.goo.gl/VkN2FW93G73WFqhG7';

const STOIC_QUOTES = [
    { text: "A felicidade de sua vida depende da qualidade de seus pensamentos.", author: "Marco Aurélio" },
    { text: "Não espere que os eventos aconteçam como você deseja; deseje que eles aconteçam como acontecem.", author: "Epiteto" },
    { text: "A sorte é o que acontece quando a preparação encontra a oportunidade.", author: "Sêneca" },
    { text: "É nas dificuldades que o homem se conhece.", author: "Epiteto" },
    { text: "Quem é rico? Aquele que está satisfeito com o que tem.", author: "Epiteto" },
    { text: "A vida é muito curta e ansiosa para aqueles que esquecem o passado, negligenciam o presente e temem o futuro.", author: "Sêneca" }
];

const FAMILY_EVENTS = [
    { day: 10, member: 'renato', desc: 'Ciclismo' },
    { day: 10, member: 'pedro', desc: 'Futebol' },
    { day: 12, member: 'elizabeth', desc: 'Reunião' },
    { day: 15, member: 'luiza', desc: 'Balé' },
    { day: 10, member: 'camila', desc: 'Dentista' }
];

const UPCOMING_48H = [
    { time: '14:00', member: 'pedro', desc: 'Treino de Futebol' },
    { time: '18:30', member: 'camila', desc: 'Aula de Inglês' },
    { day: 'Amanhã', time: '09:00', member: 'renato', desc: 'Reunião Diretoria' },
    { day: 'Amanhã', time: '16:00', member: 'elizabeth', desc: 'Médico' }
];

const SHOPPING_LIST = [
    "Leite Integral", "Ovos Caipira", "Pão de Forma", "Banana Nanica",
    "Maçã Gala", "Café em Pó", "Açúcar Refinado", "Arroz Branco",
    "Feijão Preto", "Detergente", "Papel Higiênico", "Sabonete",
    "Manteiga", "Iogurte Natural", "Queijo Prata", "Peito de Peru",
    "Tomate Cereja", "Alface Fresca", "Cebola", "Alho"
];

let photoUrls = [
    "https://lh3.googleusercontent.com/pw/AP1GczPxsvyUBIuEonS1jjQexvjQL9xdYlCfIdRfBJQrpPMZZy_RLe3zBx5VZlG_1UuKSlIC75EbAOZBK0sohXjzHjYju3MsC9vzCcgnMLN44qVAHirpQm0w",
    "https://lh3.googleusercontent.com/pw/AP1GczPYCgypA_Ss36_qhbirHJ_EkFt0k8Y7kvkeKRYBG8Cz1EwIhfu-AxlEeFltjmz-zHT30TPbTM_CGeqPSKEh82jVy9_V7v5TJk7K5Qd08E8ci1rTRm_B",
    "https://lh3.googleusercontent.com/pw/AP1GczPyg1z2svJC9JpmGQeb70usdCgtcvHLQA3-ryQ0S5trj484qFasGzbATN-qo7_psyrhNuulP6XKSaZPJKpED2llnab4QYYOnNVuskiLNnM7tItaNCaZ",
    "https://lh3.googleusercontent.com/pw/AP1GczPYIvIb1YecXzrF5fjS_8BJ9ky8zJHugGrIWX-qFyJX6ECMV-NklxyhTKgaWZAQLOBSF75JmCSEM5HIoHowZzTHZYkW26XrOYpslkDRs3zgkHurdo9h",
    "https://lh3.googleusercontent.com/pw/AP1GczPzcTWqWakjAmPSJMtf4WX-GnGGVOKKRV3FdWbAiYAlb4hExleSCNRGfTR0u25oyYs_UMG8RHbDyhpEnzX5tmu567t0-hvrtHHAzFebsav0LlPxdFEY",
    "https://lh3.googleusercontent.com/pw/AP1GczPzN8m2t3sJKRgvTde62WQjKRw70AbjweuLxC-753R9wTNeThgc8NSem_cCTGnSanSmel95sXNrsZzWCd1ZVjew-nJYSabuYW_YIKWaHYskyxNhp_1-"
];
let currentPhotoIdx = 0;

// Relógio e Data
function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('current-date');

    if (clockEl) clockEl.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (dateEl) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('pt-BR', options);
    }

    // Saudação Dinâmica
    const greetingEl = document.getElementById('greeting');
    if (greetingEl) {
        const hour = now.getHours();
        let greeting = "Boa noite, Família";
        if (hour >= 5 && hour < 12) greeting = "Bom dia, Família";
        else if (hour >= 12 && hour < 18) greeting = "Boa tarde, Família";
        greetingEl.textContent = greeting;
    }

    // Alerta Específico (23:24)
    if (now.getHours() === 23 && now.getMinutes() === 26) {
        playAlertSound();
    }
}

function playAlertSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Tom mais agudo para alerta
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.log("Áudio bloqueado pelo navegador. Interaja com a página primeiro.");
    }
}

// Calendário Mensal
function renderCalendar() {
    const container = document.getElementById('calendar-days');
    if (!container) return;

    container.innerHTML = '';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        container.innerHTML += '<div class="day-cell empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === now.getDate() ? 'today' : '';
        const dayEvents = FAMILY_EVENTS.filter(e => e.day === day);

        let dotsHtml = '<div class="dots-container">';
        dayEvents.forEach(e => {
            dotsHtml += `<div class="dot ${e.member}"></div>`;
        });
        dotsHtml += '</div>';

        container.innerHTML += `
            <div class="day-cell ${isToday}">
                <span class="day-num">${day}</span>
                ${dotsHtml}
            </div>
        `;
    }
}

// Próximas 48h
function renderUpcoming() {
    const list = document.getElementById('upcoming-list');
    if (!list) return;
    list.innerHTML = '';

    UPCOMING_48H.forEach(item => {
        list.innerHTML += `
            <div class="c-item">
                <div class="c-tag" style="background: var(--${item.member})"></div>
                <div class="c-time">${item.day || item.time}</div>
                <div class="c-info"><strong>${item.desc}</strong></div>
            </div>
        `;
    });
}

// Lista de Compras
function renderShoppingList() {
    const list = document.getElementById('shopping-list');
    if (!list) return;
    list.innerHTML = '';

    SHOPPING_LIST.forEach(item => {
        list.innerHTML += `
            <li class="s-item">
                <i class="fa-solid fa-cart-shopping"></i>
                <span>${item}</span>
            </li>
        `;
    });
}

// Frase Estoica
function updateQuote() {
    const quoteEl = document.getElementById('stoic-quote');
    const authorEl = document.getElementById('stoic-author');
    const randomQuote = STOIC_QUOTES[Math.floor(Math.random() * STOIC_QUOTES.length)];

    if (quoteEl) quoteEl.textContent = `"${randomQuote.text}"`;
    if (authorEl) authorEl.textContent = `— ${randomQuote.author}`;
}

// Clima Automático (Open-Meteo)
const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=-23.1791&longitude=-45.8872&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode";

const WMO_ICONS = {
    0: 'fa-sun',
    1: 'fa-cloud-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
    45: 'fa-smog', 48: 'fa-smog',
    51: 'fa-cloud-rain', 53: 'fa-cloud-rain', 55: 'fa-cloud-rain',
    61: 'fa-cloud-showers-heavy', 63: 'fa-cloud-showers-heavy', 65: 'fa-cloud-showers-heavy',
    80: 'fa-cloud-rain', 81: 'fa-cloud-rain', 82: 'fa-cloud-rain',
    95: 'fa-bolt'
};

async function updateWeather() {
    try {
        const response = await fetch(WEATHER_API);
        const data = await response.json();

        // Atualizar Temperatura Atual
        const tempEl = document.getElementById('temp');
        const iconMainEl = document.querySelector('.weather-icon-main i');
        if (tempEl) tempEl.textContent = `${Math.round(data.current_weather.temperature)}°`;
        if (iconMainEl) {
            const code = data.current_weather.weathercode;
            iconMainEl.className = `fa-solid ${WMO_ICONS[code] || 'fa-cloud'}`;
        }

        // Atualizar Hourly Forecast (próximas 4 horas)
        const hourlyContainer = document.querySelector('.hourly-forecast');
        if (hourlyContainer) {
            const nowHour = new Date().getHours();
            let hourlyHtml = '';

            for (let i = 0; i < 4; i++) {
                const hourIdx = nowHour + i;
                const time = `${String(hourIdx % 24).padStart(2, '0')}:00`;
                const temp = Math.round(data.hourly.temperature_2m[hourIdx]);
                const hum = data.hourly.relativehumidity_2m[hourIdx];
                const code = data.hourly.weathercode[hourIdx];
                const active = i === 0 ? 'active' : '';

                hourlyHtml += `
                    <div class="h-item ${active}">
                        <span>${time}</span>
                        <i class="fa-solid ${WMO_ICONS[code] || 'fa-cloud'}"></i>
                        <span class="h-temp">${temp}°</span>
                        <span class="h-hum"><i class="fa-solid fa-droplet"></i> ${hum}%</span>
                    </div>
                `;
            }
            hourlyContainer.innerHTML = hourlyHtml;
        }

        // Alerta de Chuva Simplificado
        const rainAlertEl = document.querySelector('.rain-alert span');
        const next24hWeather = data.hourly.weathercode.slice(nowHour, nowHour + 24);
        const willRain = next24hWeather.some(code => code >= 51);
        if (rainAlertEl) {
            rainAlertEl.textContent = willRain ? "Previsão de chuva nas próximas 24h." : "Tempo estável nas próximas 24h.";
        }

    } catch (error) {
        console.error("Erro ao carregar clima:", error);
    }
}

function startSlideshow() {
    const imgEl = document.getElementById('slideshow-img');
    if (!imgEl) return;

    setInterval(() => {
        currentPhotoIdx = (currentPhotoIdx + 1) % photoUrls.length;
        imgEl.style.opacity = 0;
        setTimeout(() => {
            const baseUrl = photoUrls[currentPhotoIdx];
            imgEl.src = baseUrl.includes('lh3') ? baseUrl + "=w1200" : baseUrl;
            imgEl.style.opacity = 1;
        }, 1500);
    }, 15000);
}

// Inicialização
function init() {
    updateClock();
    renderCalendar();
    renderUpcoming();
    updateQuote();
    renderShoppingList();
    updateWeather();
    startSlideshow();

    setInterval(updateClock, 60000);
    setInterval(updateQuote, 3600000);
    setInterval(updateWeather, 1800000); // Atualiza a cada 30 min
}

init();
