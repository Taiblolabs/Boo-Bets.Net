declare module '@privy-io/react-auth' {
  export interface PrivyUser {
    id: string;
    wallet?: {
      address: string;
      chainId: string;
    };
    email?: {
      address: string;
      verified: boolean;
    };
    phone?: {
      number: string;
      verified: boolean;
    };
  }

  export interface PrivyWallet {
    address: string;
    chainId: string;
    walletClientType: string;
  }

  export interface UsePrivyReturn {
    ready: boolean;
    authenticated: boolean;
    user: PrivyUser | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    linkEmail: (email: string) => Promise<void>;
    linkWallet: () => Promise<void>;
    linkPhone: (phone: string) => Promise<void>;
    unlinkEmail: () => Promise<void>;
    unlinkWallet: (wallet: { address: string }) => Promise<void>;
    unlinkPhone: () => Promise<void>;
  }

  export interface UseWalletsReturn {
    wallets: PrivyWallet[];
    connectWallet: () => Promise<void>;
    disconnect: (wallet: PrivyWallet) => Promise<void>;
  }

  export function usePrivy(): UsePrivyReturn;
  export function useWallets(): UseWalletsReturn;

  export interface PrivyProviderProps {
    appId: string;
    children: React.ReactNode;
    config?: {
      loginMethods?: string[];
      appearance?: {
        theme?: 'light' | 'dark';
        accentColor?: string;
        logo?: string;
      };
      embeddedWallets?: {
        createOnLogin?: 'all' | 'users-without-wallets' | 'none';
      };
    };
  }

  export function PrivyProvider(props: PrivyProviderProps): JSX.Element;
} 