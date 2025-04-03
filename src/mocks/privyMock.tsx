import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PrivyUser {
  id: string;
  wallet?: {
    address: string;
    chainId: string;
  };
  email?: {
    address: string;
    verified: boolean;
  };
}

interface PrivyWallet {
  address: string;
  chainId: string;
  walletClientType: string;
}

interface PrivyContextType {
  ready: boolean;
  authenticated: boolean;
  user: PrivyUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

interface WalletsContextType {
  wallets: PrivyWallet[];
  connectWallet: () => Promise<void>;
  disconnect: (wallet: PrivyWallet) => Promise<void>;
}

// Mock do contexto do Privy
const PrivyContext = createContext<PrivyContextType>({
  ready: false,
  authenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
});

// Mock do contexto de Wallets
const WalletsContext = createContext<WalletsContextType>({
  wallets: [],
  connectWallet: async () => {},
  disconnect: async () => {},
});

// Hook para usar o Privy mock
export const usePrivy = () => useContext(PrivyContext);

// Hook para usar Wallets mock
export const useWallets = () => useContext(WalletsContext);

// Provider que simula o comportamento do Privy
export const PrivyProvider: React.FC<{
  appId: string;
  config?: any;
  children: ReactNode;
}> = ({ children }) => {
  // Estado inicial desconectado para permitir la conexión manual
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<PrivyUser | null>(null);
  const [wallets, setWallets] = useState<PrivyWallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simula o login
  const login = async () => {
    setIsLoading(true);
    
    // Simular una carga breve para dar feedback visual
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Gera um endereço de carteira aleatório
    const randomAddress = '0x' + Array.from({length: 40}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
    
    setUser({
      id: 'mock-user-id',
      wallet: {
        address: randomAddress,
        chainId: '1', // Ethereum mainnet
      },
      email: {
        address: 'demo@boobets.net',
        verified: true,
      },
    });
    
    setWallets([
      {
        address: randomAddress,
        chainId: '1',
        walletClientType: 'privy',
      }
    ]);
    
    setAuthenticated(true);
    setIsLoading(false);
  };

  // Simula o logout
  const logout = async () => {
    setIsLoading(true);
    
    // Simular una carga breve
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUser(null);
    setWallets([]);
    setAuthenticated(false);
    setIsLoading(false);
  };

  // Simula a conexão de uma carteira
  const connectWallet = async () => {
    setIsLoading(true);
    
    // Simular una carga breve
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const randomAddress = '0x' + Array.from({length: 40}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
    
    setWallets(prev => [
      ...prev,
      {
        address: randomAddress,
        chainId: '1',
        walletClientType: 'metamask',
      }
    ]);
    
    setIsLoading(false);
  };

  // Simula a desconexão de uma carteira
  const disconnect = async (wallet: PrivyWallet) => {
    setIsLoading(true);
    
    // Simular una carga breve
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setWallets(prev => prev.filter(w => w.address !== wallet.address));
    setIsLoading(false);
  };

  const privyValue = {
    ready: true,
    authenticated,
    user,
    login,
    logout,
  };

  const walletsValue = {
    wallets,
    connectWallet,
    disconnect,
  };

  return (
    <PrivyContext.Provider value={privyValue}>
      <WalletsContext.Provider value={walletsValue}>
        {children}
      </WalletsContext.Provider>
    </PrivyContext.Provider>
  );
};

// Exportamos como módulo para usar no lugar do módulo original
export default {
  usePrivy,
  useWallets,
  PrivyProvider,
}; 