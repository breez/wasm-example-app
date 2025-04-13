import React from 'react';
import { PrimaryButton } from '../components/ui';

interface HomePageProps {
  onRestoreWallet: () => void;
  onCreateNewWallet: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onRestoreWallet, onCreateNewWallet }) => {
  return (
    <div className="h-full bg-[var(--card-bg)] flex p-6 flex-col px-4 text-center items-center">
      {/* Logo/Header */}
      <div className="mb-0">
        <h1 className="text-4xl font-bold text-[rgb(var(--text-white))] mb-2">
          Lightning Wallet
        </h1>
        <p className="text-xl text-[rgb(var(--text-white))] opacity-80">
          Powered by Breez SDK
        </p>
      </div>

      {/* Feature highlights */}
      <div className="flex justify-center justify-items-center items-center grid grid-cols-1 md:grid-cols-2 max-w-4xl mb-16 mt-16">
        <div className="flex-0 bg-[rgb(var(--card-bg))] rounded-lg shadow-lg">
          <div className="text-3xl mb-3">⚡</div>
          <h2 className="text-xl font-semibold text-[rgb(var(--text-white))] mb-2">Lightning Fast</h2>
          <p className="text-[rgb(var(--text-white))] opacity-80">Instant payments with minimal fees</p>
        </div>

        <div className="flex-0 bg-[rgb(var(--card-bg))] rounded-lg shadow-lg">
          <div className="text-3xl mb-3">🔒</div>
          <h2 className="text-xl font-semibold text-[rgb(var(--text-white))] mb-2">Non-Custodial</h2>
          <p className="text-[rgb(var(--text-white))] opacity-80">You control your keys and your funds</p>
        </div>
      </div>

      <div className="flex-1"></div>

      {/* Call-to-action buttons */}
      <div className="space-y-4 w-full max-w-md">
        <PrimaryButton
          onClick={onCreateNewWallet}
          className="w-full py-4 text-lg"
        >
          Create New Wallet
        </PrimaryButton>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[rgb(var(--background-rgb))] text-[rgb(var(--text-white))] opacity-70">
              or
            </span>
          </div>
        </div>

        <button
          onClick={onRestoreWallet}
          className="w-full py-4 border border-[rgb(var(--text-white))] text-[rgb(var(--text-white))] rounded-lg hover:bg-[rgb(var(--card-border))] transition-colors text-lg"
        >
          Restore Existing Wallet
        </button>
      </div>
    </div>
  );
};

export default HomePage;
