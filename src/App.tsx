// Deploy-ready React memory game app for FTP public_html/boo-bets.net
// Steps after build:
// 1. Run: npm run build
// 2. Upload the contents of 'dist' to ftp://82.25.72.132 or ftp://boo-bets.net using username: u366262974 and password: 454799Wonka@
// 3. Place files into 'public_html/boo-bets.net' directory

import { useState } from 'react';
import './App.css';
import { useAuth } from './context/AuthContext';
import { CookieProvider } from './context/CookieContext';
import MemoryGameWithRewards from './components/MemoryGameWithRewards';
import BoardGame from './components/BoardGame';
import LandingPage from './components/LandingPage';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';

type GameType = 'none' | 'memory' | 'board';

function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('none');
  const { error } = useAuth();
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center">
      <div className="text-white text-xl">Cargando...</div>
    </div>;
  }

  const renderGame = () => {
    if (!authenticated) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex flex-col items-center justify-center">
          <h1 className="text-white text-2xl mb-4">Bienvenido a Boo-Bets</h1>
          <button 
            onClick={login}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            Conectar con Privy
          </button>
        </div>
      );
    }

    switch (currentGame) {
      case 'memory':
        return <MemoryGameWithRewards onBack={() => setCurrentGame('none')} />;
      case 'board':
        return <BoardGame onBack={() => setCurrentGame('none')} />;
      default:
        return (
          <LandingPage 
            onStartMemory={() => setCurrentGame('memory')}
            onStartBoard={() => setCurrentGame('board')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800">
      {authenticated && (
        <div className="absolute top-4 right-4">
          <button 
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Cerrar sesión
          </button>
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      {renderGame()}
    </div>
  );
}

export default function AppWithProviders() {
  return (
    <PrivyProvider
      appId="cm8w2befe00q3kv43z1scpu1s"
      config={{
        loginMethods: ['email', 'wallet', 'google', 'twitter'],
        appearance: {
          theme: 'dark',
          accentColor: '#3B82F6',
        },
      }}
    >
      <CookieProvider>
        <App />
      </CookieProvider>
    </PrivyProvider>
  );
}
