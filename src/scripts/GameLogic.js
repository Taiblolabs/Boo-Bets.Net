// Variables para prevenir múltiples event listeners
let nftSelectButtonConfigured = false;
let uploadPhotosButtonConfigured = false;
let transactionCancelButtonConfigured = false;

// Configuración Web3
const targetNetwork = 1; // Ethereum Mainnet
const targetNetworkName = "Ethereum Mainnet";

let provider = null;
let signer = null;
let currentAccount = null;
let currentChainId = null;

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
let gameContract = null;

// Estado del juego
let ethBalance = 0;
let tokenBalance = 0;
let nftBalance = 0;
let currentStake = 0.01;
let isStaked = false;

// Estado del timer y partida
let seconds = 0;
let minutes = 0;
let timerInterval;
let moves = 0;
let matches = 0;
let cardFlipped = false;
let firstCard, secondCard;
let lockBoard = false;

// Cargar NFTs - versión mejorada
async function loadNFTs() {
    if (!currentAccount) {
        document.getElementById('wallet-modal').style.display = 'flex';
        return;
    }
    
    try {
        document.getElementById('nft-gallery').innerHTML = `
            <div style="display: flex; justify-content: center; width: 100%; grid-column: span 3;">
                <div class="loading"></div>
            </div>
        `;
        
        document.getElementById('nft-select-modal').style.display = 'flex';
        
        // En un escenario real, harías una llamada a una API como OpenSea o Alchemy
        // Para simplificar, vamos a simular la carga de NFTs
        
        setTimeout(() => {
            const nftGallery = document.getElementById('nft-gallery');
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
            
            // Deshabilitar botón hasta que al menos 4 NFTs estén seleccionados
            document.getElementById('use-selected-nfts-btn').disabled = true;
        }, 1500);
        
        // Configurar botón para usar NFTs seleccionados solo una vez
        if (!nftSelectButtonConfigured) {
            document.getElementById('use-selected-nfts-btn').addEventListener('click', function() {
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
            currentStake = parseFloat(this.getAttribute('data-value'));
            document.getElementById('current-stake').textContent = currentStake + ' ETH';
        });
    });
    
    // Apostar y Jugar
    document.getElementById('stake-btn').addEventListener('click', async function() {
        if (!currentAccount) {
            document.getElementById('wallet-modal').style.display = 'flex';
            return;
        }
        
        if (currentChainId !== targetNetwork) {
            document.getElementById('current-network').textContent = getNetworkName(currentChainId);
            document.getElementById('network-modal').style.display = 'flex';
            return;
        }
        
        if (ethBalance < currentStake) {
            showToast('error', 'Saldo insuficiente', `Necesita al menos ${currentStake} ETH para jugar.`);
            return;
        }
        
        await stakeAndPlay();
    });
    
    // Botón de reset
    document.getElementById('reset-btn').addEventListener('click', resetGame);
    
    // Botón de compartir
    document.getElementById('share-btn').addEventListener('click', shareGame);
    
    // Botón de usar NFTs
    document.getElementById('use-nfts-btn').addEventListener('click', loadNFTs);
    
    // Botón de cargar fotos
    if (!uploadPhotosButtonConfigured) {
        document.getElementById('upload-photos-btn').addEventListener('click', function() {
            showToast('info', 'Funcionalidad pronto', 'La carga de fotos estará disponible pronto!');
        });
        uploadPhotosButtonConfigured = true;
    }
    
    // Botón de cancelar transacción
    if (!transactionCancelButtonConfigured) {
        document.getElementById('transaction-cancel-btn').addEventListener('click', function() {
            closeModal('transaction-modal');
        });
        transactionCancelButtonConfigured = true;
    }
}

// Mejora en la verificación de Web3
function checkWeb3Support() {
    if (typeof window.ethereum !== 'undefined') {
        return true;
    } else if (typeof window.web3 !== 'undefined') {
        // Web3 legacy
        window.ethereum = window.web3.currentProvider;
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
    document.getElementById('current-stake').textContent = currentStake + ' ETH';
    
    // Intentar cargar ranking incluso sin cartera conectada
    loadLeaderboard();
}

// Función mejorada para manejar errores de contrato
async function safeContractCall(method, ...args) {
    if (!gameContract) {
        showToast('error', 'Contrato no inicializado', 'Por favor, conecte su cartera primero.');
        return null;
    }
    
    try {
        return await method.apply(gameContract, args);
    } catch (error) {
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

// Versión mejorada de la función stakeAndPlay
async function stakeAndPlay() {
    try {
        if (!gameContract || currentChainId !== targetNetwork) {
            showToast('error', 'Contrato no disponible', 'Verifique su conexión y red.');
            return;
        }
        
        // Mostrar modal de transacción
        document.getElementById('transaction-status').textContent = 'Enviando transacción a la blockchain...';
        document.getElementById('transaction-info').textContent = 'Por favor, confirme la transacción en su cartera.';
        document.getElementById('transaction-modal').style.display = 'flex';
        
        // Convertir ETH a Wei
        const stakeAmount = ethers.utils.parseEther(currentStake.toString());
        
        // Llamar función stake del contrato con manejo de error mejorado
        const tx = await gameContract.stake(stakeAmount, { 
            value: stakeAmount,
            gasLimit: 300000 // Añadir límite de gas explícito
        }).catch(error => {
            console.error('Error al apostar:', error);
            closeModal('transaction-modal');
            
            if (error.code === 4001) {
                // Usuario rechazó la transacción
                showToast('error', 'Transacción cancelada', 'Usted canceló la transacción.');
            } else {
                showToast('error', 'Error al apostar', 'No fue posible procesar su apuesta: ' + error.message);
            }
            throw error; // Re-lanzar el error para interrumpir la ejecución
        });
        
        if (!tx) return; // Si hubo error y tx es null/undefined
        
        // Actualizar status de la transacción
        document.getElementById('transaction-status').textContent = 'Transacción enviada! Aguardando confirmación...';
        document.getElementById('transaction-info').textContent = `Hash de la transacción: ${tx.hash}`;
        
        // Aguardar confirmación
        await tx.wait();
        
        // Cerrar modal e iniciar juego
        closeModal('transaction-modal');
        
        // Deducir la apuesta del saldo (localmente por ahora)
        ethBalance -= currentStake;
        document.getElementById('eth-balance').textContent = ethBalance.toFixed(4) + ' ETH';
        
        // Marcar como apostado e iniciar juego
        isStaked = true;
        resetGame();
        startTimer();
        
        showToast('success', 'Apuesta confirmada', 'Su apuesta fue confirmada. ¡Buena suerte!');
    } catch (error) {
        // El manejo principal de errores ya está hecho arriba
        console.error('Error no tratado:', error);
    }
}

// Inicializar Web3 listeners
function initWeb3Listeners() {
    // Añadir evento para botón de conexión de cartera
    document.getElementById('wallet-btn').addEventListener('click', function() {
        document.getElementById('wallet-modal').style.display = 'flex';
    });
    
    // Añadir eventos para cambio de cuenta o red
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    // Botón para cambiar de red
    document.getElementById('switch-network-btn').addEventListener('click', switchNetwork);
}

// Funciones de utilidad
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function getNetworkName(chainId) {
    const networks = {
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

function showToast(type, title, message) {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    
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
    stakeAndPlay,
    showToast,
    closeModal
}; 