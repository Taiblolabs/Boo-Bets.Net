import { createClient } from '@supabase/supabase-js';

// Usar as variáveis globais do window ou fallback para os valores hardcoded
const supabaseUrl = typeof window !== 'undefined' && (window as any).SUPABASE_URL 
  ? (window as any).SUPABASE_URL 
  : 'https://dkhqpwgfvriqktaexmnz.supabase.co';

const supabaseAnonKey = typeof window !== 'undefined' && (window as any).SUPABASE_ANON_KEY 
  ? (window as any).SUPABASE_ANON_KEY 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraHFwd2dmdnJpcWt0YWV4bW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MjQ4NzIsImV4cCI6MjA1OTIwMDg3Mn0.LEf6sFujBvyKGEnqGWmbKPUeoAsBzwf5BWlCHqBi4Dw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Definición de tipos para las tablas
export interface UserProfile {
  id: string;
  wallet_address: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameScore {
  id: string;
  user_id: string;
  score: number;
  moves: number;
  time_seconds: number;
  completed: boolean;
  created_at: string;
}

export interface UserToken {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'reward' | 'purchase' | 'transfer';
  description: string;
  created_at: string;
}

// Funciones para interactuar con la base de datos
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile;
};

export const saveUserProfile = async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile)
    .select();

  if (error) {
    console.error('Error saving user profile:', error);
    return null;
  }

  return data[0] as UserProfile;
};

export const saveGameScore = async (score: Omit<GameScore, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('game_scores')
    .insert(score)
    .select();

  if (error) {
    console.error('Error saving game score:', error);
    return null;
  }

  return data[0] as GameScore;
};

export const getUserHighScores = async (userId: string, limit = 5) => {
  const { data, error } = await supabase
    .from('game_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching high scores:', error);
    return [];
  }

  return data as GameScore[];
};

export const getGlobalHighScores = async (limit = 10) => {
  const { data, error } = await supabase
    .from('game_scores')
    .select(`
      *,
      user_profiles (username, wallet_address)
    `)
    .eq('completed', true)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching global high scores:', error);
    return [];
  }

  return data;
};

export const addUserTokens = async (userId: string, amount: number, description: string) => {
  const { data, error } = await supabase
    .from('user_tokens')
    .insert({
      user_id: userId,
      amount: amount,
      transaction_type: 'reward',
      description: description
    })
    .select();

  if (error) {
    console.error('Error adding tokens:', error);
    return null;
  }

  return data[0] as UserToken;
};

export const getUserTokenBalance = async (userId: string) => {
  try {
    // Usar la función SQL personalizada para obtener el balance
    const { data, error } = await supabase.rpc('get_user_token_balance', { user_id: userId });
    
    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    
    // Fallback: calcular manualmente si la función RPC falla
    const { data, error: fetchError } = await supabase
      .from('user_tokens')
      .select('amount')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Error en fallback para obtener balance:', fetchError);
      return 0;
    }

    return data?.reduce((total, transaction) => total + transaction.amount, 0) || 0;
  }
}; 