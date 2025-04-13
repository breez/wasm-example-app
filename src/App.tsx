import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GetInfoResponse, Payment, SdkEvent } from '../pkg/breez_sdk_liquid_wasm';
import * as walletService from './services/walletService';
import LoadingSpinner from './components/LoadingSpinner';
import { ToastProvider, useToast } from './contexts/ToastContext';

// Import our page components
import HomePage from './pages/HomePage';
import RestorePage from './pages/RestorePage';
import GeneratePage from './pages/GeneratePage';
import WalletPage from './pages/WalletPage';

// Main App without toast functionality
const AppContent: React.FC = () => {
  // Screen navigation state
  const [currentScreen, setCurrentScreen] = useState<'home' | 'restore' | 'generate' | 'wallet'>('home');

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<GetInfoResponse | null>(null);
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usdRate, setUsdRate] = useState<number | null>(null);

  const { showToast } = useToast();

  // Add a ref to store the event listener ID
  const eventListenerIdRef = useRef<string | null>(null);

  // Function to refresh wallet data (usable via a callback)
  const refreshWalletData = useCallback(async (showLoading: boolean = true) => {
    if (!isConnected) return;

    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const info = await walletService.getWalletInfo();
      const txns = await walletService.getTransactions();

      setWalletInfo(info);
      setTransactions(txns);
    } catch (error) {
      console.error('Error refreshing wallet data:', error);
      setError('Failed to refresh wallet data.');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [isConnected]);

  // SDK event handler with toast notifications and auto-close of receive dialog
  const handleSdkEvent = useCallback((event: SdkEvent) => {
    console.log('SDK event received:', event);

    // Handle synced events
    if (event.type === 'synced') {
      console.log('Synced event received, refreshing data...');

      // If this is the first sync event after connecting, mark restoration as complete
      if (isRestoring) {
        setIsRestoring(false);
      }

      // Don't show loading indicator for automatic refresh
      refreshWalletData(false);
    }

    // Handle payment events with toast notifications
    if (event.type === 'paymentSucceeded') {
      console.log('Payment success event received');

      // Extract payment details if available
      const payment = event.details;

      if (payment) {
        let amountStr = `${payment.amountSat.toLocaleString()} sats`;

        // Check if this is a received payment
        if (payment.paymentType === 'receive') {
          showToast(
            'success',
            `Payment Received: ${amountStr}`,
          );
        } else {
          // For sent payments
          showToast(
            'success',
            `Payment Sent: ${amountStr}`,
          );
        }
      } else {
        showToast('success', 'Payment Successful', '');
      }

      refreshWalletData(false);
    } else if (event.type === 'paymentFailed') {
      showToast(
        'error',
        'Payment Failed',
      );

      refreshWalletData(false);
    } else if (event.type === 'paymentPending' || event.type == 'paymentWaitingConfirmation') {
      const payment = event.details;
      let amountStr = payment ? `${payment.amountSat.toLocaleString()} sats` : '';

      showToast(
        'info',
        `Payment Processing${amountStr ? `: ${amountStr}` : ''}`,
        'Your payment is being processed...'
      );
    }
  }, [refreshWalletData, showToast, isRestoring]);

  // Function to fetch fiat rates (USD specifically)
  const fetchUsdRate = useCallback(async () => {
    try {
      const rates = await walletService.fetchFiatRates();

      // Find USD rate
      const usdRate = rates.find(rate => rate.coin === 'USD');
      if (usdRate) {
        setUsdRate(usdRate.value);
      }
    } catch (error) {
      console.error('Failed to fetch fiat rates:', error);
    }
  }, []);

  // Set up periodic fiat rate fetching
  useEffect(() => {
    if (isConnected) {
      // Fetch immediately upon connection
      fetchUsdRate();

      // Then set up interval for every 30 seconds
      const interval = setInterval(fetchUsdRate, 30000);

      // Clean up interval on disconnect
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchUsdRate]);

  // Try to connect with saved mnemonic on app startup
  useEffect(() => {
    const checkForExistingWallet = async () => {
      const savedMnemonic = walletService.getSavedMnemonic();

      if (savedMnemonic) {
        try {
          setIsLoading(true);
          await connectWallet(savedMnemonic, false);
          setCurrentScreen('wallet'); // Navigate to wallet screen
        } catch (error) {
          console.error('Failed to connect with saved mnemonic:', error);
          setError('Failed to connect with saved mnemonic. Please try again.');
          walletService.clearMnemonic();
          setCurrentScreen('home'); // Go back to home screen on failure
          setIsLoading(false);
        }
      } else {
        setCurrentScreen('home'); // Show home screen if no saved mnemonic
        setIsLoading(false);
      }
    };

    checkForExistingWallet();

    // Clean up when unmounting
    return () => {
      if (isConnected) {
        walletService.disconnect()
          .catch(err => console.error('Error disconnecting wallet:', err));
      }
    };
  }, []);

  // Set up event listener when connected
  useEffect(() => {
    if (isConnected) {
      walletService.addEventListener(handleSdkEvent)
        .then(listenerId => {
          eventListenerIdRef.current = listenerId;
          console.log('Registered event listener with ID:', listenerId);
        })
        .catch(error => {
          console.error('Failed to add event listener:', error);
          setError('Failed to set up event listeners.');
        });

      return () => {
        // Clean up by removing the specific listener
        if (eventListenerIdRef.current) {
          walletService.removeEventListener(eventListenerIdRef.current)
            .catch(error => console.error('Error removing event listener:', error));
          eventListenerIdRef.current = null;
        }
      };
    }
  }, [isConnected, handleSdkEvent]);

  const connectWallet = async (mnemonic: string, restore: boolean) => {
    try {
      setIsLoading(true);
      setIsRestoring(restore); // Mark that we're restoring data      
      setError(null);

      // Initialize wallet with mnemonic
      await walletService.initWallet(mnemonic);

      // Save mnemonic for future use
      walletService.saveMnemonic(mnemonic);

      // Get wallet info and transactions
      const info = await walletService.getWalletInfo();
      const txns = await walletService.getTransactions();

      setWalletInfo(info);
      setTransactions(txns);

      setIsConnected(true);
      setCurrentScreen('wallet'); // Navigate to wallet screen
      // We'll keep isLoading true until first sync for new wallets
      setIsLoading(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet. Please check your mnemonic and try again.');
      setIsRestoring(false);
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const navigateToRestore = () => setCurrentScreen('restore');
  const navigateToGenerate = () => setCurrentScreen('generate');
  const navigateToHome = () => setCurrentScreen('home');
  const clearError = () => setError(null);

  // Determine which screen to render
  const renderCurrentScreen = () => {
    if (isLoading) {
      return (
        <div className="absolute inset-0 bg-[rgb(var(--background-rgb))] bg-opacity-80 z-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    switch (currentScreen) {
      case 'home':
        return (
          <HomePage
            onRestoreWallet={navigateToRestore}
            onCreateNewWallet={navigateToGenerate}
          />
        );

      case 'restore':
        return (
          <RestorePage
            onConnect={(mnemonic) => connectWallet(mnemonic, true)}
            onBack={navigateToHome}
            onClearError={clearError}
          />
        );

      case 'generate':
        return (
          <GeneratePage
            onMnemonicConfirmed={(mnemonic) => connectWallet(mnemonic, false)}
            onBack={navigateToHome}
            error={error}
            onClearError={clearError}
          />
        );

      case 'wallet':
        return (
          <WalletPage
            walletInfo={walletInfo}
            transactions={transactions}
            usdRate={usdRate}
            refreshWalletData={refreshWalletData}
            isRestoring={isRestoring}
            error={error}
            onClearError={clearError}
          />
        );

      default:
        return <div>Unknown screen</div>;
    }
  };

  return renderCurrentScreen();
};

// Wrap the App with ToastProvider
function App() {
  return (
    <ToastProvider>
      <div className="flex-grow flex main-wrapper">
        <div className="flex-grow max-w-4xl mx-auto">
          <AppContent />
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
