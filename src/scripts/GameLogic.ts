// Variables para prevenir múltiples event listeners
let nftSelectButtonConfigured = false;
let uploadPhotosButtonConfigured = false;
let transactionCancelButtonConfigured = false;

// Configuración Web3
const targetNetwork = 1; // Ethereum Mainnet
const targetNetworkName = "Ethereum Mainnet";

let provider: any = null;
let signer: any = null;
let currentAccount: string | null = null;
let currentChainId: number | null = null;

// Configuración del contrato
const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Sustituir por dirección real
const CONTRACT_ABI = [
    // ABI simplificado para el contrato del juego
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "stake",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "timeInSeconds",
                "type": "uint256"
            }
        ],
        "name": "claimReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
let gameContract: any = null;

// Estado del juego
let ethBalance = 0;
let tokenBalance = 0;
let nftBalance = 0;
let currentStake = 0.01;
let isStaked = false;

// Estado del timer y partida
let seconds = 0;
let minutes = 0;
let timerInterval: NodeJS.Timeout;
let moves = 0;
let matches = 0;
let cardFlipped = false;
let firstCard: any = null;
let secondCard: any = null; 
let lockBoard = false;

// Cargar NFTs - versión mejorada
async function loadNFTs() {
    if (!currentAccount) {
        document.getElementById('wallet-modal')!.style.display = 'flex';
        return;
    }
    
    try {
        document.getElementById('nft-gallery')!.innerHTML = `
            <div style="display: flex; justify-content: center; width: 100%; grid-column: span 3;">
                <div class="loading"></div>
            </div>
        `;
        
        document.getElementById('nft-select-modal')!.style.display = 'flex';
        
        // En un escenario real, harías una llamada a una API como OpenSea o Alchemy
        // Para simplificar, vamos a simular la carga de NFTs
        
        setTimeout(() => {
            const nftGallery = document.getElementById('nft-gallery');
            if (!nftGallery) return;
            
            nftGallery.innerHTML = '';
            
            // Simular algunos NFTs
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
                    <img src="https://via.placeholder.com/100" alt="NFT #${i+1}" style="width: 100%; height: 100px; object-fit: cover;">
                    <div style="padding: 0.5rem; font-size: 0.75rem; text-align: center;">Crypto NFT #${i+1}</div>
                    <div class="nft-select-overlay" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-color: rgba(147, 51, 234, 0.5); display: none; justify-content: center; align-items: center; color: white; font-size: 1.5rem;">✓</div>
                `;
                
                nftItem.addEventListener('click', function() {
                    const overlay = this.querySelector('.nft-select-overlay');
                    if (!overlay) return;
                    
                    if (overlay.style.display === 'none' || overlay.style.display === '') {
                        overlay.style.display = 'flex';
                        this.dataset.selected = 'true';
                    } else {
                        overlay.style.display = 'none';
                        delete this.dataset.selected;
                    }
                    
                    // Verificar cuántos NFTs están seleccionados
                    const selectedNFTs = document.querySelectorAll('.nft-item[data-selected="true"]');
                    const useSelectedBtn = document.getElementById('use-selected-nfts-btn');
                    if (useSelectedBtn) {
                        useSelectedBtn.disabled = selectedNFTs.length < 4;
                    }
                });
                
                nftGallery.appendChild(nftItem);
            }
            
            // Deshabilitar botón hasta que al menos 4 NFTs estén seleccionados
            const useSelectedBtn = document.getElementById('use-selected-nfts-btn');
            if (useSelectedBtn) {
                useSelectedBtn.disabled = true;
            }
        }, 1500);
        
        // Configurar botón para usar NFTs seleccionados solo una vez
        if (!nftSelectButtonConfigured) {
            const useSelectedBtn = document.getElementById('use-selected-nfts-btn');
            if (useSelectedBtn) {
                useSelectedBtn.addEventListener('click', function() {
                    const selectedNFTs = document.querySelectorAll('.nft-item[data-selected="true"]');
                    
                    if (selectedNFTs.length < 4) {
                        showToast('error', 'Selección insuficiente', 'Seleccione al menos 4 NFTs para jugar.');
                        return;
                    }
                    
                    closeModal('nft-select-modal');
                    showToast('success', 'NFTs seleccionados', `${selectedNFTs.length} NFTs serán usados como cartas.`);
                    
                    // En un escenario real, usarías los NFTs como cartas
                    resetGame();
                    startTimer();
                });
                nftSelectButtonConfigured = true;
            }
        }
    } catch (error) {
        console.error('Error al cargar NFTs:', error);
        showToast('error', 'Error al cargar NFTs', 'No fue posible cargar sus NFTs. Intente nuevamente.');
    }
}

// Función de inicialización mejorada
function initGameEvents() {
    // Opciones de apuesta
    document.querySelectorAll('.stake-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.stake-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            const value = this.getAttribute('data-value');
            if (value) {
                currentStake = parseFloat(value);
                const currentStakeElement = document.getElementById('current-stake');
                if (currentStakeElement) {
                    currentStakeElement.textContent = currentStake + ' ETH';
                }
            }
        });
    });
    
    // Botón de cargar fotos
    if (!uploadPhotosButtonConfigured) {
        const uploadBtn = document.getElementById('upload-photos-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', function() {
                showToast('info', 'Funcionalidad pronto', 'La carga de fotos estará disponible pronto!');
            });
            uploadPhotosButtonConfigured = true;
        }
    }
    
    // Botón de cancelar transacción
    if (!transactionCancelButtonConfigured) {
        const cancelBtn = document.getElementById('transaction-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                closeModal('transaction-modal');
            });
            transactionCancelButtonConfigured = true;
        }
    }
}

// Mejora en la verificación de Web3
function checkWeb3Support() {
    if (typeof window.ethereum !== 'undefined') {
        return true;
    } else if (typeof window.web3 !== 'undefined') {
        // Web3 legacy
        (window as any).ethereum = (window as any).web3.currentProvider;
        return true;
    }
    return false;
}

// Inicialización del documento
function initializeGame() {
    // Verificar si el navegador soporta Web3
    if (checkWeb3Support()) {
        initWeb3Listeners();
        showToast('info', 'Web3 detectado', 'Su navegador soporta Web3. Conecte su cartera para jugar!');
    } else {
        showToast('error', 'Web3 no soportado', 'Su navegador no soporta Web3. Por favor, instale MetaMask u otro proveedor Web3.');
    }
    
    initGameEvents();
    
    // Establecer valor inicial de la apuesta
    const currentStakeElement = document.getElementById('current-stake');
    if (currentStakeElement) {
        currentStakeElement.textContent = currentStake + ' ETH';
    }
    
    // Intentar cargar ranking incluso sin cartera conectada
    loadLeaderboard();
}

// Timer functions
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
    const timeElement = document.getElementById('time');
    if (timeElement) {
        timeElement.textContent = formattedTime;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    minutes = 0;
    const timeElement = document.getElementById('time');
    if (timeElement) {
        timeElement.textContent = '00:00';
    }
}

// Función mejorada para manejar errores de contrato
async function safeContractCall(method: Function, ...args: any[]) {
    if (!gameContract) {
        showToast('error', 'Contrato no inicializado', 'Por favor, conecte su cartera primero.');
        return null;
    }
    
    try {
        return await method.apply(gameContract, args);
    } catch (error: any) {
        console.error('Error al llamar contrato:', error);
        
        // Tratar diferentes tipos de errores
        if (error.code === 4001) {
            showToast('error', 'Transacción rechazada', 'Usted rechazó la transacción.');
        } else if (error.code === -32603) {
            showToast('error', 'Error interno', 'Error interno de Ethereum. Verifique su saldo de gas.');
        } else if (error.message && error.message.includes('gas')) {
            showToast('error', 'Error de gas', 'Error al estimar gas. Verifique su saldo.');
        } else {
            showToast('error', 'Error de contrato', 'Ocurrió un error al llamar el contrato.');
        }
        
        return null;
    }
}

// Game functions
function resetGame() {
    resetTimer();
    moves = 0;
    matches = 0;
    lockBoard = false;
    
    const movesElement = document.getElementById('moves');
    const matchesElement = document.getElementById('matches');
    
    if (movesElement) movesElement.textContent = '0';
    if (matchesElement) matchesElement.textContent = '0/4';
    
    // Resetear cartas
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        card.textContent = '?';
        card.classList.remove('flipped');
        
        // Remover eventos antiguos
        card.removeEventListener('click', flipCard);
        
        // Añadir nuevo evento
        card.addEventListener('click', flipCard);
    });
    
    // Barajar cartas
    shuffleCards();
}

function shuffleCards() {
    const cards = document.querySelectorAll('.game-card');
    const cardTypes = ['eth', 'btc', 'link', 'sol'];
    const duplicatedTypes = [...cardTypes, ...cardTypes];
    
    // Barajar array
    for (let i = duplicatedTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [duplicatedTypes[i], duplicatedTypes[j]] = [duplicatedTypes[j], duplicatedTypes[i]];
    }
    
    // Atribuir tipos a las cartas
    cards.forEach((card, index) => {
        card.setAttribute('data-card', duplicatedTypes[index]);
    });
}

function flipCard(this: HTMLElement) {
    if (lockBoard) return;
    if (this === firstCard) return;
    
    const cardType = this.getAttribute('data-card');
    if (cardType) {
        this.textContent = getCryptoSymbol(cardType);
    }
    this.classList.add('flipped');
    
    if (!cardFlipped) {
        // Primera carta volteada
        cardFlipped = true;
        firstCard = this;
        
        if (moves === 0) {
            startTimer();
        }
        
        moves++;
        const movesElement = document.getElementById('moves');
        if (movesElement) movesElement.textContent = moves.toString();
        return;
    }
    
    // Segunda carta volteada
    secondCard = this;
    cardFlipped = false;
    
    moves++;
    const movesElement = document.getElementById('moves');
    if (movesElement) movesElement.textContent = moves.toString();
    
    checkForMatch();
}

function checkForMatch() {
    if (!firstCard || !secondCard) return;
    
    let isMatch = firstCard.getAttribute('data-card') === secondCard.getAttribute('data-card');
    
    if (isMatch) {
        disableCards();
        matches++;
        const matchesElement = document.getElementById('matches');
        if (matchesElement) matchesElement.textContent = matches + '/4';
        
        // Añadir pequeña recompensa por cada coincidencia (solo visual)
        if (isStaked) {
            ethBalance += currentStake * 0.05; // 5% de recompensa por combinación
            const ethBalanceElement = document.getElementById('eth-balance');
            if (ethBalanceElement) ethBalanceElement.textContent = ethBalance.toFixed(4) + ' ETH';
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

function getCryptoSymbol(crypto: string): string {
    const symbols: {[key: string]: string} = {
        'eth': 'Ξ',
        'btc': '₿',
        'link': '⛓',
        'sol': '◎'
    };
    return symbols[crypto] || '?';
}

function disableCards() {
    if (!firstCard || !secondCard) return;
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
}

function unflipCards() {
    lockBoard = true;
    
    setTimeout(() => {
        if (firstCard) firstCard.textContent = '?';
        if (secondCard) secondCard.textContent = '?';
        if (firstCard) firstCard.classList.remove('flipped');
        if (secondCard) secondCard.classList.remove('flipped');
        
        resetTurnVariables();
    }, 1000);
}

function resetTurnVariables() {
    [cardFlipped, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function gameWon() {
    clearInterval(timerInterval);
    
    // Calcular recompensas con base en el rendimiento
    const timeTaken = minutes * 60 + seconds;
    const timeBonus = Math.max(100 - timeTaken, 0);
    const movesPenalty = Math.max(20 - Math.floor(moves / 4), 0);
    const totalReward = currentStake * 2 + (timeBonus / 100) * currentStake;
    
    // Actualizar resultados en el modal
    const resultTimeElement = document.getElementById('result-time');
    const resultMovesElement = document.getElementById('result-moves');
    const earnedEthElement = document.getElementById('earned-eth');
    const earnedTokensElement = document.getElementById('earned-tokens');
    
    if (resultTimeElement) resultTimeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    if (resultMovesElement) resultMovesElement.textContent = moves.toString();
    if (earnedEthElement) earnedEthElement.textContent = totalReward.toFixed(4);
    if (earnedTokensElement) earnedTokensElement.textContent = Math.floor(totalReward * 50).toString();
    
    // Mostrar modal de victoria
    setTimeout(() => {
        const winModal = document.getElementById('win-modal');
        if (winModal) winModal.style.display = 'flex';
    }, 1000);
}

// Inicializar Web3 listeners
function initWeb3Listeners() {
    // Añadir evento para botón de conexión de cartera
    const walletBtn = document.getElementById('wallet-btn');
    if (walletBtn) {
        walletBtn.addEventListener('click', function() {
            const walletModal = document.getElementById('wallet-modal');
            if (walletModal) walletModal.style.display = 'flex';
        });
    }
    
    // Añadir eventos para cambio de cuenta o red
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    // Botón para cambiar de red
    const switchNetworkBtn = document.getElementById('switch-network-btn');
    if (switchNetworkBtn) {
        switchNetworkBtn.addEventListener('click', switchNetwork);
    }
}

// Manejar cambio de cuentas
async function handleAccountsChanged(accounts: string[]) {
    // Implementación básica
    console.log('Cuentas cambiadas:', accounts);
}

// Manejar cambio de red
async function handleChainChanged(chainId: string) {
    // Implementación básica
    console.log('Red cambiada:', chainId);
}

// Cambiar de red
async function switchNetwork() {
    // Implementación básica
    console.log('Cambiando red...');
}

// Cargar ranking
async function loadLeaderboard() {
    // Implementación simulada
    console.log('Cargando ranking...');
}

// Funciones de utilidad
function closeModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function getNetworkName(chainId: number | null): string {
    if (chainId === null) return 'Desconocido';
    
    const networks: {[key: number]: string} = {
        1: 'Ethereum',
        5: 'Goerli',
        11155111: 'Sepolia',
        137: 'Polygon',
        80001: 'Mumbai',
        56: 'BSC',
        42161: 'Arbitrum',
        10: 'Optimism'
    };
    
    return networks[chainId] || `Red ${chainId}`;
}

function showToast(type: 'success' | 'error' | 'info', title: string, message: string) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    
    if (!toastIcon || !toastTitle || !toastMessage) return;
    
    // Definir tipo
    toastIcon.className = 'toast-icon';
    toastIcon.classList.add(type);
    
    // Definir ícono
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

// Exportar las funciones para usarlas en el componente React
export {
    initializeGame,
    loadNFTs,
    checkWeb3Support,
    safeContractCall,
    showToast,
    closeModal,
    startTimer,
    resetGame
}; 