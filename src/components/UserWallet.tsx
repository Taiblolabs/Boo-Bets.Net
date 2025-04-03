import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '../mocks/privyMock';
import { useAuth } from '../context/AuthContext';
import { getUserBalance } from '../services/GameService';

const UserWallet = () => {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { userProfile } = useAuth();
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  useEffect(() => {
    const loadUserBalance = async () => {
      if (userProfile) {
        setIsLoading(true);
        try {
          const balance = await getUserBalance(userProfile.id);
          setTokenBalance(balance);
        } catch (error) {
          console.error('Error loading token balance:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserBalance();
  }, [userProfile]);

  // Função para formatar o endereço da carteira
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Função para formatar o saldo (exemplo)
  const formatBalance = (balance: string) => {
    const balanceNum = parseFloat(balance);
    return balanceNum.toFixed(4);
  };

  return (
    <div className="bg-pink-900/20 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
      <h3 className="text-xl font-semibold mb-2 text-pink-300">Sua Carteira</h3>
      
      {embeddedWallet ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-pink-200">Endereço:</span>
            <span className="text-white font-mono bg-pink-900/40 px-2 py-1 rounded-md text-sm">
              {formatAddress(embeddedWallet.address)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-pink-200">Tipo:</span>
            <span className="bg-pink-500/20 text-white text-xs px-2 py-1 rounded-full">
              {embeddedWallet.walletClientType === 'privy' ? 'Carteira BooBets' : embeddedWallet.walletClientType}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-pink-200">Saldo ETH:</span>
            <span className="text-white font-bold">
              0.0000 ETH
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-pink-200">BooTokens:</span>
            <span className="text-pink-400 font-bold flex items-center">
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : null}
              {tokenBalance} <span className="text-xs ml-1">BOOT</span>
            </span>
          </div>
        </div>
      ) : (
        <p className="text-pink-300 text-sm">
          Conecte sua carteira para ver os detalhes.
        </p>
      )}
      
      {userProfile && (
        <div className="mt-4 pt-4 border-t border-pink-500/20">
          <div className="flex justify-between items-center">
            <span className="text-pink-200 text-sm">Usuário:</span>
            <span className="text-white text-sm">
              {userProfile.username || 'Sem nome'}
            </span>
          </div>
          {userProfile.email && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-pink-200 text-sm">Email:</span>
              <span className="text-white text-sm">
                {userProfile.email}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserWallet; 