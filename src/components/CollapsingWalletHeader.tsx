import React from 'react';
import { GetInfoResponse } from '@breeztech/breez-sdk-liquid/web';

interface CollapsingWalletHeaderProps {
  walletInfo: GetInfoResponse | null;
  usdRate: number | null;
  scrollProgress: number;
  onMenuOpen: () => void;
}

const CollapsingWalletHeader: React.FC<CollapsingWalletHeaderProps> = ({
  walletInfo,
  scrollProgress,
  usdRate,
  onMenuOpen,
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

  // Calculate USD value if rate is available
  const usdValue = usdRate !== null ? ((balanceSat / 100000000) * usdRate).toFixed(2) : null;

  return (
    <div className="card-no-border transition-all duration-200 overflow-hidden relative">
      <button
        onClick={onMenuOpen}
        className="text-[rgb(var(--text-white))] absolute top-4 left-4 z-10"
        aria-label="Open menu"
        title="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Main Balance - always visible but scales down */}
      <div
        className="text-center transition-all duration-200 pt-12"
        style={{
          transform: `scale(${balanceScale})`,
          transformOrigin: 'center top'
        }}
      >
        <div className="text-4xl font-bold text-[rgb(var(--text-white))]">
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
        {/* USD Value - only show if we have a rate */}
        {usdValue && (
          <div className="text-center text-lg text-[rgb(var(--text-white))] opacity-75 mt-1">
            ${usdValue}
          </div>
        )}
      </div>

      {/* Add extra padding at the bottom to accommodate the floating buttons */}
      <div className="h-6"></div>
    </div>
  );
};

export default CollapsingWalletHeader;