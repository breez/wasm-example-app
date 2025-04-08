import React from 'react';
import { GetInfoResponse } from '../../pkg/breez_sdk_liquid_wasm';

interface WalletBalanceProps {
  walletInfo: GetInfoResponse | null;
  onRefresh: () => void;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ walletInfo }) => {
  if (!walletInfo) return null;

  const { walletInfo: wallet } = walletInfo;
  const balanceSat = wallet.balanceSat || 0;
  const pendingSendSat = wallet.pendingSendSat || 0;
  const pendingReceiveSat = wallet.pendingReceiveSat || 0;

  // Format balance in BTC
  const formatBtc = (satoshis: number) => {
    return (satoshis / 100000000).toFixed(8);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">


      <div className="card text-center">
        <div className="text-5xl font-bold text-[rgb(var(--text-white))]">
          {balanceSat.toLocaleString()} sats
        </div>
        <div className="text-xl text-[rgb(var(--text-white))]">
          ${formatBtc(balanceSat * 0.00000001 * 30000)} {/* Example conversion */}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Pending Send</span>
            <p className="font-semibold text-yellow-600 dark:text-yellow-400">
              {formatBtc(pendingSendSat)} BTC
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {pendingSendSat.toLocaleString()} sats
            </span>
          </div>
          <div className="text-center p-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Pending Receive</span>
            <p className="font-semibold text-blue-600 dark:text-blue-400">
              {formatBtc(pendingReceiveSat)} BTC
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {pendingReceiveSat.toLocaleString()} sats
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WalletBalance;
