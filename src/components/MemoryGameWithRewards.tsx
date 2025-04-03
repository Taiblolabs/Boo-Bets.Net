import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCookies } from '../context/CookieContext';

interface MemoryGameWithRewardsProps {
  onBack: () => void;
}

const EMOJIS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯'];

export default function MemoryGameWithRewards({ onBack }: MemoryGameWithRewardsProps) {
  const { isAuthenticated } = useAuth();
  const { highScore, updateHighScore, gamePreferences, updateLastPlayedGame } = useCookies();

  const [cards, setCards] = useState<Array<{ emoji: string; isFlipped: boolean; isMatched: boolean }>>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  useEffect(() => {
    updateLastPlayedGame('memory');
    initializeGame();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const initializeGame = () => {
    const gameEmojis = [...EMOJIS, ...EMOJIS];
    const shuffledEmojis = gameEmojis.sort(() => Math.random() - 0.5);
    setCards(shuffledEmojis.map((emoji, index) => ({
      emoji,
      isFlipped: false,
      isMatched: false
    })));
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setIsPlaying(true);
    setFlippedCards([]);
  };

  const handleCardClick = (index: number) => {
    if (!isPlaying || flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIndex, secondIndex] = newFlippedCards;

      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setMatches(prev => {
          const newMatches = prev + 1;
          if (newMatches === EMOJIS.length) {
            const score = calculateScore();
            if (score > highScore) {
              updateHighScore(score);
            }
            setIsPlaying(false);
          }
          return newMatches;
        });
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const calculateScore = () => {
    const baseScore = 1000;
    const timeDeduction = Math.floor(timer / 10) * 10;
    const movesDeduction = (moves - EMOJIS.length) * 20;
    return Math.max(0, baseScore - timeDeduction - movesDeduction);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <button 
            onClick={onBack}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg transition-all"
          >
            ← Back
          </button>
          <div className="text-right">
            <p className="text-cyan-400">High Score: {highScore}</p>
            <p className="text-cyan-400">Sound: {gamePreferences.soundEnabled ? '🔊' : '🔇'}</p>
          </div>
        </header>

        <main>
          <div className="bg-black border border-cyan-400 rounded-lg p-4 flex justify-between items-center shadow-[0_0_8px_rgba(0,255,255,0.4)] mb-6">
            <div className="text-cyan-400 flex items-center gap-2">
              <span>🕒</span>
              <span>{formatTime(timer)}</span>
            </div>
            <div className="text-pink-300">Moves: {moves}</div>
            <div className="text-pink-300">Matches: {matches}/{EMOJIS.length}</div>
            <div className="flex gap-2">
              <button 
                onClick={initializeGame}
                className="bg-transparent border border-pink-500 px-2 py-1 rounded hover:bg-pink-500/10 transition-all"
              >
                🔄
              </button>
              <button 
                className="bg-transparent border border-pink-500 px-2 py-1 rounded hover:bg-pink-500/10 transition-all"
                onClick={() => alert('Settings coming soon!')}
              >
                ⚙️
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                disabled={!isPlaying || card.isMatched}
                className={`w-full aspect-square flex items-center justify-center text-4xl font-bold rounded-lg shadow-lg transition-all transform hover:scale-105
                  ${card.isFlipped || card.isMatched 
                    ? 'bg-gradient-to-br from-cyan-500 to-purple-600' 
                    : 'bg-gradient-to-br from-pink-500 to-purple-600'}`}
              >
                {card.isFlipped || card.isMatched ? card.emoji : '?'}
              </button>
            ))}
          </div>

          {!isPlaying && matches === EMOJIS.length && (
            <div className="bg-black border border-pink-500 rounded-lg p-6 text-center shadow-[0_0_10px_rgba(255,0,255,0.3)]">
              <h2 className="text-3xl font-bold text-pink-400 mb-4">¡Congratulations!</h2>
              <p className="text-cyan-400 mb-4">
                You completed the game in {formatTime(timer)} with {moves} moves!
                <br />
                Score: {calculateScore()} points
                {calculateScore() > highScore && ' - New High Score! 🏆'}
              </p>
              <button
                onClick={initializeGame}
                className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 rounded-lg shadow-lg hover:opacity-90 transition"
              >
                Play Again
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 