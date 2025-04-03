import React, { useState } from 'react';
import '../styles/MemoryGame.css';
import { showToast } from '../scripts/GameLogic';

declare global {
    interface Window {
        ethereum?: any;
    }
}

interface LandingPageProps {
    onStartMemory: () => void;
    onStartBoard: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartMemory, onStartBoard }) => {
    // Estado de la cartera
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [ethBalance, setEthBalance] = useState(0);
    const [currentStake, setCurrentStake] = useState(0.01);
    const [showWalletModal, setShowWalletModal] = useState(false);

    // Conectar cartera
    const connectWallet = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);
                setIsWalletConnected(true);
                
                // Simular saldo para demostración
                setEthBalance(1.5);
                
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

    // Iniciar juego de memoria
    const startMemoryGame = () => {
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
        onStartMemory();
    };

    // Iniciar juego de tablero
    const startBoardGame = () => {
        if (!isWalletConnected) {
            setShowWalletModal(true);
            return;
        }
        onStartBoard();
    };

    return (
        <>
            <header className="header">
                <div className="logo">
                    <div className="logo-icon">₿</div>
                    Boo-Bets Games
                </div>
                <nav className="nav-menu">
                    <a href="#">Inicio</a>
                    <a href="#">Cómo Jugar</a>
                    <a href="#">Sobre</a>
                    <a href="#">Mercado NFT</a>
                </nav>
                <div>
                    <button className="btn btn-wallet" onClick={() => setShowWalletModal(true)}>
                        {isWalletConnected ? 
                            walletAddress.substring(0, 6) + '...' + walletAddress.substring(38) :
                            'Conectar Cartera'
                        }
                    </button>
                </div>
            </header>

            <main className="main-content">
                <section className="game-section">
                    <h1 className="game-title">
                        <div className="logo-icon">₿</div>
                        Boo-Bets Games
                    </h1>

                    <div className="games-section">
                        <div className="game-option memory-game">
                            <h3>Juego de Memoria</h3>
                            <p>¡Encuentra pares de cartas y gana recompensas!</p>
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
                            <button className="btn btn-primary" onClick={startMemoryGame}>
                                Jugar Memoria
                            </button>
                        </div>

                        <div className="game-option board-game">
                            <h3>Juego de Tablero</h3>
                            <p>¡Compite en nuestro juego de tablero!</p>
                            <button className="btn btn-secondary" onClick={startBoardGame}>
                                Jugar Tablero
                            </button>
                        </div>
                    </div>
                </section>

                <aside className="side-panel">
                    <div className="crypto-info">
                        <h2 className="section-title">TU CARTERA</h2>
                        <div className="crypto-content">
                            <div className="crypto-balance">
                                <span>Saldo ETH:</span>
                                <span>{ethBalance.toFixed(4)} ETH</span>
                            </div>
                            <div className="crypto-balance">
                                <span>Apuesta Actual:</span>
                                <span>{currentStake} ETH</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Modal de conexión de cartera */}
            <div className="modal" style={{ display: showWalletModal ? 'flex' : 'none' }} id="wallet-modal">
                <div className="modal-content">
                    <h2 className="modal-title">Conecta tu Cartera</h2>
                    <p>Elige una cartera para conectar y jugar:</p>
                    
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

            {/* Toast notifications */}
            <div className="toast" id="toast">
                <div className="toast-icon success">✓</div>
                <div className="toast-content">
                    <div className="toast-title">¡Éxito!</div>
                    <div className="toast-message">Operación completada.</div>
                </div>
            </div>
        </>
    );
};

export default LandingPage; 