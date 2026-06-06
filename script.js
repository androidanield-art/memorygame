const gameBoard = document.getElementById('game-board');
const moveDisplay = document.getElementById('move-counter');
const resetBtn = document.getElementById('reset-button');
const pairSelector = document.getElementById('pair-selector');
const entryScreen = document.getElementById('entry-screen');
const startBtn = document.getElementById('start-button');
const nicknameInput = document.getElementById('nickname');
const gameHeader = document.getElementById('game-header');
const victoryModal = document.getElementById('victory-modal');
const winnerNameSpan = document.getElementById('winner-name');
const finalMovesSpan = document.getElementById('final-moves');
const playAgainBtn = document.getElementById('play-again-button');
const rankingList = document.getElementById('ranking-list');
const countrySelector = document.getElementById('country-selector');
const homeRankingList = document.getElementById('home-ranking-list');
const homeRankSelector = document.getElementById('home-rank-selector');
const backBtn = document.getElementById('back-button');

// ADICIONE SUA ANON KEY DO SUPABASE AQUI
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibXRhZGdleWpvY3llY2RqdXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NjQxODQsImV4cCI6MjA5NjM0MDE4NH0.0qpjjnyjAsBCDIwWgbZtzMHjzIC_doPsO8C_blVN1CU';
const API_URL = 'https://dbmtadgeyjocyecdjusf.supabase.co/rest/v1/ranking';

// Efeitos sonoros
const startSound = new Audio('assets/start.mp3');
const matchSound = new Audio('assets/match.mp3');
const victorySound = new Audio('assets/victory.mp3');

const translations = {
    'pt': {
        'subtitle': 'jogo da memória',
        'label-nickname': 'Seu Nickname',
        'label-difficulty': 'Dificuldade',
        'label-country': 'País',
        'diff-4': '4 Pares (Iniciante)',
        'diff-6': '6 Pares (Intermediário)',
        'diff-8': '8 Pares (Avançado)',
        'diff-10': '10 Pares (Mestre)',
        'btn-start': 'Iniciar Desafio',
        'btn-restart': 'Reiniciar',
        'btn-back': 'Voltar',
        'home-ranking-title': '🏆 Top Global',
        'stats-moves': 'MOVIMENTOS',
        'victory-title': 'MISSÃO CUMPRIDA!',
        'victory-msg': 'Incrível',
        'victory-stats-label': 'VOCÊ PRECISOU DE',
        'ranking-title': '🏆 RANKING DOS BRAVOS',
        'btn-play-again': 'JOGAR NOVAMENTE',
        'placeholder-nickname': 'Ex: SuperBravo'
    },
    'en': {
        'subtitle': 'memory game',
        'label-nickname': 'Your Nickname',
        'label-difficulty': 'Difficulty',
        'label-country': 'Country',
        'diff-4': '4 Pairs (Beginner)',
        'diff-6': '6 Pairs (Intermediate)',
        'diff-8': '8 Pairs (Advanced)',
        'diff-10': '10 Pairs (Master)',
        'btn-start': 'Start Mission',
        'btn-restart': 'Restart',
        'btn-back': 'Back',
        'home-ranking-title': '🏆 Global Top',
        'stats-moves': 'MOVES',
        'victory-title': 'MISSION ACCOMPLISHED!',
        'victory-msg': 'Amazing',
        'victory-stats-label': 'YOU NEEDED',
        'ranking-title': '🏆 BRAVE RANKING',
        'btn-play-again': 'PLAY AGAIN',
        'placeholder-nickname': 'e.g. SuperHero'
    }
};

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let matchedPairs = 0;
let currentPairCount = 10;
let playerName = "";
let playerCountry = "";

const countries = [
    { name: "EUA", flag: "🇺🇸" },
    { name: "Brasil", flag: "🇧🇷" },
    { name: "Portugal", flag: "🇵🇹" },
    { name: "Coreia do Sul", flag: "🇰🇷" },
    { name: "Alemanha", flag: "🇩🇪" },
    { name: "Angola", flag: "🇦🇴" },
    { name: "Argentina", flag: "🇦🇷" },
    { name: "Austrália", flag: "🇦🇺" },
    { name: "Canadá", flag: "🇨🇦" },
    { name: "Chile", flag: "🇨🇱" },
    { name: "China", flag: "🇨🇳" },
    { name: "Espanha", flag: "🇪🇸" },
    { name: "França", flag: "🇫🇷" },
    { name: "Itália", flag: "🇮🇹" },
    { name: "Japão", flag: "🇯🇵" },
    { name: "México", flag: "🇲🇽" },
    { name: "Reino Unido", flag: "🇬🇧" }
];

const init = () => {
    const userLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[userLang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = translations[userLang][key];
    });

    // Atualiza o título da aba do navegador dinamicamente
    const subtitle = translations[userLang]['subtitle'];
    if (subtitle) document.title = `BRAVUS LEAGUE - ${subtitle.charAt(0).toUpperCase() + subtitle.slice(1)}`;

    const firstFour = countries.slice(0, 4);
    const theRest = countries.slice(4).sort((a, b) => a.name.localeCompare(b.name));
    const finalCountryList = [...firstFour, ...theRest];

    if (countrySelector) {
        countrySelector.innerHTML = ''; // Evita duplicar opções ao recarregar
        finalCountryList.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.flag;
            opt.textContent = `${c.flag} ${c.name}`;
            // Auto-seleciona Brasil se for pt-BR, ou EUA se for en-US
            if (userLang === 'pt' && c.name === 'Brasil') opt.selected = true;
            if (userLang === 'en' && c.name === 'EUA') opt.selected = true;
            countrySelector.appendChild(opt);
        });
    }

    gameBoard.innerHTML = '';
    renderRanking(homeRankingList, parseInt(homeRankSelector.value));
};

document.addEventListener('DOMContentLoaded', init);

const heroes = ['hr1', 'hr2', 'hr3', 'hr4', 'hr5', 'hr6', 'hr7', 'hr8', 'hr9', 'hr10'];

function createBoard() {
    gameBoard.innerHTML = '';
    currentPairCount = parseInt(pairSelector.value);
    const selectedHeroes = heroes.slice(0, currentPairCount);
    const gameCards = [...selectedHeroes, ...selectedHeroes];
    const shuffled = shuffle(gameCards);

    shuffled.forEach((hero, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('memory-card', 'pop-in');
        cardElement.dataset.hero = hero;
        cardElement.style.animationDelay = `${index * 0.05}s`;

        cardElement.innerHTML = `
            <img class="front-face" src="assets/${hero}.png" alt="${hero}">
            <img class="back-face" src="assets/verso.png" alt="Verso Liga dos Bravos">
        `;

        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
    });
}

function shuffle(array) {
    // Algoritmo Fisher-Yates para um embaralhamento perfeito e justo
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    moves++;
    moveDisplay.textContent = moves;
    
    // Feedback visual no contador
    const pill = moveDisplay.parentElement;
    pill.classList.remove('bump');
    void pill.offsetWidth; // Força reflow para reiniciar animação
    pill.classList.add('bump');
    
    let isMatch = firstCard.dataset.hero === secondCard.dataset.hero;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    matchSound.play().catch(e => console.log("Erro ao tocar som: ", e));
    
    firstCard.classList.add('match-bounce');
    secondCard.classList.add('match-bounce');

    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchedPairs++;
    if (matchedPairs === currentPairCount) {
        setTimeout(showVictory, 800);
    }
    resetTurn();
}

function unflipCards() {
    lockBoard = true;
    
    // Adiciona o balanço de erro
    if (firstCard) firstCard.classList.add('shake');
    if (secondCard) secondCard.classList.add('shake');

    setTimeout(() => {
        // Limpeza segura das classes de animação e estado
        if (firstCard) firstCard.classList.remove('shake', 'flip');
        if (secondCard) secondCard.classList.remove('shake', 'flip');
        resetTurn();
    }, 600);
}

function resetTurn() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

async function showVictory() {
    victorySound.play().catch(e => console.log("Erro ao tocar som: ", e));
    
    winnerNameSpan.textContent = playerName;
    finalMovesSpan.textContent = moves;
    victoryModal.classList.remove('hidden');

    // Salva a pontuação no servidor e depois carrega o ranking global atualizado
    await saveScore(playerName, playerCountry, moves, currentPairCount);
    await renderRanking(rankingList, currentPairCount);
}

async function saveScore(name, country, score, difficulty) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ name, country, score, difficulty, date: new Date().toLocaleDateString() })
        });
    } catch (error) {
        console.error("Erro ao salvar no ranking global:", error);
    }
}

async function renderRanking(container, difficulty) {
    container.innerHTML = '<li class="ranking-item">Loading...</li>';
    try {
        // Pedimos ao Supabase: filtre por dificuldade, ordene por score (menor primeiro) e limite a 5
        const query = `?difficulty=eq.${difficulty}&order=score.asc&limit=5`;
        const response = await fetch(API_URL + query, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) throw new Error('Erro ao buscar dados');
        const filteredRanking = await response.json();

        container.innerHTML = filteredRanking.map((entry, index) => `
            <li class="ranking-item ${entry.name === playerName && entry.score === moves && entry.difficulty === difficulty ? 'current-player' : ''}">
                <span>${index + 1}º ${entry.country} ${entry.name}</span>
                <span>${entry.score} movs</span>
            </li>
        `).join('');
        
        if (filteredRanking.length === 0) {
            container.innerHTML = '<li class="ranking-item">Empty!</li>';
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = '<li class="ranking-item">Offline</li>';
    }
}

const startGame = () => {
    playerName = nicknameInput.value.trim();
    playerCountry = countrySelector.value;
    if (!playerName) {
        nicknameInput.style.borderColor = "red";
        nicknameInput.style.animation = "shake-ui 0.4s";
        nicknameInput.placeholder = "Nome obrigatório!";
        setTimeout(() => {
            nicknameInput.style.animation = "";
        }, 400);
        setTimeout(() => nicknameInput.style.borderColor = "var(--dark-color)", 2000);
        return;
    }

    startSound.play().catch(e => console.warn("Som de início bloqueado ou arquivo faltando"));
    
    entryScreen.classList.add('hidden');
    gameHeader.classList.remove('hidden'); // Mostra o contador e botão reiniciar
    createBoard();
};

const goToHome = () => {
    moves = 0;
    matchedPairs = 0;
    moveDisplay.textContent = 0;
    victoryModal.classList.add('hidden');
    gameHeader.classList.add('hidden');
    entryScreen.classList.remove('hidden');
    gameBoard.innerHTML = '';
    renderRanking(homeRankingList, parseInt(homeRankSelector.value));
};

const restartGame = () => { 
    moves = 0; 
    matchedPairs = 0; 
    moveDisplay.textContent = 0; 
    victoryModal.classList.add('hidden');
    createBoard(); 
};

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', restartGame);
playAgainBtn.addEventListener('click', goToHome);
backBtn.addEventListener('click', goToHome);
pairSelector.addEventListener('change', restartGame);

// Listener para mudar o ranking na home ao selecionar nível
if (homeRankSelector) {
    homeRankSelector.addEventListener('change', () => {
        renderRanking(homeRankingList, parseInt(homeRankSelector.value));
    });
}