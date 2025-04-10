import React from 'react';
import { GetInfoResponse } from '../../pkg/breez_sdk_liquid_wasm';
import BreezLogo from './BreezLogo';

interface CollapsingWalletHeaderProps {
  walletInfo: GetInfoResponse | null;
  onRefresh: () => void;
  scrollProgress: number; // 0 to 1, where 0 is not scrolled and 1 is fully collapsed
}

const CollapsingWalletHeader: React.FC<CollapsingWalletHeaderProps> = ({
  walletInfo,
  scrollProgress
}) => {
  if (!walletInfo) return null;

  const { walletInfo: wallet } = walletInfo;
  const balanceSat = wallet.balanceSat || 0;

  // Calculate opacity for pending amounts section (fade out first)
  const pendingOpacity = Math.max(0, 1 - scrollProgress * 2); // Fully transparent at 50% scroll

  // Calculate scale for the main balance (shrink after pending is gone)
  const balanceScale = scrollProgress > 0.5
    ? Math.max(0.8, 1 - (scrollProgress - 0.5)) // Scale down to 80% during the second half of scroll
    : 1; // Don't scale during first half

  // Height of the pending section when fully visible
  const maxPendingHeight = '80px';

  return (
    <div className="card transition-all duration-200 overflow-hidden relative">
      {/* Breez SDK Logo at the top left of the wallet card */}
      <div className="absolute top-3 left-3 z-10">
        <BreezLogo className="text-[rgb(var(--text-white))] scale-75 transform origin-top-left" />
      </div>

      {/* Main Balance - always visible but scales down */}
      <div
        className="text-center transition-all duration-200 pt-12"
        style={{
          transform: `scale(${balanceScale})`,
          transformOrigin: 'center top'
        }}
      >
        <div className="text-5xl font-bold text-[rgb(var(--text-white))]">
          {balanceSat.toLocaleString()} sats
        </div>
      </div>

      {/* Pending Amounts - fade out and collapse */}
      <div
        className="flex flex-col overflow-hidden transition-all duration-200"
        style={{
          opacity: pendingOpacity,
          maxHeight: pendingOpacity > 0 ? maxPendingHeight : '0px',
          marginTop: pendingOpacity > 0 ? '1rem' : '0'
        }}
      >
      </div>

      {/* Add extra padding at the bottom to accommodate the floating buttons */}
      <div className="h-6"></div>
    </div>
  );
};

export default CollapsingWalletHeader;
