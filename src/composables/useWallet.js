import { ref } from 'vue';
import { ethers } from 'ethers';

export const useWallet = () => {
  const wallet = ref(null);
  const provider = ref(null);
  const signer = ref(null);
  const address = ref('');
  const chainId = ref(null);
  const network = ref(null);
  const balance = ref('0');
  const isConnected = ref(false);
  
  const connectWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      console.log('Requesting accounts...');
      
      // Request account access using the direct ethereum API
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      console.log('Accounts received:', accounts);

      // Set the address directly from the accounts
      address.value = accounts[0];
      
      // Get chain ID
      const chainIdHex = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      chainId.value = parseInt(chainIdHex, 16);
      
      // Get balance using direct RPC call
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });
      
      // Convert balance from hex to decimal and then to ether
      const balanceWei = BigInt(balanceHex);
      balance.value = ethers.formatEther(balanceWei);
      
      // Set connected status
      isConnected.value = true;
      
      // Store the ethereum provider for later use
      provider.value = window.ethereum;
      
      console.log('Wallet connected successfully:', {
        address: address.value,
        chainId: chainId.value,
        balance: balance.value
      });

    } catch (error) {
      console.error('Error connecting wallet:', error);
      isConnected.value = false;
      address.value = '';
      balance.value = '0';
      alert('Failed to connect wallet: ' + error.message);
    }
  };

  const disconnectWallet = () => {
    provider.value = null;
    signer.value = null;
    address.value = '';
    chainId.value = null;
    network.value = null;
    balance.value = '0';
    isConnected.value = false;
  };

  return {
    wallet,
    provider,
    signer,
    address,
    chainId,
    network,
    balance,
    isConnected,
    connectWallet,
    disconnectWallet
  };
};