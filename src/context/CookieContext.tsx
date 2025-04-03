import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface CookieContextType {
  highScore: number;
  updateHighScore: (score: number) => void;
  gamePreferences: {
    soundEnabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  updateGamePreferences: (prefs: Partial<{ soundEnabled: boolean; difficulty: 'easy' | 'medium' | 'hard' }>) => void;
  lastPlayedGame: string | null;
  updateLastPlayedGame: (game: string) => void;
}

const CookieContext = createContext<CookieContextType | null>(null);

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [highScore, setHighScore] = useState(() => {
    const saved = Cookies.get('highScore');
    return saved ? parseInt(saved) : 0;
  });

  const [gamePreferences, setGamePreferences] = useState(() => {
    const saved = Cookies.get('gamePreferences');
    return saved ? JSON.parse(saved) : {
      soundEnabled: true,
      difficulty: 'medium'
    };
  });

  const [lastPlayedGame, setLastPlayedGame] = useState(() => {
    return Cookies.get('lastPlayedGame') || null;
  });

  const updateHighScore = (score: number) => {
    if (score > highScore) {
      setHighScore(score);
      Cookies.set('highScore', score.toString(), { expires: 365 });
    }
  };

  const updateGamePreferences = (prefs: Partial<{ soundEnabled: boolean; difficulty: 'easy' | 'medium' | 'hard' }>) => {
    const newPrefs = { ...gamePreferences, ...prefs };
    setGamePreferences(newPrefs);
    Cookies.set('gamePreferences', JSON.stringify(newPrefs), { expires: 365 });
  };

  const updateLastPlayedGame = (game: string) => {
    setLastPlayedGame(game);
    Cookies.set('lastPlayedGame', game, { expires: 7 });
  };

  useEffect(() => {
    // Verificar si las cookies existen al montar el componente
    if (!Cookies.get('highScore')) {
      Cookies.set('highScore', '0', { expires: 365 });
    }
    if (!Cookies.get('gamePreferences')) {
      Cookies.set('gamePreferences', JSON.stringify({
        soundEnabled: true,
        difficulty: 'medium'
      }), { expires: 365 });
    }
  }, []);

  return (
    <CookieContext.Provider value={{
      highScore,
      updateHighScore,
      gamePreferences,
      updateGamePreferences,
      lastPlayedGame,
      updateLastPlayedGame
    }}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookies must be used within a CookieProvider');
  }
  return context;
} 