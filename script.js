const gameBoard = document.getElementById('game-board');
const moveDisplay = document.getElementById('move-counter');
const resetBtn = document.getElementById('reset-button');
const pairSelector = document.getElementById('pair-selector');
const entryScreen = document.getElementById('entry-screen');
const startBtn = document.getElementById('start-button');
const nicknameInput = document.getElementById('nickname');

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let matchedPairs = 0;
let currentPairCount = 10;
let playerName = "";

// Garante que o texto do botão esteja correto antes de começar
if (startBtn) startBtn.textContent = "Iniciar Desafio";

const heroes = ['hr1', 'hr2', 'hr3', 'hr4', 'hr5', 'hr6', 'hr7', 'hr8', 'hr9', 'hr10'];

function createBoard() {
    gameBoard.innerHTML = '';
    currentPairCount = parseInt(pairSelector.value);
    const selectedHeroes = heroes.slice(0, currentPairCount);
    const gameCards = [...selectedHeroes, ...selectedHeroes];

    shuffle(gameCards).forEach(hero => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('memory-card');
        cardElement.dataset.hero = hero;

        cardElement.innerHTML = `
            <img class="front-face" src="assets/${hero}.png" alt="${hero}">
            <img class="back-face" src="assets/verso.png" alt="Verso Liga dos Bravos">
        `;

        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
    });
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
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
    
    let isMatch = firstCard.dataset.hero === secondCard.dataset.hero;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchedPairs++;
    if (matchedPairs === currentPairCount) {
        setTimeout(() => alert(`Parabéns Bravo! Você completou em ${moves} movimentos.`), 500);
    }
    resetTurn();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetTurn();
    }, 1000);
}

function resetTurn() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

const startGame = () => {
    playerName = nicknameInput.value.trim();
    if (!playerName) {
        alert("Ei Bravo! Digite seu nickname para começar a missão.");
        return;
    }
    entryScreen.classList.add('hidden');
    createBoard();
};

const restartGame = () => { moves = 0; matchedPairs = 0; moveDisplay.textContent = 0; createBoard(); };

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', restartGame);
pairSelector.addEventListener('change', restartGame);