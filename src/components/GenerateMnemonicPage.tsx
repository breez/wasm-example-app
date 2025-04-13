import React, { useState, useEffect } from 'react';
import { generateMnemonic } from 'bip39';
import { PrimaryButton, SecondaryButton } from './ui';
import LoadingSpinner from './LoadingSpinner';
import { Buffer } from 'buffer';

window.Buffer = Buffer;
interface GenerateMnemonicPageProps {
  onMnemonicConfirmed: (mnemonic: string) => void;
  onBack: () => void;
}

const GenerateMnemonicPage: React.FC<GenerateMnemonicPageProps> = ({
  onMnemonicConfirmed,
  onBack
}) => {
  const [mnemonic, setMnemonic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Generate mnemonic on component mount
  useEffect(() => {
    const generate = async () => {
      try {
        // Generate a random mnemonic (128-256 bits of entropy)
        const newMnemonic = await generateMnemonic(); // 24 words
        setMnemonic(newMnemonic);
      } catch (error) {
        console.error('Failed to generate mnemonic:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generate();
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy mnemonic:', err));
  };

  const handleConfirmMnemonic = () => {
    onMnemonicConfirmed(mnemonic);
  };


  if (isLoading) {
    return <LoadingSpinner text="Generating secure wallet..." />;
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-2xl font-bold text-[rgb(var(--text-white))] mb-6">
        Create New Wallet
      </h1>



      <h2 className="text-xl font-semibold text-[rgb(var(--text-white))] mb-4">
        Your Recovery Phrase
      </h2>

      <p className="text-[rgb(var(--text-white))] mb-4">
        Write down these 24 words in order and keep them safe. This recovery phrase is the only way to access your wallet if you lose your device.
      </p>

      <div className="bg-[rgb(var(--card-bg))] p-4 rounded-lg mb-4">
        <div className="grid grid-cols-3 gap-2">
          {mnemonic.split(' ').map((word, index) => (
            <div key={index} className="flex items-center">
              <span className="text-[rgb(var(--text-white))] opacity-50 mr-2 w-6 text-right">
                {index + 1}.
              </span>
              <span className="text-[rgb(var(--text-white))] font-mono">
                {word}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center my-4">
        <button
          onClick={handleCopyToClipboard}
          className="text-[rgb(var(--secondary-blue))] hover:underline flex items-center"
        >
          {isCopied ? '✓ Copied!' : '📋 Copy to clipboard'}
        </button>
      </div>

      <div className="bg-yellow-800 bg-opacity-20 border border-yellow-600 text-yellow-200 p-4 rounded-md">
        <h3 className="font-bold mb-2">⚠️ Important Warning</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Never share your recovery phrase with anyone.</li>
        </ul>
      </div>
      <div className="flex-1" />

      <div className="flex justify-between">
        <SecondaryButton onClick={onBack}>
          Back
        </SecondaryButton>
        <PrimaryButton onClick={handleConfirmMnemonic}>
          I've written it down
        </PrimaryButton>
      </div>
    </div>

  );
};

export default GenerateMnemonicPage;
