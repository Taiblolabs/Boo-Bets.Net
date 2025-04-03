import { saveGameScore, addUserTokens, getUserTokenBalance, getUserHighScores, getGlobalHighScores } from '../config/supabase';

export interface GameResult {
  userId: string;
  score: number;
  moves: number;
  timeSeconds: number;
  completed: boolean;
}

export const saveGameResult = async (result: GameResult) => {
  try {
    // Guardar el resultado del juego
    const savedScore = await saveGameScore({
      user_id: result.userId,
      score: result.score,
      moves: result.moves,
      time_seconds: result.timeSeconds,
      completed: result.completed
    });

    // Si el juego se completó, recompensar al usuario con tokens
    if (result.completed) {
      const tokens = calculateTokenReward(result);
      await addUserTokens(
        result.userId, 
        tokens, 
        `Recompensa por completar el juego con ${result.score} puntos en ${result.moves} movimientos`
      );
    }

    return savedScore;
  } catch (error) {
    console.error('Error al guardar el resultado del juego:', error);
    return null;
  }
};

export const calculateTokenReward = (result: GameResult): number => {
  // Lógica básica de recompensas: 
  // Base de 100 tokens por completar
  // -50 por cada movimiento adicional más allá de 16 (mínimo posible)
  // +10 por cada punto de score
  let tokens = 100;
  
  // Penalización por movimientos extras
  const minimumPossibleMoves = 16; // 8 pares * 2 movimientos mínimos
  const extraMoves = Math.max(0, result.moves - minimumPossibleMoves);
  tokens -= (extraMoves * 50);
  
  // Bonificación por score
  tokens += (result.score * 10);
  
  // Garantizar un mínimo de 50 tokens
  tokens = Math.max(50, tokens);
  
  return tokens;
};

export const getUserBalance = async (userId: string): Promise<number> => {
  try {
    return await getUserTokenBalance(userId);
  } catch (error) {
    console.error('Error al obtener balance de tokens:', error);
    return 0;
  }
};

export const getUserScores = async (userId: string, limit = 5) => {
  try {
    return await getUserHighScores(userId, limit);
  } catch (error) {
    console.error('Error al obtener puntuaciones del usuario:', error);
    return [];
  }
};

export const getLeaderboard = async (limit = 10) => {
  try {
    return await getGlobalHighScores(limit);
  } catch (error) {
    console.error('Error al obtener tabla de clasificación:', error);
    return [];
  }
}; 