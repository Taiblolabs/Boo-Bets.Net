import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/GameService';
import { useAuth } from '../context/AuthContext';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  moves: number;
  time_seconds: number;
  created_at: string;
  user_profiles: {
    username: string | null;
    wallet_address: string;
  };
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard(5);
        setLeaderboard(data as LeaderboardEntry[]);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Formata o endereço da carteira
  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Formata o timestamp para uma data legível
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-pink-900/20 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
      <h3 className="text-xl font-semibold mb-4 text-pink-300">Melhores Pontuações</h3>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <span className="inline-block w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="ml-2 text-pink-300">Carregando...</span>
        </div>
      ) : leaderboard.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-pink-300 border-b border-pink-800/50">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Jogador</th>
                <th className="py-2 px-2 text-right">Pontos</th>
                <th className="py-2 px-2 text-right">Movimentos</th>
                <th className="py-2 px-2 text-right">Data</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                const isCurrentUser = userProfile && entry.user_id === userProfile.id;
                return (
                  <tr
                    key={entry.id}
                    className={`border-b border-pink-800/30 ${isCurrentUser ? 'bg-pink-900/30' : ''}`}
                  >
                    <td className="py-2 px-2">{index + 1}</td>
                    <td className="py-2 px-2">
                      {entry.user_profiles.username || formatWalletAddress(entry.user_profiles.wallet_address)}
                      {isCurrentUser && <span className="ml-2 text-xs text-pink-400">(Você)</span>}
                    </td>
                    <td className="py-2 px-2 text-right font-bold">{entry.score}</td>
                    <td className="py-2 px-2 text-right">{entry.moves}</td>
                    <td className="py-2 px-2 text-right text-xs">{formatDate(entry.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-pink-300 py-4">Nenhuma pontuação registrada ainda</p>
      )}
    </div>
  );
};

export default Leaderboard; 