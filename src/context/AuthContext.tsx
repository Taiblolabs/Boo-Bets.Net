import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePrivy } from '../mocks/privyMock';
import { supabase, getUserProfile, saveUserProfile, UserProfile } from '../config/supabase';

interface AuthContextType {
  loading: boolean;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  error: string | null;
  loginWithWallet: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  loading: true,
  isAuthenticated: false,
  userProfile: null,
  error: null,
  loginWithWallet: async () => {},
  logout: async () => {},
  updateProfile: async () => null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authenticated, user, login: privyLogin, logout: privyLogout } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar el estado de autenticación de Privy con Supabase
  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (authenticated && user?.wallet?.address) {
        setLoading(true);
        setError(null);
        try {
          // Primero verificar si el usuario existe en Supabase
          const userId = user.id;
          let profile = await getUserProfile(userId);
          
          // Si no existe, crear un perfil
          if (!profile) {
            profile = await saveUserProfile({
              id: userId,
              wallet_address: user.wallet.address,
              email: user.email?.address || null,
              username: null,
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
            if (!profile) {
              throw new Error("Não foi possível criar um perfil de usuário");
            }
          }
          
          setUserProfile(profile);
        } catch (err) {
          console.error('Error sincronizando usuário com Supabase:', err);
          setError(`Erro ao sincronizar usuário: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        } finally {
          setLoading(false);
        }
      } else if (!authenticated) {
        setUserProfile(null);
      }
    };

    syncUserWithSupabase();
  }, [authenticated, user]);

  // Función para conectar la wallet
  const loginWithWallet = async () => {
    // Limpiar errores anteriores
    setError(null);
    
    try {
      setLoading(true);
      console.log("Iniciando autenticación...");
      
      // Intentar login con Privy
      await privyLogin();
      console.log("Autenticación exitosa");
      
      // El estado de autenticación se actualizará en el useEffect
    } catch (err) {
      console.error('Erro durante login:', err);
      setError(`Erro no login: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para desconectar la wallet
  const logout = async () => {
    setError(null);
    
    try {
      setLoading(true);
      await privyLogout();
      setUserProfile(null);
    } catch (err) {
      console.error('Erro durante logout:', err);
      setError(`Erro no logout: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!userProfile) return null;
    
    setError(null);
    try {
      const updatedProfile = await saveUserProfile({
        ...data,
        id: userProfile.id,
        updated_at: new Date().toISOString()
      });
      
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      } else {
        throw new Error("Não foi possível atualizar o perfil");
      }
      
      return updatedProfile;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(`Erro ao atualizar perfil: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        isAuthenticated: authenticated,
        userProfile,
        error,
        loginWithWallet,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 