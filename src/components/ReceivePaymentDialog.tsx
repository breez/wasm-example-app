import React, { useState, useEffect } from 'react';
import * as walletService from '../services/walletService';
import LoadingSpinner from './LoadingSpinner';
import {
  DialogHeader, FormGroup, FormLabel,
  FormInput, FormError, FormDescription, PrimaryButton,
  QRCodeContainer, CopyableText, Alert, StepContainer, BottomSheetCard, BottomSheetContainer
} from './ui';

// Types
type ReceiveStep = 'loading_limits' | 'input' | 'qr' | 'loading';

// Props interfaces
interface ReceivePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  walletService: typeof walletService;
}

interface InputFormProps {
  description: string;
  setDescription: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  minAmount: number;
  maxAmount: number;
  error: string | null;
  isLoading: boolean;
  onSubmit: () => void;
}

interface QRCodeDisplayProps {
  invoice: string;
  feeSats: number;
  onClose: () => void;
}

// Component to display limits and form for receiving payment
const InputForm: React.FC<InputFormProps> = ({
  description,
  setDescription,
  amount,
  setAmount,
  minAmount,
  maxAmount,
  error,
  isLoading,
  onSubmit
}) => {
  const formatSats = (sats: number): string => {
    return sats?.toLocaleString();
  };

  return (
    <FormGroup>
      <div className="space-y-2">
        <FormDescription>
          Fill in the details to generate a Lightning invoice
        </FormDescription>
      </div>

      <FormGroup className="pt-2">
        <div>
          <FormLabel htmlFor="amount">{`Enter at least ${formatSats(minAmount)} sats`}</FormLabel>
          <FormInput
            id="amount"
            type="number"
            min={minAmount}
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in sats"
            disabled={isLoading}
          />
        </div>

        <div>
          <FormInput
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            disabled={isLoading}
          />
        </div>

        <FormError error={error} />
      </FormGroup>

      <div className="mt-6 flex justify-center">
        <PrimaryButton
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner text="Processing..." size="small" />
          ) : 'Generate Invoice'}
        </PrimaryButton>
      </div>
    </FormGroup>
  );
};

// Component to display QR code with invoice
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ invoice, feeSats }) => {
  return (
    <div className="space-y-6 flex flex-col items-center">

      <QRCodeContainer value={invoice} />

      <div className="w-full">
        <CopyableText text={invoice} />

        {feeSats > 0 && (
          <Alert type="warning" className="mt-8">
            <center>A fee of {feeSats} sats is applied to this invoice.</center>
          </Alert>
        )}
      </div>
    </div>
  );
};

// Main component
const ReceivePaymentDialog: React.FC<ReceivePaymentDialogProps> = ({ isOpen, onClose, walletService }) => {
  // State
  const [currentStep, setCurrentStep] = useState<ReceiveStep>('loading_limits');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<string>('');
  const [feeSats, setFeeSats] = useState<number>(0);
  const [limits, setLimits] = useState<{ min: number, max: number }>({ min: 1, max: 1000000 });



  // Reset state when dialog opens and fetch limits
  useEffect(() => {
    if (isOpen) {
      resetState();
      fetchLightningLimits();
    }
  }, [isOpen]);

  const resetState = () => {
    setCurrentStep('loading_limits');
    setDescription('');
    setAmount('');
    setError(null);
    setIsLoading(false);
    setInvoice('');
    setFeeSats(0);
  };

  // Fetch lightning receive limits from walletService
  const fetchLightningLimits = async () => {
    try {
      const lightningLimits = await walletService.fetchLightningLimits();

      // Set min and max limits for receiving lightning payments
      setLimits({
        min: lightningLimits.receive.minSat,
        max: lightningLimits.receive.maxSat
      });

      // Move to input step after fetching limits
      setCurrentStep('input');
    } catch (err) {
      console.error('Failed to fetch lightning limits:', err);
      setError('Failed to fetch payment limits. Please try again.');
      setCurrentStep('input'); // Still move to input step but with an error message
    }
  };

  // Generate lightning invoice
  const generateInvoice = async () => {
    // Validate amount
    const amountSats = parseInt(amount);
    if (isNaN(amountSats) || amountSats < limits.min || amountSats > limits.max) {
      setError(`Amount must be between ${limits.min} and ${limits.max} sats`);
      return;
    }

    setError(null);
    setIsLoading(true);
    setCurrentStep('loading');

    try {
      // Generate lightning invoice using walletService
      const prepareResponse = await walletService.prepareReceivePayment({
        paymentMethod: 'lightning',
        amount: {
          type: 'bitcoin',
          payerAmountSat: amountSats,
        },
      });
      const receiveResponse = await walletService.receivePayment({
        prepareResponse: prepareResponse,
        description,
      });
      // Set invoice and fees
      setInvoice(receiveResponse.destination);
      setFeeSats(prepareResponse.feesSat || 0);
      setCurrentStep('qr');
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      setError(`Failed to generate invoice: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setCurrentStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetContainer isOpen={isOpen} onClose={onClose} >
      <BottomSheetCard className="bottom-sheet-card">
        <DialogHeader title="Lightning" onClose={onClose} />

        <StepContainer>
          {currentStep === 'loading_limits' && (
            <div className="flex flex-col items-center justify-center h-40">
              <LoadingSpinner text="Loading payment limits..." />
            </div>
          )}

          {currentStep === 'input' && (
            <InputForm
              description={description}
              setDescription={setDescription}
              amount={amount}
              setAmount={setAmount}
              minAmount={limits.min}
              maxAmount={limits.max}
              error={error}
              isLoading={isLoading}
              onSubmit={generateInvoice}
            />
          )}

          {currentStep === 'loading' && (
            <div className="flex flex-col items-center justify-center h-40">
              <LoadingSpinner text="Generating invoice..." />
            </div>
          )}

          {currentStep === 'qr' && (
            <QRCodeDisplay
              invoice={invoice}
              feeSats={feeSats}
              onClose={onClose}
            />
          )}
        </StepContainer>
      </BottomSheetCard>
    </BottomSheetContainer>
  );
};

export default ReceivePaymentDialog;
