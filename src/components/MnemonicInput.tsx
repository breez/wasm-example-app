import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from './ui';

interface MnemonicInputProps {
  onConnect: (mnemonic: string) => void;
  onBack?: () => void; // Added back button handler
}

const MnemonicInput: React.FC<MnemonicInputProps> = ({ onConnect, onBack }) => {
  const [mnemonic, setMnemonic] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const cleaned = mnemonic.trim().replace(/\s+/g, ' ');
    const wordCount = cleaned.split(' ').length;

    if (wordCount !== 12 && wordCount !== 24) {
      setError('Please enter a valid 12 or 24-word recovery phrase');
      return;
    }

    setError(null);
    onConnect(cleaned);
  };

  return (
    <div className="bg-[rgb(var(--card-bg))] p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-[rgb(var(--text-white))] mb-4">
        Enter Recovery Phrase
      </h2>

      <p className="text-[rgb(var(--text-white))] opacity-80 mb-4">
        Please enter your 12 or 24-word recovery phrase, with words separated by spaces.
      </p>

      <textarea
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
        className="w-full h-32 px-3 py-2 text-[rgb(var(--text-white))] bg-[rgb(var(--card-border))] border border-[rgb(var(--card-border))] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-blue)] mb-4"
        placeholder="Enter your recovery phrase..."
      />

      {error && (
        <div className="text-[rgb(var(--accent-red))] mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        {onBack && (
          <SecondaryButton onClick={onBack}>
            Back
          </SecondaryButton>
        )}
        <PrimaryButton
          onClick={handleSubmit}
          disabled={!mnemonic.trim()}
          className="ml-auto"
        >
          Restore Wallet
        </PrimaryButton>
      </div>
    </div>
  );
};

export default MnemonicInput;
