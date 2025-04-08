import * as breezSdk from '../../pkg/breez_sdk_liquid_wasm';

// Private SDK instance - not exposed outside this module
let sdk: breezSdk.BindingLiquidSdk | null = null;

export const initWallet = async (mnemonic: string): Promise<void> => {
  try {
    const config = breezSdk.defaultConfig('mainnet');
    // Configure working directory and cache dir
    config.workingDir = './breez_data';
    config.cacheDir = './breez_cache';

    // Get the API key from environment variables
    const breezApiKey = import.meta.env.VITE_BREEZ_API_KEY;

    if (!breezApiKey) {
      throw new Error('Breez API key not found in environment variables');
    }

    config.breezApiKey = breezApiKey;

    // Connect to Breez network with user mnemonic
    sdk = await breezSdk.connect({
      config,
      mnemonic,
    });

    // Return void instead of the SDK instance
  } catch (error) {
    console.error('Failed to initialize wallet:', error);
    throw error;
  }
};

// Remove getSdk() method

// Add specific methods for actions components need to perform
// Payment Operations
export const parseInput = async (input: string): Promise<breezSdk.InputType> => {
  if (!sdk) throw new Error('SDK not initialized');
  return await sdk.parse(input);
};

export const prepareSendPayment = async (
  params: breezSdk.PrepareSendRequest
): Promise<breezSdk.PrepareSendResponse> => {
  if (!sdk) throw new Error('SDK not initialized');
  return await sdk.prepareSendPayment(params);
};

export const sendPayment = async (
  params: breezSdk.SendPaymentRequest
): Promise<breezSdk.SendPaymentResponse> => {
  if (!sdk) throw new Error('SDK not initialized');
  return await sdk.sendPayment(params);
};

// Invoice and Receiving Operations
export const fetchLightningLimits = async (): Promise<breezSdk.LightningPaymentLimitsResponse> => {
  if (!sdk) throw new Error('SDK not initialized');
  return await sdk.fetchLightningLimits();
};

export const prepareReceivePayment = async (
  params: breezSdk.PrepareReceiveRequest
): Promise<breezSdk.PrepareReceiveResponse> => {
  if (!sdk) throw new Error('SDK not initialized');
  return await sdk.prepareReceivePayment(params);
};

export const receivePayment = async (
  params: { prepareResponse: breezSdk.PrepareReceiveResponse; description: string }
): Promise<breezSdk.ReceivePaymentResponse> => {
  if (!sdk) throw new Error('SDK not initialized');
  return await sdk.receivePayment(params);
};

// Event handling
export const addEventListener = async (
  callback: (event: breezSdk.SdkEvent) => void
): Promise<string> => {
  if (!sdk) {
    throw new Error('SDK not initialized');
  }

  try {
    // Create event listener
    const listener: breezSdk.EventListener = {
      onEvent: callback,
    };

    // Add event listener to SDK and return its ID
    const listenerId = await sdk.addEventListener(listener);
    console.log('Event listener added with ID:', listenerId);
    return listenerId;
  } catch (error) {
    console.error('Failed to add event listener:', error);
    throw error;
  }
};

// Remove event listener directly from the SDK
export const removeEventListener = async (listenerId: string): Promise<void> => {
  if (!sdk || !listenerId) {
    return;
  }

  try {
    await sdk.removeEventListener(listenerId);
    console.log('Event listener removed:', listenerId);
  } catch (error) {
    console.error(`Failed to remove event listener ${listenerId}:`, error);
    throw error;
  }
};

export const getWalletInfo = async (): Promise<breezSdk.GetInfoResponse | null> => {
  if (!sdk) {
    return null;
  }

  try {
    return await sdk.getInfo();
  } catch (error) {
    console.error('Failed to get wallet info:', error);
    throw error;
  }
};

export const getTransactions = async (): Promise<breezSdk.Payment[]> => {
  if (!sdk) {
    return [];
  }

  try {
    return await sdk.listPayments({
      sortAscending: false // Most recent first
    });
  } catch (error) {
    console.error('Failed to get transactions:', error);
    throw error;
  }
};

export const disconnect = async (): Promise<void> => {
  if (sdk) {
    try {
      // Disconnect SDK (this will clean up all listeners registered with it)
      await sdk.disconnect();
      sdk = null;
      // Remove reference to window.sdk
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }
};

// Helper to save mnemonic to localStorage
export const saveMnemonic = (mnemonic: string): void => {
  localStorage.setItem('walletMnemonic', mnemonic);
};

// Helper to retrieve mnemonic from localStorage
export const getSavedMnemonic = (): string | null => {
  return localStorage.getItem('walletMnemonic');
};

// Helper to clear mnemonic from localStorage
export const clearMnemonic = (): void => {
  localStorage.removeItem('walletMnemonic');
};
