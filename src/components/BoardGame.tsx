import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCookies } from '../context/CookieContext';

interface BoardGameProps {
  onBack: () => void;
}

export default function BoardGame({ onBack }: BoardGameProps) {
  const { isAuthenticated } = useAuth();
  const { highScore, updateHighScore, gamePreferences, updateLastPlayedGame } = useCookies();
  const [jogadas, setJogadas] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [pares, setPares] = useState("0/8");
  const [tabuleiro, setTabuleiro] = useState<string[][]>([
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ]);
  const [jogadorAtual, setJogadorAtual] = useState<'X' | 'O'>('X');
  const [vencedor, setVencedor] = useState<string | null>(null);

  useEffect(() => {
    updateLastPlayedGame('board');
  }, []);

  const verificarVencedor = (board: string[][]) => {
    // Verificar linhas
    for (let i = 0; i < 3; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
        return board[i][0];
      }
    }

    // Verificar colunas
    for (let j = 0; j < 3; j++) {
      if (board[0][j] && board[0][j] === board[1][j] && board[0][j] === board[2][j]) {
        return board[0][j];
      }
    }

    // Verificar diagonais
    if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
      return board[0][0];
    }
    if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
      return board[0][2];
    }

    // Verificar empate
    if (board.every(row => row.every(cell => cell !== ''))) {
      return 'empate';
    }

    return null;
  };

  const handleJogada = (linha: number, coluna: number) => {
    if (tabuleiro[linha][coluna] || vencedor) return;

    const novoTabuleiro = tabuleiro.map(row => [...row]);
    novoTabuleiro[linha][coluna] = jogadorAtual;
    setTabuleiro(novoTabuleiro);
    setJogadas(prev => prev + 1);

    const resultado = verificarVencedor(novoTabuleiro);
    if (resultado) {
      setVencedor(resultado);
      if (resultado === jogadorAtual) {
        const novaPontuacao = pontos + 100;
        setPontos(novaPontuacao);
        updateHighScore(novaPontuacao);
      }
    } else {
      setJogadorAtual(prev => prev === 'X' ? 'O' : 'X');
    }
  };

  const reiniciarJogo = () => {
    setTabuleiro([
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ]);
    setJogadorAtual('X');
    setVencedor(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <button 
            onClick={onBack}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg transition-all"
          >
            ← Voltar
          </button>
          <div className="text-right">
            <p className="text-pink-400">Jogadas: {jogadas}</p>
            <p className="text-pink-400">Pontos: {pontos}</p>
            <p className="text-pink-400">Recorde: {highScore}</p>
            <p className="text-pink-400">Som: {gamePreferences.soundEnabled ? 'Ativado' : 'Desativado'}</p>
          </div>
        </header>

        <main className="text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-pink-500 mb-4">
              {vencedor 
                ? vencedor === 'empate' 
                  ? 'Empate!' 
                  : `Jogador ${vencedor} venceu!`
                : `Vez do Jogador ${jogadorAtual}`
              }
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            {tabuleiro.map((linha, i) => (
              linha.map((celula, j) => (
                <button
                  key={`${i}-${j}`}
                  onClick={() => handleJogada(i, j)}
                  disabled={!!celula || !!vencedor}
                  className={`aspect-square bg-white/5 rounded-xl border-2 
                    ${celula ? 'border-pink-500/50' : 'border-pink-500/20'} 
                    text-4xl font-bold flex items-center justify-center transition-all
                    ${!celula && !vencedor ? 'hover:border-pink-500/50 hover:bg-white/10' : ''}
                    ${celula === 'X' ? 'text-pink-500' : 'text-purple-500'}`}
                >
                  {celula}
                </button>
              ))
            ))}
          </div>

          {vencedor && (
            <button
              onClick={reiniciarJogo}
              className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 rounded-xl font-medium hover:opacity-90 shadow-lg"
            >
              Jogar Novamente
            </button>
          )}
        </main>
      </div>
    </div>
  );
} 