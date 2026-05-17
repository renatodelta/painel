// CONFIGURAÇÃO
const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=-23.1791&longitude=-45.8872&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=2";

const WMO_ICONS = {
    0: 'fa-sun',
    1: 'fa-cloud-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
    45: 'fa-smog', 48: 'fa-smog',
    51: 'fa-cloud-rain', 53: 'fa-cloud-rain', 55: 'fa-cloud-rain',
    61: 'fa-cloud-showers-heavy', 63: 'fa-cloud-showers-heavy', 65: 'fa-cloud-showers-heavy',
    80: 'fa-cloud-rain', 81: 'fa-cloud-rain', 82: 'fa-cloud-rain',
    95: 'fa-bolt'
};

function getWeatherIcon(code, isDay = 1) {
    const suffix = isDay ? 'd' : 'n';
    // Retorna a URL do ícone baseado no código WMO
    if (code === 0) return `https://openweathermap.org/img/wn/01${suffix}@2x.png`; // Sol/Lua
    if (code >= 1 && code <= 3) return `https://openweathermap.org/img/wn/02${suffix}@2x.png`; // Nuvens
    if (code >= 45 && code <= 48) return `https://openweathermap.org/img/wn/50${suffix}@2x.png`; // Névoa
    if (code >= 51 && code <= 67) return `https://openweathermap.org/img/wn/10${suffix}@2x.png`; // Chuva
    if (code >= 80 && code <= 82) return `https://openweathermap.org/img/wn/09${suffix}@2x.png`; // Chuva forte
    if (code >= 95) return `https://openweathermap.org/img/wn/11${suffix}@2x.png`; // Trovão
    return `https://openweathermap.org/img/wn/03${suffix}@2x.png`; // Nublado padrão
}

const GOOGLE_MAPS_KEY = "AIzaSyBgrEtdMlcFMvIGBXdI_jekrnVVGUNa7I8";
const CALENDAR_ID = "renatodelta@gmail.com";
const GOOGLE_PHOTOS_ALBUM_URL = 'https://photos.app.goo.gl/VkN2FW93G73WFqhG7';

let fetchedEvents = []; // Armazenará os eventos do Google Calendar
const STOIC_QUOTES = [
    { text: "A felicidade de sua vida depende da qualidade de seus pensamentos.", author: "Marco Aurélio" },
    { text: "Não espere que os eventos aconteçam como você deseja; deseje que eles aconteçam como acontecem.", author: "Epiteto" },
    { text: "A sorte é o que acontece quando a preparação encontra a oportunidade.", author: "Sêneca" },
    { text: "É nas dificuldades que o homem se conhece.", author: "Epiteto" },
    { text: "Quem é rico? Aquele que está satisfeito com o que tem.", author: "Epiteto" },
    { text: "A vida é muito curta e ansiosa para aqueles que esquecem o passado, negligenciam o presente e temem o futuro.", author: "Sêneca" }
];

// Removido FAMILY_EVENTS e UPCOMING_48H manuais pois agora vêm do Google Calendar


const BIRTHDAYS = [
    { name: "Renato", date: "15/05", member: "renato" },
    { name: "Elizabeth", date: "20/06", member: "elizabeth" },
    { name: "Luiza", date: "10/08", member: "luiza" },
    { name: "Camila", date: "05/10", member: "camila" },
    { name: "Pedro", date: "12/12", member: "pedro" }
];

let photoUrls = [
    "https://lh3.googleusercontent.com/pw/AP1GczPxsvyUBIuEonS1jjQexvjQL9xdYlCfIdRfBJQrpPMZZy_RLe3zBx5VZlG_1UuKSlIC75EbAOZBK0sohXjzHjYju3MsC9vzCcgnMLN44qVAHirpQm0w",
    "https://lh3.googleusercontent.com/pw/AP1GczPYCgypA_Ss36_qhbirHJ_EkFt0k8Y7kvkeKRYBG8Cz1EwIhfu-AxlEeFltjmz-zHT30TPbTM_CGeqPSKEh82jVy9_V7v5TJk7K5Qd08E8ci1rTRm_B",
    "https://lh3.googleusercontent.com/pw/AP1GczPyg1z2svJC9JpmGQeb70usdCgtcvHLQA3-ryQ0S5trj484qFasGzbATN-qo7_psyrhNuulP6XKSaZPJKpED2llnab4QYYOnNVuskiLNnM7tItaNCaZ",
    "https://lh3.googleusercontent.com/pw/AP1GczPYIvIb1YecXzrF5fjS_8BJ9ky8zJHugGrIWX-qFyJX6ECMV-NklxyhTKgaWZAQLOBSF75JmCSEM5HIoHowZzTHZYkW26XrOYpslkDRs3zgkHurdo9h",
    "https://lh3.googleusercontent.com/pw/AP1GczPzcTWqWakjAmPSJMtf4WX-GnGGVOKKRV3FdWbAiYAlb4hExleSCNRGfTR0u25oyYs_UMG8RHbDyhpEnzX5tmu567t0-hvrtHHAzFebsav0LlPxdFEY",
    "https://lh3.googleusercontent.com/pw/AP1GczPzN8m2t3sJKRgvTde62WQjKRw70AbjweuLxC-753R9wTNeThgc8NSem_cCTGnSanSmel95sXNrsZzWCd1ZVjew-nJYSabuYW_YIKWaHYskyxNhp_1-"
];

const MENU_SEMANA = {
    0: {
        cafe: ["Panquecas", "Suco Laranja", "Frutas", ""],
        almoco: ["Arroz", "Feijão", "Ovo Frito", "Salada"],
        lanche: ["Bolo", "Café", "Biscoito", ""],
        jantar: ["Sopa", "Torradas", "", ""]
    },
    1: {
        cafe: ["Pão na Chapa", "Leite", "Mamão", ""],
        almoco: ["Arroz", "Feijão", "Bife", "Batata"],
        lanche: ["Sanduíche", "Suco", "Maçã", ""],
        jantar: ["Omelete", "Salada", "Arroz", ""]
    },
    2: {
        cafe: ["Iogurte", "Granola", "Banana", ""],
        almoco: ["Strogonoff", "Arroz", "Batata Palha", ""],
        lanche: ["Biscoito", "Água Coco", "Uva", ""],
        jantar: ["Torta Frango", "Salada", "", ""]
    },
    3: {
        cafe: ["Ovos Mexidos", "Torrada", "Suco", ""],
        almoco: ["Peixe", "Purê", "Brócolis", ""],
        lanche: ["Muffin", "Iogurte", "Pera", ""],
        jantar: ["Wrap Frango", "Salada", "", ""]
    },
    4: {
        cafe: ["Tapioca", "Café com Leite", "Melão", ""],
        almoco: ["Carne Panela", "Mandioca", "Arroz", "Feijão"],
        lanche: ["Bolo de Fubá", "Chá", "Goiaba", ""],
        jantar: ["Pizza Caseira", "Suco", "", ""]
    },
    5: {
        cafe: ["Cuscuz", "Ovo Frito", "Suco", ""],
        almoco: ["Feijoada", "Couve", "Farofa", "Laranja"],
        lanche: ["Pão de Mel", "Suco", "Melão", ""],
        jantar: ["Lanche Natural", "Suco", "", ""]
    },
    6: {
        cafe: ["Waffles", "Geleia", "Morangos", ""],
        almoco: ["Churrasco", "Pão de Alho", "Farofa", ""],
        lanche: ["Sorvete", "Cookie", "", ""],
        jantar: ["Hambúrguer", "Batata Frita", "", ""]
    }
};

const TRASH_SCHEDULE = {
    0: "Não há coleta",
    1: "Orgânico",
    2: "Reciclável",
    3: "Orgânico",
    4: "Reciclável",
    5: "Orgânico",
    6: "Reciclável"
};

const PEDRO_BDAY = "2026-06-26";

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
}

// Aniversariantes do Dia
function renderBirthdays() {
    const list = document.getElementById('birthdays-list');
    if (!list) return;

    const now = new Date();
    const todayStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const todayBirthdays = BIRTHDAYS.filter(b => b.date === todayStr);

    if (todayBirthdays.length === 0) {
        list.innerHTML = '<div class="no-birthdays">Sem aniversários hoje 🎂</div>';
        return;
    }

    list.innerHTML = todayBirthdays.map(b => `
        <div class="birthday-item">
            <div class="b-avatar ${b.member}">${b.name[0]}</div>
            <div class="b-info">
                <span class="b-name">${b.name}</span>
            </div>
        </div>
    `).join('');
}

// Mapeamento de Membros por Palavra-Chave
const MEMBER_KEYWORDS = {
    'renato': ['Ciclismo', 'Trabalho', 'Reunião'],
    'pedro': ['Futebol', 'Treino', 'Escola'],
    'camila': ['Inglês', 'Dentista'],
    'luiza': ['Balé', 'Dança'],
    'elizabeth': ['Médico', 'Consulta', 'Reunião']
};

function getMemberFromText(summary, description) {
    const text = (summary + ' ' + (description || '')).toLowerCase();

    // 1. Checar por nomes diretos (prioridade)
    if (text.includes('renato')) return 'renato';
    if (text.includes('pedro')) return 'pedro';
    if (text.includes('camila')) return 'camila';
    if (text.includes('luiza')) return 'luiza';
    if (text.includes('elizabeth') || text.includes('bete')) return 'elizabeth';

    // 2. Checar por palavras-chave
    for (const [member, keywords] of Object.entries(MEMBER_KEYWORDS)) {
        if (keywords.some(k => text.includes(k.toLowerCase()))) return member;
    }
    return 'generic';
}

// Buscar Eventos do Google Calendar
async function fetchCalendarEvents() {
    const container = document.getElementById('weekly-days');
    try {
        const now = new Date();
        const weekLater = new Date();
        weekLater.setDate(now.getDate() + 7);

        const timeMin = now.toISOString();
        const timeMax = weekLater.toISOString();

        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${GOOGLE_MAPS_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

        const response = await fetch(url);

        if (response.status === 403) {
            if (container) container.innerHTML = '<div class="no-events">Erro 403: Verifique se a agenda está Pública e se a API está ativa.</div>';
            return;
        }

        const data = await response.json();

        if (data.items) {
            fetchedEvents = data.items.map(item => ({
                summary: item.summary,
                description: item.description || '',
                start: item.start.dateTime || item.start.date,
                member: getMemberFromText(item.summary, item.description)
            }));
            renderWeeklyCalendar();
        }
    } catch (error) {
        console.error("Erro ao carregar Google Calendar:", error);
    }
}

// Calendário Semanal
function renderWeeklyCalendar() {
    const container = document.getElementById('weekly-days');
    if (!container) return;

    container.innerHTML = '';
    const now = new Date();

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(now);
        day.setHours(0, 0, 0, 0); // Normalizar para início do dia
        day.setDate(now.getDate() + i);
        weekDays.push(day);
    }

    weekDays.forEach((day, index) => {
        const dayNum = day.getDate();
        const dayName = day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        const isToday = index === 0 ? 'today' : '';

        // Filtrar e agrupar eventos
        const dayEvents = fetchedEvents.filter(e => {
            const eDate = new Date(e.start);
            return eDate.getDate() === dayNum && eDate.getMonth() === day.getMonth();
        });

        // Organizar eventos por membro
        const grouped = {};
        dayEvents.forEach(e => {
            if (!grouped[e.member]) grouped[e.member] = [];
            grouped[e.member].push(e);
        });

        let eventsHtml = '';

        // Ordem de exibição fixa por membro
        const membersOrder = ['renato', 'elizabeth', 'luiza', 'camila', 'pedro', 'generic'];

        membersOrder.forEach(member => {
            if (grouped[member]) {
                eventsHtml += `<div class="member-group ${member}">`;
                eventsHtml += `<div class="member-sub-header">${member === 'generic' ? 'Geral' : member}</div>`;

                grouped[member].forEach(e => {
                    const eDate = new Date(e.start);
                    const isAllDay = !e.start.includes('T');
                    const timeStr = isAllDay ? '' : eDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                    eventsHtml += `
                        <div class="week-event">
                            <span class="event-dot"></span>
                            ${timeStr ? `<span class="event-time">${timeStr}</span>` : ''}
                            <span class="event-desc">${e.summary}</span>
                        </div>
                    `;
                });
                eventsHtml += `</div>`;
            }
        });

        container.innerHTML += `
            <div class="week-day ${isToday}">
                <div class="day-header">
                    <span class="day-num">${dayNum}</span>
                    <span class="day-name">${dayName}</span>
                </div>
                <div class="day-events">
                    ${eventsHtml || '<span class="no-events">-</span>'}
                </div>
            </div>
        `;
    });
}

// Renderizar Cardápio Diário
function renderMenu() {
    const now = new Date();
    const day = now.getDay();
    const menu = MENU_SEMANA[day];

    const sections = ['cafe', 'almoco', 'lanche', 'jantar'];

    sections.forEach(sec => {
        const el = document.getElementById(`menu-${sec}`);
        if (el) {
            let html = '';
            if (menu[sec]) {
                menu[sec].forEach(item => {
                    if (item && item.trim() !== '') {
                        html += `<div class="m-item">${item}</div>`;
                    }
                });
            }
            el.innerHTML = html;
        }
    });
}

// Status da Casa (Lixo, etc)
function renderStatus() {
    const now = new Date();
    const day = now.getDay();
    const trashEl = document.getElementById('trash-status');

    if (trashEl) {
        trashEl.textContent = `Lixo: ${TRASH_SCHEDULE[day]}`;
    }
}

// Mercado via Google Sheets
async function updateMarket() {
    const marketEl = document.getElementById('market-status');
    if (!marketEl) return;

    try {
        const response = await fetch('get_shopping_list.php');
        const items = await response.json();

        if (items && items.length > 0) {
            marketEl.textContent = `Comprar: ${items.join(', ')}`;
        } else {
            marketEl.textContent = `Comprar: Tudo em dia!`;
        }
    } catch (error) {
        console.error("Erro mercado:", error);
    }
}

// Monitor de Trânsito Real (Google Maps SDK)
function updateTraffic() {
    const timeEl = document.getElementById('traffic-time');
    if (!timeEl || !window.google) return;

    const service = new google.maps.DistanceMatrixService();
    const origem = "Condomínio Bell Park, São José dos Campos, SP";
    const destino = "Instituto São José, São José dos Campos, SP";

    service.getDistanceMatrix({
        origins: [origem],
        destinations: [destino],
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS
        },
        unitSystem: google.maps.UnitSystem.METRIC
    }, (response, status) => {
        if (status === "OK") {
            const element = response.rows[0].elements[0];
            if (element.status === "OK") {
                const durationText = element.duration_in_traffic ? element.duration_in_traffic.text : element.duration.text;
                const durationValue = element.duration_in_traffic ? element.duration_in_traffic.value : element.duration.value;

                const minutes = Math.floor(durationValue / 60);
                timeEl.textContent = durationText;
                timeEl.style.color = minutes > 22 ? '#ff453a' : '#32d74b';
            }
        } else {
            console.error("Erro no Google Maps SDK:", status);
            // Fallback simulação
            const randomTime = Math.floor(Math.random() * (25 - 18 + 1) + 18);
            timeEl.textContent = `${randomTime} min`;
        }
    });
}

// Contagem Regressiva
function updateCountdown() {
    const daysEl = document.getElementById('countdown-days');
    if (!daysEl) return;

    const now = new Date();
    const target = new Date(PEDRO_BDAY);
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    daysEl.textContent = days;
}

// Memórias Reais - Google Photos API via PHP
async function updateMemory() {
    const imgEl = document.getElementById('memory-img');
    const captionEl = document.querySelector('.memory-caption');
    if (!imgEl) return;

    try {
        const response = await fetch('get_memories.php');
        const memories = await response.json();

        if (memories && memories.length > 0) {
            const randomIdx = Math.floor(Math.random() * memories.length);
            const memory = memories[randomIdx];

            // Se for link do Google (tem baseUrl), adiciona o tamanho. Se for Unsplash, usa direto.
            const finalUrl = memory.url.includes('googleusercontent') ? memory.url + "=w1200" : memory.url;

            imgEl.style.opacity = 0;

            setTimeout(() => {
                imgEl.src = finalUrl;
                if (captionEl) captionEl.textContent = memory.caption;
                imgEl.style.opacity = 1;
            }, 500);
        }
    } catch (error) {
        console.error("Erro memórias:", error);
    }
}

// Clima Compacto com Previsão de 4h
async function updateWeather() {
    try {
        const response = await fetch(WEATHER_API);
        const data = await response.json();

        // Atual
        const currentTemp = Math.round(data.current_weather.temperature);
        const isDay = data.current_weather.is_day; // Pega se é dia ou noite
        const weatherTempEl = document.getElementById('weather-temp');
        const weatherIconEl = document.getElementById('weather-icon');

        if (weatherTempEl) weatherTempEl.textContent = `${currentTemp}°C`;
        if (weatherIconEl) weatherIconEl.src = getWeatherIcon(data.current_weather.weathercode, isDay);

        // Max/Min
        const maxEl = document.getElementById('weather-max');
        const minEl = document.getElementById('weather-min');
        if (maxEl && data.daily) maxEl.textContent = `↑ ${Math.round(data.daily.temperature_2m_max[0])}°`;
        if (minEl && data.daily) minEl.textContent = `↓ ${Math.round(data.daily.temperature_2m_min[0])}°`;

        // Previsão Próximas 6 horas
        const hourlyContainer = document.getElementById('hourly-forecast');
        if (hourlyContainer && data.hourly) {
            hourlyContainer.innerHTML = '';
            const now = new Date();
            const currentHour = now.getHours();

            for (let i = 1; i <= 6; i++) {
                const hourIdx = currentHour + i;
                const targetHour = hourIdx % 24;
                const isTargetDay = (targetHour >= 6 && targetHour < 18) ? 1 : 0; // Regra: dia entre 6h e 18h
                const temp = Math.round(data.hourly.temperature_2m[hourIdx]);
                const icon = getWeatherIcon(data.hourly.weathercode[hourIdx], isTargetDay);

                hourlyContainer.innerHTML += `
                    <div class="hourly-item">
                        <span class="h-hour">${targetHour}h</span>
                        <img class="h-icon" src="${icon}" alt="Clima">
                        <span class="h-temp">${temp ? temp + '°' : '--°'}</span>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error("Erro clima:", error);
    }
}

// Inicialização
function init() {
    const tasks = [
        updateClock,
        fetchCalendarEvents, // Busca do Google Calendar
        renderBirthdays,
        renderMenu,
        renderStatus,
        updateMarket,
        updateTraffic,
        updateCountdown,
        updateMemory,
        updateWeather
    ];

    tasks.forEach(task => {
        try {
            task();
        } catch (e) {
            console.error(`Erro ao executar ${task.name}:`, e);
        }
    });

    setInterval(updateClock, 60000);
    setInterval(updateWeather, 600000); // 10 min
    setInterval(updateTraffic, 60000); // 1 min
    setInterval(fetchCalendarEvents, 1800000); // 30 min
    setInterval(renderMenu, 3600000);
    setInterval(renderStatus, 3600000); // 1h
    setInterval(updateMarket, 900000); // 15 min
    setInterval(updateMemory, 15000); // Rotacionar memória a cada 15s
}

init();
