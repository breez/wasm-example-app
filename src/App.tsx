import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GetInfoResponse, Payment, SdkEvent } from '../pkg/breez_sdk_liquid_wasm';
import * as walletService from './services/walletService';
import CollapsingWalletHeader from './components/CollapsingWalletHeader';
import TransactionList from './components/TransactionList';
import MnemonicInput from './components/MnemonicInput';
import LoadingSpinner from './components/LoadingSpinner';
import SendPaymentDialog from './components/SendPaymentDialog';
import ReceivePaymentDialog from './components/ReceivePaymentDialog';
import PaymentDetailsDialog from './components/PaymentDetailsDialog';
import HomePage from './components/HomePage';
import GenerateMnemonicPage from './components/GenerateMnemonicPage';
import { ToastProvider, useToast } from './contexts/ToastContext';

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
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState<boolean>(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState<boolean>(false);
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const { showToast } = useToast();
  const transactionsContainerRef = useRef<HTMLDivElement>(null);
  const collapseThreshold = 100; // pixels of scroll before header is fully collapsed

  // Add a ref to store the event listener ID
  const eventListenerIdRef = useRef<string | null>(null);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (transactionsContainerRef.current) {
      const scrollTop = transactionsContainerRef.current.scrollTop;
      // Calculate scroll progress from 0 to 1
      const progress = Math.min(1, scrollTop / collapseThreshold);
      setScrollProgress(progress);
    }
  }, [collapseThreshold]);

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

          // Close the receive dialog if it's open
          if (isReceiveDialogOpen) {
            setIsReceiveDialogOpen(false);
          }
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

      // Close the receive dialog if it's open
      if (isReceiveDialogOpen) {
        setIsReceiveDialogOpen(false);
      }
    }
  }, [refreshWalletData, showToast, isReceiveDialogOpen, isRestoring]);

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

  // Handler for payment selection from the transaction list
  const handlePaymentSelected = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
  }, []);

  // Handler for closing payment details dialog
  const handlePaymentDetailsClose = useCallback(() => {
    setSelectedPayment(null);
  }, []);

  // Handler for closing the send dialog and refreshing data
  const handleSendDialogClose = useCallback(() => {
    setIsSendDialogOpen(false);
    // Refresh wallet data to show any new transactions
    refreshWalletData(false);
  }, [refreshWalletData]);

  // Handler for closing the receive dialog and refreshing data
  const handleReceiveDialogClose = useCallback(() => {
    setIsReceiveDialogOpen(false);
    // Refresh wallet data to show any new transactions
    refreshWalletData(false);
  }, [refreshWalletData]);

  // Navigation handlers
  const navigateToRestore = () => setCurrentScreen('restore');
  const navigateToGenerate = () => setCurrentScreen('generate');
  const navigateToHome = () => setCurrentScreen('home');

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
          <div className="container mx-auto max-w-md py-8 px-4">
            <h1 className="text-2xl font-bold text-[rgb(var(--text-white))] mb-6">
              Restore Wallet
            </h1>
            <MnemonicInput
              onConnect={(mnemonic) => connectWallet(mnemonic, true)}
              onBack={navigateToHome}
            />
          </div>
        );

      case 'generate':
        return (
          <GenerateMnemonicPage
            onMnemonicConfirmed={(mnemonic) => connectWallet(mnemonic, false)}
            onBack={navigateToHome}
          />
        );

      case 'wallet':
        return (
          <div className="flex flex-col h-[calc(100dvh)] relative">
            {/* Show restoration overlay if we're restoring */}
            {isRestoring && (
              <div className="absolute inset-0 bg-[rgb(var(--background-rgb))] bg-opacity-80 z-50 flex items-center justify-center">
                <LoadingSpinner text="Restoring wallet data..." />
              </div>
            )}

            {/* Fixed position header that collapses on scroll */}
            <div className="sticky top-0 z-10 bg-[rgb(var(--background-rgb))]">
              <CollapsingWalletHeader
                walletInfo={walletInfo}
                usdRate={usdRate}
                scrollProgress={scrollProgress}
              />
            </div>

            {/* Scrollable transaction list */}
            <div
              ref={transactionsContainerRef}
              className="flex-grow overflow-y-auto"
              onScroll={handleScroll}
            >
              <TransactionList
                transactions={transactions}
                onPaymentSelected={handlePaymentSelected}
              />
            </div>

            {/* Send Payment Dialog */}
            {isConnected && (
              <SendPaymentDialog
                isOpen={isSendDialogOpen}
                onClose={handleSendDialogClose}
                walletService={walletService}
                transactionsListRef={transactionsContainerRef}
              />
            )}

            {/* Receive Payment Dialog */}
            {isConnected && (
              <ReceivePaymentDialog
                isOpen={isReceiveDialogOpen}
                onClose={handleReceiveDialogClose}
                walletService={walletService}
              />
            )}

            {/* Payment Details Dialog */}
            <PaymentDetailsDialog
              optionalPayment={selectedPayment}
              onClose={handlePaymentDetailsClose}
            />

            <div className="bottom-bar h-16 bg-[var(--primary-blue)] shadow-lg flex items-center justify-center px-6 z-30">
              <button
                onClick={() => setIsSendDialogOpen(true)}
                className="flex items-center text-white px-16 py-2 rounded-lg hover:bg-[var(--secondary-blue)] transition-colors"
              >
                <span className="text-xl mr-2">↑</span>
                <span className="font-medium">Send</span>
              </button>

              <button
                onClick={() => setIsReceiveDialogOpen(true)}
                className="flex items-center text-white px-16 py-2 rounded-lg hover:bg-[var(--secondary-blue)] transition-colors"
              >
                <span className="font-medium">Receive</span>
                <span className="text-xl ml-2">↓</span>
              </button>
            </div>
          </div>
        );

      default:
        return <div>Unknown screen</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background-rgb))]">
      <main className="container mx-auto max-w-4xl flex-grow overflow-hidden">
        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded mb-4 mt-4 mx-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-white"
            >
              &times;
            </button>
          </div>
        )}

        {renderCurrentScreen()}
      </main>
    </div>
  );
};

// Wrap the App with ToastProvider
function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
