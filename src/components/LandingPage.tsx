import React, { useState, useEffect, useRef } from 'react';
import '../styles/MemoryGame.css';
import { 
    initializeGame, 
    loadNFTs, 
    showToast, 
    closeModal 
} from '../scripts/GameLogic';

declare global {
    interface Window {
        ethereum?: any;
    }
}

// Símbolos de criptomonedas para las cartas
const CRYPTO_SYMBOLS = {
    eth: 'Ξ',
    btc: '₿',
    link: '⛓',
    sol: '◎'
};

const LandingPage: React.FC = () => {
    // Estado de la cartera
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [ethBalance, setEthBalance] = useState(0);
    const [tokenBalance, setTokenBalance] = useState(0);
    const [nftBalance, setNftBalance] = useState(0);
    const [currentStake, setCurrentStake] = useState(0.01);

    // Estado del juego
    const [cards, setCards] = useState<any[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [time, setTime] = useState({ minutes: 0, seconds: 0 });
    const [isPlaying, setIsPlaying] = useState(false);

    // Estado de los modales
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [showWinModal, setShowWinModal] = useState(false);
    const [showNftModal, setShowNftModal] = useState(false);

    // Referencias para evitar múltiples event listeners
    const gameInitialized = useRef(false);

    // Inicializar el juego
    useEffect(() => {
        if (!gameInitialized.current) {
            initializeCards();
            gameInitialized.current = true;
            
            // Simular datos iniciales (para demostración)
            setEthBalance(1.5);
            setTokenBalance(100);
            setNftBalance(3);

            document.addEventListener('DOMContentLoaded', () => {
                const toastElement = document.createElement('div');
                toastElement.className = 'toast';
                toastElement.id = 'toast';
                toastElement.innerHTML = `
                    <div class="toast-icon success">✓</div>
                    <div class="toast-content">
                        <div class="toast-title">Éxito!</div>
                        <div class="toast-message">Operación completada.</div>
                    </div>
                `;
                document.body.appendChild(toastElement);
            });
        }
    }, []);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setTime(prev => {
                    if (prev.seconds === 59) {
                        return { minutes: prev.minutes + 1, seconds: 0 };
                    }
                    return { ...prev, seconds: prev.seconds + 1 };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Inicializar cartas
    const initializeCards = () => {
        const cardTypes = ['eth', 'btc', 'link', 'sol'];
        const duplicatedTypes = [...cardTypes, ...cardTypes];
        
        // Barajar cartas
        for (let i = duplicatedTypes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [duplicatedTypes[i], duplicatedTypes[j]] = [duplicatedTypes[j], duplicatedTypes[i]];
        }
        
        const newCards = duplicatedTypes.map((type, index) => ({
            id: index,
            type,
            isFlipped: false,
            isMatched: false
        }));
        
        setCards(newCards);
    };

    // Conectar cartera
    const connectWallet = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);
                setIsWalletConnected(true);
                
                // Simular saldos para demostración
                setEthBalance(1.5);
                setTokenBalance(100);
                setNftBalance(3);
                
                setShowWalletModal(false);
                showToast('success', 'Cartera conectada', 'Su cartera ha sido conectada con éxito!');
            } else {
                showToast('error', 'Web3 no detectado', 'Por favor, instale MetaMask para jugar!');
            }
        } catch (error) {
            console.error('Error al conectar la cartera:', error);
            showToast('error', 'Error de conexión', 'No se pudo conectar a la cartera.');
        }
    };

    // Manejar selección de opción de apuesta
    const handleStakeOption = (value: number) => {
        setCurrentStake(value);
    };

    // Iniciar juego
    const startGame = () => {
        if (!isWalletConnected) {
            setShowWalletModal(true);
            return;
        }
        
        if (ethBalance < currentStake) {
            showToast('error', 'Saldo insuficiente', 'No tiene suficiente ETH para jugar.');
            return;
        }

        // Deducir apuesta (simulación)
        setEthBalance(prev => prev - currentStake);
        
        setIsPlaying(true);
        setMoves(0);
        setMatches(0);
        setTime({ minutes: 0, seconds: 0 });
        initializeCards();
    };

    // Voltear una carta
    const handleCardClick = (id: number) => {
        if (!isPlaying) return;
        if (cards[id].isFlipped || cards[id].isMatched) return;
        
        // Primera carta de la ronda
        const flippedCount = cards.filter(card => card.isFlipped && !card.isMatched).length;
        
        if (flippedCount === 0) {
            // Primera carta
            const updatedCards = [...cards];
            updatedCards[id].isFlipped = true;
            setCards(updatedCards);
        } else if (flippedCount === 1) {
            // Segunda carta
            const updatedCards = [...cards];
            updatedCards[id].isFlipped = true;
            setCards(updatedCards);
            
            // Incrementar movimientos
            setMoves(prev => prev + 1);
            
            // Buscar la primera carta volteada
            const firstCard = cards.find(card => card.isFlipped && !card.isMatched);
            
            // Verificar si es una coincidencia
            if (firstCard && firstCard.type === cards[id].type) {
                // Es una coincidencia
                setTimeout(() => {
                    const matchedCards = [...cards];
                    matchedCards.forEach(card => {
                        if (card.isFlipped && !card.isMatched) {
                            card.isMatched = true;
                        }
                    });
                    setCards(matchedCards);
                    setMatches(prev => prev + 1);
                    
                    // Verificar si el juego terminó
                    if (matches + 1 === cards.length / 2) {
                        handleGameWin();
                    }
                }, 500);
            } else {
                // No es una coincidencia
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards.forEach(card => {
                        if (card.isFlipped && !card.isMatched) {
                            card.isFlipped = false;
                        }
                    });
                    setCards(resetCards);
                }, 1000);
            }
        }
    };

    // Manejar victoria del juego
    const handleGameWin = () => {
        setIsPlaying(false);
        
        // Calcular recompensa basada en el rendimiento
        const timeTaken = time.minutes * 60 + time.seconds;
        const timeBonus = Math.max(100 - timeTaken, 0);
        const movesPenalty = Math.max(20 - Math.floor(moves / 2), 0);
        const totalReward = currentStake * 2 + (timeBonus / 100) * currentStake;
        
        // Actualizar saldo (simulación)
        setEthBalance(prev => prev + totalReward);
        setTokenBalance(prev => prev + Math.floor(totalReward * 50));
        
        setTimeout(() => {
            setShowWinModal(true);
        }, 1000);
    };

    // Resetear el juego
    const resetGame = () => {
        setIsPlaying(false);
        setMoves(0);
        setMatches(0);
        setTime({ minutes: 0, seconds: 0 });
        initializeCards();
        setShowWinModal(false);
    };

    return (
        <>
            <header className="header">
                <div className="logo">
                    <div className="logo-icon">₿</div>
                    Cripto Memory
                </div>
                <nav className="nav-menu">
                    <a href="#">Início</a>
                    <a href="#">Como Jogar</a>
                    <a href="#">Sobre</a>
                    <a href="#">Mercado NFT</a>
                </nav>
                <div>
                    <button className="btn btn-wallet" onClick={() => setShowWalletModal(true)}>
                        {isWalletConnected ? 
                            walletAddress.substring(0, 6) + '...' + walletAddress.substring(38) :
                            'Conectar Carteira'
                        }
                    </button>
                </div>
            </header>

            <main className="main-content">
                <section className="game-section">
                    <h1 className="game-title">
                        <div className="logo-icon">₿</div>
                        Jogo da Memória Cripto
                    </h1>

                    <div className="upload-section">
                        <p className="upload-text">Carregue pelo menos 8 fotos ou selecione cartões NFT da sua carteira</p>
                        <div className="upload-buttons">
                            <button className="btn btn-primary" id="upload-photos-btn">Carregar Fotos</button>
                            <button className="btn btn-outline" id="use-nfts-btn" onClick={() => setShowNftModal(true)}>Usar Meus NFTs</button>
                        </div>
                    </div>
                    
                    <div className="stake-section">
                        <h3 className="stake-title">APOSTE PARA JOGAR</h3>
                        <p>Faça uma aposta em cripto para jogar e ganhe recompensas por cada combinação!</p>
                        
                        <div className="stake-options">
                            <div 
                                className={`stake-option ${currentStake === 0.001 ? 'selected' : ''}`} 
                                onClick={() => handleStakeOption(0.001)}
                            >
                                0.001 ETH
                            </div>
                            <div 
                                className={`stake-option ${currentStake === 0.005 ? 'selected' : ''}`} 
                                onClick={() => handleStakeOption(0.005)}
                            >
                                0.005 ETH
                            </div>
                            <div 
                                className={`stake-option ${currentStake === 0.01 ? 'selected' : ''}`} 
                                onClick={() => handleStakeOption(0.01)}
                            >
                                0.01 ETH
                            </div>
                            <div 
                                className={`stake-option ${currentStake === 0.05 ? 'selected' : ''}`} 
                                onClick={() => handleStakeOption(0.05)}
                            >
                                0.05 ETH
                            </div>
                        </div>
                        
                        <button className="btn btn-primary" onClick={startGame}>
                            Apostar & Jogar
                        </button>
                    </div>

                    <div className="game-stats">
                        <div className="timer">
                            <span className="timer-icon">⏱</span>
                            <span>{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}</span>
                        </div>
                        <div className="game-info">
                            <div>Jogadas: {moves}</div>
                            <div>Combinações: {matches}/{cards.length / 2}</div>
                        </div>
                        <div className="action-buttons">
                            <button className="btn-action" title="Reiniciar jogo" onClick={resetGame}>↺</button>
                            <button className="btn-action" title="Compartilhar resultado">↑</button>
                        </div>
                    </div>

                    <div className="game-board">
                        {cards.map(card => (
                            <div 
                                key={card.id}
                                className={`game-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                                onClick={() => handleCardClick(card.id)}
                            >
                                {card.isFlipped || card.isMatched ? CRYPTO_SYMBOLS[card.type as keyof typeof CRYPTO_SYMBOLS] : '?'}
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="side-panel">
                    <div className="crypto-info">
                        <h2 className="section-title">SUA CARTEIRA</h2>
                        <div className="crypto-content">
                            <div className="crypto-balance">
                                <span>Saldo ETH:</span>
                                <span>{ethBalance.toFixed(4)} ETH</span>
                            </div>
                            <div className="crypto-balance">
                                <span>Tokens do Jogo:</span>
                                <span>{tokenBalance} GME</span>
                            </div>
                            <div className="crypto-balance">
                                <span>Cartões NFT:</span>
                                <span>{nftBalance} Cartões</span>
                            </div>
                            <div className="crypto-balance">
                                <span>Aposta Atual:</span>
                                <span>{currentStake} ETH</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="leaderboard-section">
                        <h2 className="section-title">RANKING</h2>
                        <div className="leaderboard-content" id="leaderboard">
                            <div className="player-row">
                                <div>
                                    <span className="player-address">Conecte-se para ver o ranking</span>
                                </div>
                                <span className="player-score">--</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Modal de conexión de cartera */}
            <div className="modal" style={{ display: showWalletModal ? 'flex' : 'none' }} id="wallet-modal">
                <div className="modal-content">
                    <h2 className="modal-title">Conecte sua Carteira</h2>
                    <p>Escolha uma carteira para conectar e jogar:</p>
                    
                    <div className="wallet-options">
                        <div className="wallet-option" onClick={connectWallet}>
                            <div className="wallet-icon">M</div>
                            <span>MetaMask</span>
                        </div>
                        <div className="wallet-option" onClick={connectWallet}>
                            <div className="wallet-icon">W</div>
                            <span>WalletConnect</span>
                        </div>
                        <div className="wallet-option" onClick={connectWallet}>
                            <div className="wallet-icon">C</div>
                            <span>Coinbase</span>
                        </div>
            </div>
                    
                    <div className="modal-buttons">
                        <button className="btn btn-outline" onClick={() => setShowWalletModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
        
            {/* Modal de victoria */}
            <div className="modal" style={{ display: showWinModal ? 'flex' : 'none' }} id="win-modal">
                <div className="modal-content">
                    <h2 className="modal-title">Parabéns!</h2>
                    <p>Você completou o jogo em {String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')} com {moves} jogadas!</p>
                    
                    <div style={{ margin: '1.5rem 0' }}>
                        <p>Você ganhou:</p>
                        <div className="reward-amount">{(currentStake * 2).toFixed(4)} ETH</div>
                        <p className="reward-tokens">+{Math.floor(currentStake * 2 * 50)} Tokens do Jogo</p>
                        
                        <div className="reward-nft">
                            <p>Badge NFT será criado na sua carteira!</p>
                        </div>
                    </div>
                    
                    <div className="modal-buttons">
                        <button className="btn btn-outline" onClick={() => setShowWinModal(false)}>Fechar</button>
                        <button className="btn btn-primary" onClick={resetGame}>Jogar Novamente</button>
                    </div>
                </div>
            </div>

            {/* Modal de selección de NFTs */}
            <div className="modal" style={{ display: showNftModal ? 'flex' : 'none' }} id="nft-select-modal">
                <div className="modal-content">
                    <h2 className="modal-title">Selecione seus NFTs</h2>
                    <p>Escolha pelo menos 4 NFTs para usar como cartas:</p>
                    
                    <div id="nft-gallery" style={{
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '0.75rem', 
                        margin: '1.5rem 0', 
                        maxHeight: '300px', 
                        overflowY: 'auto'
                    }}>
                        {/* NFTs serán cargados dinámicamente */}
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gridColumn: 'span 3' }}>
                            <div className="loading"></div>
                        </div>
        </div>
        
                    <div className="modal-buttons">
                        <button className="btn btn-outline" onClick={() => setShowNftModal(false)}>Cancelar</button>
                        <button className="btn btn-primary" id="use-selected-nfts-btn">Usar Selecionados</button>
        </div>
      </div>
    </div>

            {/* Toast notifications */}
            <div className="toast" id="toast">
                <div className="toast-icon success">✓</div>
                <div className="toast-content">
                    <div className="toast-title">Sucesso!</div>
                    <div className="toast-message">Operação concluída.</div>
                </div>
            </div>
        </>
    );
};

export default LandingPage; 