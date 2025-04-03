// Variables globales
const CRYPTO_SYMBOLS = {
    eth: 'Ξ',
    btc: '₿',
    link: '⛓',
    sol: '◎'
};

// Configuración Web3
const targetNetwork = 1; // Ethereum Mainnet
const targetNetworkName = "Ethereum Mainnet";

let provider = null;
let signer = null;
let currentAccount = null;
let currentChainId = null;

// Estado del juego
let ethBalance = 0;
let tokenBalance = 0;
let nftBalance = 0;
let currentStake = 0.01;
let isStaked = false;
let seconds = 0;
let minutes = 0;
let timerInterval;
let moves = 0;
let matches = 0;
let cardFlipped = false;
let firstCard, secondCard;
let lockBoard = false;

// Inicializar el documento
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar botones
    document.getElementById('wallet-btn').addEventListener('click', function() {
        document.getElementById('wallet-modal').style.display = 'flex';
    });
    
    document.querySelectorAll('.stake-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.stake-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            currentStake = parseFloat(this.getAttribute('data-value'));
            document.getElementById('current-stake').textContent = currentStake + ' ETH';
        });
    });
    
    document.getElementById('stake-btn').addEventListener('click', startGame);
    document.getElementById('reset-btn').addEventListener('click', resetGame);
    document.getElementById('share-btn').addEventListener('click', shareGame);
    document.getElementById('use-nfts-btn').addEventListener('click', loadNFTs);
    document.getElementById('upload-photos-btn').addEventListener('click', function() {
        showToast('info', 'Funcionalidade em breve', 'O upload de fotos estará disponível em breve!');
    });
    
    // Inicializar el tablero de juego
    initializeCards();
    
    // Simular datos iniciales (para demostración)
    document.getElementById('current-stake').textContent = currentStake + ' ETH';
});

// Funciones del juego
function initializeCards() {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;
    
    gameBoard.innerHTML = '';
    
    const cardTypes = ['eth', 'btc', 'link', 'sol'];
    const duplicatedTypes = [...cardTypes, ...cardTypes];
    
    // Barajar cartas
    for (let i = duplicatedTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [duplicatedTypes[i], duplicatedTypes[j]] = [duplicatedTypes[j], duplicatedTypes[i]];
    }
    
    // Crear cartas en el DOM
    duplicatedTypes.forEach((type, index) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-card', type);
        card.textContent = '?';
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    
    this.textContent = CRYPTO_SYMBOLS[this.getAttribute('data-card')] || '?';
    this.classList.add('flipped');
    
    if (!cardFlipped) {
        // Primera carta
        cardFlipped = true;
        firstCard = this;
        
        if (moves === 0) {
            startTimer();
        }
        
        moves++;
        document.getElementById('moves').textContent = moves;
        return;
    }
    
    // Segunda carta
    secondCard = this;
    cardFlipped = false;
    moves++;
    document.getElementById('moves').textContent = moves;
    
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.getAttribute('data-card') === secondCard.getAttribute('data-card');
    
    if (isMatch) {
        disableCards();
        matches++;
        document.getElementById('matches').textContent = matches + '/4';
        
        // Añadir pequeña recompensa por cada coincidencia (solo visual)
        if (isStaked) {
            ethBalance += currentStake * 0.05; // 5% de recompensa por coincidencia
            document.getElementById('eth-balance').textContent = ethBalance.toFixed(4) + ' ETH';
        }
        
        if (matches === 4) {
            setTimeout(() => {
                gameWon();
            }, 500);
        }
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
}

function unflipCards() {
    lockBoard = true;
    
    setTimeout(() => {
        firstCard.textContent = '?';
        secondCard.textContent = '?';
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        
        resetTurnVariables();
    }, 1000);
}

function resetTurnVariables() {
    [cardFlipped, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }
    
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('time').textContent = formattedTime;
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    minutes = 0;
    document.getElementById('time').textContent = '00:00';
}

function resetGame() {
    resetTimer();
    moves = 0;
    matches = 0;
    lockBoard = false;
    document.getElementById('moves').textContent = '0';
    document.getElementById('matches').textContent = '0/4';
    initializeCards();
    closeModal('win-modal');
}

function connectWallet(walletType) {
    // Simular conexión de la cartera para demostración
    showToast('info', 'Conectando...', 'Simulando conexión de cartera.');
    
    setTimeout(() => {
        currentAccount = '0x' + Math.random().toString(16).substring(2, 14);
        const shortenedAddress = currentAccount.substring(0, 6) + '...' + currentAccount.substring(38);
        
        document.getElementById('wallet-btn').innerHTML = `<span>${shortenedAddress}</span>`;
        
        ethBalance = Number((Math.random() * 2 + 0.5).toFixed(4));
        tokenBalance = Math.floor(Math.random() * 200 + 50);
        nftBalance = Math.floor(Math.random() * 8 + 1);
        
        document.getElementById('eth-balance').textContent = ethBalance.toFixed(4) + ' ETH';
        document.getElementById('token-balance').textContent = tokenBalance + ' GME';
        document.getElementById('nft-balance').textContent = nftBalance + ' Cartões';
        
        closeModal('wallet-modal');
        showToast('success', 'Carteira conectada', 'Carteira conectada com sucesso!');
        
        // Simular algunos datos de ranking
        const leaderboard = document.getElementById('leaderboard');
        leaderboard.innerHTML = '';
        
        for(let i = 0; i < 5; i++) {
            const address = '0x' + Math.random().toString(16).substring(2, 10);
            const score = Math.floor(Math.random() * 200 + 50);
            
            const row = document.createElement('div');
            row.className = 'player-row';
            row.innerHTML = `
                <div>
                    <span class="player-address">${address}...</span>
                    ${i === 0 ? '<span class="nft-badge">Mestre</span>' : ''}
                </div>
                <span class="player-score">${score} pontos</span>
            `;
            
            leaderboard.appendChild(row);
        }
    }, 1500);
}

function startGame() {
    if (!currentAccount) {
        document.getElementById('wallet-modal').style.display = 'flex';
        return;
    }
    
    if (ethBalance < currentStake) {
        showToast('error', 'Saldo insuficiente', `Você precisa de pelo menos ${currentStake} ETH para jogar.`);
        return;
    }
    
    // Deducir la apuesta del saldo
    ethBalance -= currentStake;
    document.getElementById('eth-balance').textContent = ethBalance.toFixed(4) + ' ETH';
    
    isStaked = true;
    resetGame();
    showToast('success', 'Aposta realizada', 'Sua aposta foi realizada com sucesso. Boa sorte!');
}

function gameWon() {
    clearInterval(timerInterval);
    
    // Calcular recompensa basada en el rendimiento
    const timeTaken = minutes * 60 + seconds;
    const timeBonus = Math.max(100 - timeTaken, 0);
    const movesPenalty = Math.max(20 - Math.floor(moves / 4), 0);
    const totalReward = currentStake * 2 + (timeBonus / 100) * currentStake;
    
    // Actualizar saldos
    ethBalance += totalReward;
    tokenBalance += Math.floor(totalReward * 50);
    nftBalance += 1; // Ganó un NFT
    
    document.getElementById('eth-balance').textContent = ethBalance.toFixed(4) + ' ETH';
    document.getElementById('token-balance').textContent = tokenBalance + ' GME';
    document.getElementById('nft-balance').textContent = nftBalance + ' Cartões';
    
    // Actualizar resultados en el modal
    document.getElementById('result-time').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('result-moves').textContent = moves.toString();
    document.getElementById('earned-eth').textContent = totalReward.toFixed(4);
    document.getElementById('earned-tokens').textContent = Math.floor(totalReward * 50);
    
    // Mostrar animación y modal
    showWinAnimation();
    
    setTimeout(() => {
        document.getElementById('win-modal').style.display = 'flex';
    }, 1000);
}

function showWinAnimation() {
    const container = document.createElement('div');
    container.className = 'win-animation';
    container.style.display = 'block';
    document.body.appendChild(container);
    
    const colors = ['#f59e0b', '#14b8a6', '#9333ea', '#eab308'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Posición aleatoria
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = -10 + 'px';
        
        // Color aleatorio
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Tamaño aleatorio
        const size = Math.random() * 10 + 5;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        container.appendChild(confetti);
        
        // Animar caída
        setTimeout(() => {
            confetti.style.transition = 'all ' + (Math.random() * 3 + 2) + 's ease-out';
            confetti.style.top = '100vh';
            confetti.style.left = (parseFloat(confetti.style.left) + (Math.random() * 40 - 20)) + 'px';
        }, 10);
    }
    
    // Limpiar animación
    setTimeout(() => {
        container.remove();
    }, 5000);
}

function playAgain() {
    closeModal('win-modal');
    resetGame();
}

function loadNFTs() {
    if (!currentAccount) {
        document.getElementById('wallet-modal').style.display = 'flex';
        return;
    }
    
    const nftGallery = document.getElementById('nft-gallery');
    nftGallery.innerHTML = `
        <div style="display: flex; justify-content: center; width: 100%; grid-column: span 3;">
            <div class="loading"></div>
        </div>
    `;
    
    document.getElementById('nft-select-modal').style.display = 'flex';
    
    // Simular carga de NFTs
    setTimeout(() => {
        nftGallery.innerHTML = '';
        
        const nftCount = Math.floor(Math.random() * 6) + 4; // 4-10 NFTs
        
        for (let i = 0; i < nftCount; i++) {
            const nftItem = document.createElement('div');
            nftItem.className = 'nft-item';
            nftItem.style.cursor = 'pointer';
            nftItem.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            nftItem.style.borderRadius = '0.375rem';
            nftItem.style.overflow = 'hidden';
            nftItem.style.position = 'relative';
            
            nftItem.innerHTML = `
                <img src="https://via.placeholder.com/100/9333ea/ffffff?text=NFT${i+1}" alt="NFT #${i+1}" style="width: 100%; height: 100px; object-fit: cover;">
                <div style="padding: 0.5rem; font-size: 0.75rem; text-align: center;">Crypto NFT #${i+1}</div>
                <div class="nft-select-overlay" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-color: rgba(147, 51, 234, 0.5); display: none; justify-content: center; align-items: center; color: white; font-size: 1.5rem;">✓</div>
            `;
            
            nftItem.addEventListener('click', function() {
                const overlay = this.querySelector('.nft-select-overlay');
                if (overlay.style.display === 'none' || overlay.style.display === '') {
                    overlay.style.display = 'flex';
                    this.dataset.selected = 'true';
                } else {
                    overlay.style.display = 'none';
                    delete this.dataset.selected;
                }
                
                // Verificar cuántos NFTs están seleccionados
                const selectedCount = document.querySelectorAll('.nft-item[data-selected="true"]').length;
                document.getElementById('use-selected-nfts-btn').disabled = selectedCount < 4;
            });
            
            nftGallery.appendChild(nftItem);
        }
        
        document.getElementById('use-selected-nfts-btn').disabled = true;
    }, 1500);
    
    // Configurar botón para usar NFTs seleccionados
    document.getElementById('use-selected-nfts-btn').addEventListener('click', function() {
        const selectedNFTs = document.querySelectorAll('.nft-item[data-selected="true"]');
        
        if (selectedNFTs.length < 4) {
            showToast('error', 'Seleção insuficiente', 'Selecione pelo menos 4 NFTs para jogar.');
            return;
        }
        
        closeModal('nft-select-modal');
        showToast('success', 'NFTs selecionados', `${selectedNFTs.length} NFTs serão usados como cartas.`);
        
        resetGame();
    });
}

function shareGame() {
    if (navigator.share) {
        navigator.share({
            title: 'Jogo da Memória Cripto',
            text: 'Estou jogando Jogo da Memória Cripto e ganhando criptomoedas! Venha jogar também!',
            url: window.location.href
        })
        .then(() => {
            showToast('success', 'Compartilhado', 'Obrigado por compartilhar o jogo!');
        })
        .catch((error) => {
            console.error('Erro ao compartilhar:', error);
        });
    } else {
        // Fallback para navegadores que no soportan la API Share
        const shareText = encodeURIComponent('Estou jogando Jogo da Memória Cripto e ganhando criptomoedas! Venha jogar também!');
        const shareURL = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}`, '_blank');
    }
}

// Utilidades
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showToast(type, title, message) {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Definir tipo e ícono
    toastIcon.className = 'toast-icon';
    toastIcon.classList.add(type);
    
    if (type === 'success') {
        toastIcon.innerHTML = '✓';
    } else if (type === 'error') {
        toastIcon.innerHTML = '✗';
    } else if (type === 'info') {
        toastIcon.innerHTML = 'ℹ';
    }
    
    // Definir contenido
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Mostrar toast
    toast.classList.add('show');
    
    // Esconder toast después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
} 