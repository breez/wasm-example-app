import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GetInfoResponse, Payment, SdkEvent } from '../pkg/breez_sdk_liquid_wasm';
import * as walletService from './services/walletService';
import CollapsingWalletHeader from './components/CollapsingWalletHeader';
import TransactionList from './components/TransactionList';
import MnemonicInput from './components/MnemonicInput';
import LoadingSpinner from './components/LoadingSpinner';
import SendPaymentDialog from './components/SendPaymentDialog';
import ReceivePaymentDialog from './components/ReceivePaymentDialog';
import { ToastProvider, useToast } from './contexts/ToastContext';

// Main App without toast functionality
const AppContent: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<GetInfoResponse | null>(null);
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState<boolean>(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState<boolean>(false);

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

  // Try to connect with saved mnemonic on app startup
  useEffect(() => {
    const connectWithSavedMnemonic = async () => {
      const savedMnemonic = walletService.getSavedMnemonic();
      if (savedMnemonic) {
        try {
          setIsLoading(true);
          await connectWallet(savedMnemonic, false);
        } catch (error) {
          console.error('Failed to connect with saved mnemonic:', error);
          setError('Failed to connect with saved mnemonic. Please try again.');
          walletService.clearMnemonic();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    connectWithSavedMnemonic();

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
      // We'll keep isLoading true until first sync for new wallets
      setIsLoading(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet. Please check your mnemonic and try again.');
      setIsRestoring(false);
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background-rgb))]">
      <header className="bg-[rgb(var(--card-bg))] p-4 shadow-md flex justify-between items-center">
        {/* Header content */}
      </header>

      <main className="container mx-auto p-4 max-w-4xl flex-grow overflow-hidden">
        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {!isConnected ? (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--text-white))]">
                  Connect Your Wallet
                </h2>
                <MnemonicInput onConnect={(m) => connectWallet(m, true)} />
              </div>
            ) : (
              <div className="flex flex-col h-[calc(100vh-120px)] relative">
                {/* Show restoration overlay if we're restoring */}
                {isRestoring && (
                  <div className="absolute inset-0 bg-[rgb(var(--background-rgb))] bg-opacity-80 z-50 flex items-center justify-center">
                    <LoadingSpinner text="Restoring wallet data..." />
                  </div>
                )}

                {/* Fixed position header that collapses on scroll */}
                <div className="sticky top-0 z-10 pb-2 bg-[rgb(var(--background-rgb))]">
                  <CollapsingWalletHeader
                    walletInfo={walletInfo}
                    onRefresh={() => refreshWalletData(true)}
                    scrollProgress={scrollProgress}
                  />

                  {/* Floating Send/Receive buttons */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-6 flex space-x-4 z-20">
                    <button
                      className="action-button bg-[var(--primary-blue)] hover:bg-[var(--secondary-blue)]"
                      onClick={() => setIsSendDialogOpen(true)}
                    >
                      <span className="action-icon">↑</span>
                      <span>Send</span>
                    </button>
                    <div className="w-12" />
                    <button
                      className="action-button bg-[var(--primary-blue)] hover:bg-[var(--secondary-blue)]"
                      onClick={() => setIsReceiveDialogOpen(true)}
                    >
                      <span className="action-icon">↓</span>
                      <span>Receive</span>
                    </button>
                  </div>
                </div>

                {/* Scrollable transaction list */}
                <div
                  ref={transactionsContainerRef}
                  className="flex-grow overflow-y-auto mt-2"
                  onScroll={handleScroll}
                >
                  <TransactionList transactions={transactions} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Send Payment Dialog - Pass walletService instead of sdk */}
        {isConnected && (
          <SendPaymentDialog
            isOpen={isSendDialogOpen}
            onClose={handleSendDialogClose}
            walletService={walletService}
          />
        )}

        {/* Receive Payment Dialog - Pass walletService instead of sdk */}
        {isConnected && (
          <ReceivePaymentDialog
            isOpen={isReceiveDialogOpen}
            onClose={handleReceiveDialogClose}
            walletService={walletService}
          />
        )}
      </main>

      <footer className="p-4 text-center">
        <p>Lightning Wallet - Powered by Breez SDK</p>
      </footer>
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
