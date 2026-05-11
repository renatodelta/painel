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

let photoUrls = ['assets/family.png'];
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
    
    // Espaços vazios
    for (let i = 0; i < firstDay; i++) {
        container.innerHTML += '<div class="day-cell empty"></div>';
    }
    
    // Dias do mês
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

// Frase Estoica
function updateQuote() {
    const quoteEl = document.getElementById('stoic-quote');
    const authorEl = document.getElementById('stoic-author');
    const randomQuote = STOIC_QUOTES[Math.floor(Math.random() * STOIC_QUOTES.length)];
    
    if (quoteEl) quoteEl.textContent = `"${randomQuote.text}"`;
    if (authorEl) authorEl.textContent = `— ${randomQuote.author}`;
}

// Google Photos Slideshow (Simplificado com Fallback)
async function fetchGooglePhotos() {
    try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(GOOGLE_PHOTOS_ALBUM_URL)}`;
        const response = await fetch(proxyUrl);
        const text = await response.text();
        const regex = /https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9\-_]+/g;
        const matches = text.match(regex);

        if (matches && matches.length > 0) {
            photoUrls = [...new Set(matches)].filter(url => url.length > 100).slice(0, 30);
            document.getElementById('photo-status').textContent = `${photoUrls.length} Fotos da Família`;
        }
    } catch (e) {
        console.warn("Usando fotos locais/fallback.");
    }
    startSlideshow();
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
    fetchGooglePhotos();
    
    setInterval(updateClock, 60000);
    setInterval(updateQuote, 3600000); // Muda frase a cada hora
}

init();
