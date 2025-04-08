import React, { useState } from 'react';

interface MnemonicInputProps {
  onConnect: (mnemonic: string) => void;
}

const MnemonicInput: React.FC<MnemonicInputProps> = ({ onConnect }) => {
  const [mnemonic, setMnemonic] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mnemonic.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onConnect(mnemonic.trim());
    } catch (error) {
      console.error('Error connecting with mnemonic:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="mnemonic" className="block text-sm font-medium text-[rgb(var(--text-white))] mb-2">
            Enter your wallet mnemonic phrase
          </label>
          <div className="relative">
            <textarea
              id="mnemonic"
              rows={3}
              className="w-full px-3 py-2"
              placeholder="Enter your 12 or 24 word mnemonic phrase separated by spaces"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-[rgb(var(--text-white))] hover:text-[rgb(var(--text-white))]"
              onClick={() => setShowMnemonic(!showMnemonic)}
            >
              {showMnemonic ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-2 text-xs text-[rgb(var(--text-white))]">
            Your mnemonic will be stored in your browser's local storage. Do not share your mnemonic with anyone.
          </p>
        </div>
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !mnemonic.trim()}
            className={`button ${isSubmitting || !mnemonic.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MnemonicInput;
