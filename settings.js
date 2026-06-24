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

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  initPhotosTab();
  initMenuTab();
  renderBirthdaysList();
});

// Alternância de Abas
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // Ativar aba correspondente
  const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.getAttribute('onclick').includes(tabId));
  if (targetBtn) targetBtn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// Carregar dados salvos ou padrões
function loadData() {
  // 1. Transição das fotos
  const savedTransition = localStorage.getItem("photoTransitionTime");
  currentTransitionTime = savedTransition ? parseInt(savedTransition) : 15;

  // 2. Aniversários
  const savedBirthdays = localStorage.getItem("birthdays");
  currentBirthdays = savedBirthdays ? JSON.parse(savedBirthdays) : DEFAULT_BIRTHDAYS;

  // 3. Cardápio Semanal
  const savedMenu = localStorage.getItem("menuSemana");
  currentMenu = savedMenu ? JSON.parse(savedMenu) : DEFAULT_MENU;
}

// Inicializar aba de Fotos
function initPhotosTab() {
  const slider = document.getElementById("photo-transition");
  const label = document.getElementById("photo-transition-label");
  
  slider.value = currentTransitionTime;
  label.textContent = `${currentTransitionTime}s`;
  
  slider.addEventListener("input", (e) => {
    label.textContent = `${e.target.value}s`;
    currentTransitionTime = parseInt(e.target.value);
  });
}

// Inicializar aba de Cardápio
function initMenuTab() {
  const container = document.getElementById("menu-grid-container");
  container.innerHTML = "";

  // Ordem de exibição da semana na tela: Segunda (1) a Domingo (0)
  const weekDaysOrder = [1, 2, 3, 4, 5, 6, 0];

  weekDaysOrder.forEach(dayIndex => {
    const dayData = currentMenu[dayIndex] || { cafe: ["", "", "", ""], almoco: ["", "", "", ""], lanche: ["", "", "", ""], jantar: ["", "", "", ""] };
    const dayCard = document.createElement("div");
    dayCard.className = "menu-day-col";
    
    let html = `<div class="day-title">${DAY_NAMES[dayIndex]}</div>`;
    
    // Gerar inputs para as 4 refeições
    const meals = [
      { key: "cafe", label: "Café" },
      { key: "almoco", label: "Almoço" },
      { key: "lanche", label: "Lanche" },
      { key: "jantar", label: "Jantar" }
    ];

    meals.forEach(meal => {
      const items = dayData[meal.key] || ["", "", "", ""];
      // Une os itens com vírgula para edição simplificada em uma única linha
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
  container.innerHTML = "";

  if (currentBirthdays.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-dim); font-size: 14px; padding: 20px;">Nenhum aniversariante cadastrado.</div>`;
    return;
  }

  // Ordenar aniversários por mês/dia
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

  // Validação simples da data DD/MM
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
  if (!dateRegex.test(date)) {
    alert("Formato de data inválido. Use DD/MM (ex: 20/06).");
    return;
  }

  const member = memberRadio ? memberRadio.value : "generic";

  currentBirthdays.push({ name, date, member });
  
  // Limpar formulário
  nameInput.value = "";
  dateInput.value = "";
  
  renderBirthdaysList();
}

// Excluir Aniversariante
function deleteBirthday(index) {
  // Como ordenamos para renderizar, precisamos remover o item correto
  const sorted = [...currentBirthdays].sort((a, b) => {
    const [dayA, monthA] = a.date.split("/").map(Number);
    const [dayB, monthB] = b.date.split("/").map(Number);
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  const target = sorted[index];
  
  // Encontra e remove na lista principal
  const realIndex = currentBirthdays.findIndex(b => b.name === target.name && b.date === target.date);
  if (realIndex !== -1) {
    currentBirthdays.splice(realIndex, 1);
  }

  renderBirthdaysList();
}

// Salvar todas as configurações no localStorage
function saveAllSettings() {
  // 1. Salvar tempo de transição das fotos
  localStorage.setItem("photoTransitionTime", currentTransitionTime.toString());

  // 2. Salvar aniversários
  localStorage.setItem("birthdays", JSON.stringify(currentBirthdays));

  // 3. Salvar cardápio
  const newMenu = {};
  document.querySelectorAll(".meal-input").forEach(input => {
    const day = parseInt(input.getAttribute("data-day"));
    const meal = input.getAttribute("data-meal");
    const val = input.value.trim();

    // Divide a string por vírgulas e limpa os espaços individuais de cada prato
    const items = val ? val.split(",").map(i => i.trim()).filter(i => i.length > 0) : [];
    // Ajusta o array para ter sempre 4 posições (para manter compatibilidade com o layout do front)
    while (items.length < 4) {
      items.push("");
    }

    if (!newMenu[day]) {
      newMenu[day] = {};
    }
    newMenu[day][meal] = items.slice(0, 4); // garante no máximo 4 pratos
  });

  localStorage.setItem("menuSemana", JSON.stringify(newMenu));

  // Exibir Toast de confirmação
  const toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
