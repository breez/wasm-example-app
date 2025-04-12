import React, { useState, useEffect } from 'react';
import * as breezSdk from '../../pkg/breez_sdk_liquid_wasm';
import * as walletService from '../services/walletService';
import LoadingSpinner from './LoadingSpinner';
import {
  DialogHeader, FormGroup, FormLabel,
  FormTextarea, FormError, PrimaryButton, SecondaryButton, PaymentInfoCard,
  PaymentInfoRow, PaymentInfoDivider, ResultIcon, ResultMessage, StepContainer, StepContent,
  BottomSheetContainer, BottomSheetCard
} from './ui';

// Types
type PaymentStep = 'input' | 'confirm' | 'processing' | 'result';
type PaymentResult = 'success' | 'failure' | null;

// Props interfaces
interface SendPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  walletService: typeof walletService;
  transactionsListRef: React.RefObject<HTMLDivElement>;
}

interface InputStepProps {
  paymentInput: string;
  setPaymentInput: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  onNext: () => void;
}

interface ConfirmStepProps {
  amountSats: number | null;
  feesSat: number | null;
  error: string | null;
  isLoading: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

interface ResultStepProps {
  result: 'success' | 'failure';
  error: string | null;
  onClose: () => void;
}

// Step components
const InputStep: React.FC<InputStepProps> = ({
  paymentInput,
  setPaymentInput,
  isLoading,
  error,
  onNext,
}) => {
  return (
    <FormGroup>
      <FormLabel htmlFor="payment-input">
        Enter Lightning Invoice or Bitcoin Address
      </FormLabel>
      <FormTextarea
        value={paymentInput}
        onChange={(e) => setPaymentInput(e.target.value)}
        placeholder="Enter Lightning invoice (bolt11) or Bitcoin address"
        disabled={isLoading}
        className="h-24"
      />

      <FormError error={error} />

      <div className="mt-6 flex justify-end">
        <PrimaryButton
          onClick={onNext}
          disabled={isLoading || !paymentInput.trim()}
        >
          {isLoading ? (
            <LoadingSpinner text="Processing..." size="small" />
          ) : 'Next'}
        </PrimaryButton>
      </div>
    </FormGroup>
  );
};

const ConfirmStep: React.FC<ConfirmStepProps> = ({
  amountSats,
  feesSat,
  error,
  isLoading,
  onBack,
  onConfirm,
}) => {
  return (
    <FormGroup>
      <h3 className="text-lg font-semibold text-[rgb(var(--text-white))]">
        Confirm Payment
      </h3>

      <PaymentInfoCard>
        <PaymentInfoRow
          label="Amount"
          value={`${amountSats?.toLocaleString() || '0'} sats`}
        />
        <PaymentInfoRow
          label="Fee"
          value={`${feesSat?.toLocaleString() || '0'} sats`}
        />
        <PaymentInfoDivider />
        <PaymentInfoRow
          label="Total"
          value={`${((amountSats || 0) + (feesSat || 0)).toLocaleString()} sats`}
          isBold={true}
        />
      </PaymentInfoCard>

      <FormError error={error} />

      <div className="mt-6 flex justify-between">
        <SecondaryButton onClick={onBack} disabled={isLoading}>
          Back
        </SecondaryButton>
        <PrimaryButton onClick={onConfirm} disabled={isLoading}>
          {isLoading ? (
            <LoadingSpinner text="Processing..." size="small" />
          ) : 'Pay'}
        </PrimaryButton>
      </div>
    </FormGroup>
  );
};

const ProcessingStep: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <LoadingSpinner text="Processing payment..." />
    </div>
  );
};

const ResultStep: React.FC<ResultStepProps> = ({ result, error, onClose }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <ResultIcon type={result} />
      <ResultMessage
        title={result === 'success' ? 'Payment Successful!' : 'Payment Failed'}
        description={result === 'success'
          ? 'Your payment has been sent successfully.'
          : error || 'There was an error processing your payment.'}
      />
      <PrimaryButton onClick={onClose} className="mt-6">
        Close
      </PrimaryButton>
    </div>
  );
};

// Main component
const SendPaymentDialog: React.FC<SendPaymentDialogProps> = ({ isOpen, onClose, walletService }) => {
  // State
  const [currentStep, setCurrentStep] = useState<PaymentStep>('input');
  const [paymentInput, setPaymentInput] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<breezSdk.LNInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prepareResponse, setPrepareResponse] = useState<breezSdk.PrepareSendResponse | null>(null);


  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setCurrentStep('input');
    setPaymentInput('');
    setPaymentInfo(null);
    setPrepareResponse(null);
    setError(null);
    setPaymentResult(null);
    setIsLoading(false);
  };

  // Payment flow functions
  const parsePaymentInput = async () => {
    if (!paymentInput.trim()) {
      setError('Please enter a payment destination');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parseResult = await walletService.parseInput(paymentInput.trim());

      if (parseResult.type === 'bolt11') {
        const invoice = parseResult.invoice;
        setPaymentInfo(invoice);

        if (!invoice.amountMsat) {
          setError('Invoice does not specify an amount');
          setIsLoading(false);
          return;
        }

        await prepareSendPayment(invoice);
      } else {
        setError('Unsupported payment format');
      }
    } catch (err) {
      console.error('Failed to parse input:', err);
      setError('Invalid payment information');
    } finally {
      setIsLoading(false);
    }
  };

  const prepareSendPayment = async (invoice: breezSdk.LNInvoice) => {
    if (!invoice.amountMsat) {
      setError('Invoice does not specify an amount');
      return;
    }

    const amountSat = invoice.amountMsat / 1000;
    setIsLoading(true);

    try {
      const response = await walletService.prepareSendPayment({
        destination: invoice.bolt11,
        amount: {
          type: 'bitcoin',
          receiverAmountSat: amountSat,
        },
      });

      setPrepareResponse(response);
      setCurrentStep('confirm');
    } catch (err) {
      console.error('Failed to estimate fee:', err);
      setError(`Failed to estimate fee: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendPayment = async () => {
    if (!paymentInfo || !prepareResponse) {
      setError('Cannot send payment: missing required information');
      return;
    }

    setCurrentStep('processing');
    setIsLoading(true);

    try {
      const result = await walletService.sendPayment({ prepareResponse });
      console.log('Payment result:', result);
      setPaymentResult('success');
    } catch (err) {
      console.error('Payment failed:', err);
      setError(`Payment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setPaymentResult('failure');
    } finally {
      setIsLoading(false);
      setCurrentStep('result');
    }
  };

  const getStepIndex = (step: PaymentStep): number => {
    const steps: PaymentStep[] = ['input', 'confirm', 'processing', 'result'];
    return steps.indexOf(step);
  };

  // Don't render if not open
  //if (!isOpen) return null;

  // Extract payment details
  let amountSats: number | null = null;
  let feesSat: number | null = null;

  if (paymentInfo && paymentInfo.amountMsat) {
    amountSats = paymentInfo.amountMsat / 1000;
  }

  if (prepareResponse) {
    feesSat = prepareResponse.feesSat || 0;
  }

  return (
    <BottomSheetContainer isOpen={isOpen} onClose={onClose}>
      <BottomSheetCard className="bottom-sheet-card">
        <DialogHeader title="Send Payment" onClose={onClose} />

        <StepContainer>
          {/* Input Step */}
          <StepContent
            isActive={currentStep === 'input'}
            isLeft={getStepIndex('input') < getStepIndex(currentStep)}
          >
            <InputStep
              paymentInput={paymentInput}
              setPaymentInput={setPaymentInput}
              isLoading={isLoading}
              error={error}
              onNext={parsePaymentInput}
            />
          </StepContent>

          {/* Confirm Step */}
          <StepContent
            isActive={currentStep === 'confirm'}
            isLeft={getStepIndex('confirm') < getStepIndex(currentStep)}
          >
            <ConfirmStep
              amountSats={amountSats}
              feesSat={feesSat}
              error={error}
              isLoading={isLoading}
              onBack={() => setCurrentStep('input')}
              onConfirm={sendPayment}
            />
          </StepContent>

          {/* Processing Step */}
          <StepContent
            isActive={currentStep === 'processing'}
            isLeft={getStepIndex('processing') < getStepIndex(currentStep)}
          >
            <ProcessingStep />
          </StepContent>

          {/* Result Step */}
          <StepContent
            isActive={currentStep === 'result'}
            isLeft={getStepIndex('result') < getStepIndex(currentStep)}
          >
            <ResultStep
              result={paymentResult === 'success' ? 'success' : 'failure'}
              error={error}
              onClose={onClose}
            />
          </StepContent>
        </StepContainer>
      </BottomSheetCard>
    </BottomSheetContainer>
  );
};

export default SendPaymentDialog;
