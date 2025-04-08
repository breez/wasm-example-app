import React, { useState } from 'react';
import { Payment } from '../../pkg/breez_sdk_liquid_wasm';
import {
  DialogContainer, DialogCard, DialogHeader, PaymentInfoCard,
  PaymentInfoRow, PrimaryButton,
  PaymentDetailsSection, CollapsibleCodeField
} from './ui';

interface PaymentDetailsDialogProps {
  payment: Payment;
  onClose: () => void;
}

const PaymentDetailsDialog: React.FC<PaymentDetailsDialogProps> = ({ payment, onClose }) => {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    invoice: false,
    preimage: false,
    destinationPubkey: false,
    txId: false,
    swapId: false,
    assetId: false,
    destination: false
  });

  // Format date and time
  const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const toggleField = (field: string) => {
    setVisibleFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <DialogContainer>
      <DialogCard maxWidth="lg">
        <DialogHeader title="Payment Details" onClose={onClose} />

        <div className="space-y-4">
          {/* General Payment Information */}
          <PaymentInfoCard>
            <PaymentInfoRow
              label="Type"
              value={payment.paymentType === 'receive' ? 'Received' : 'Sent'}
            />

            <PaymentInfoRow
              label="Amount"
              value={`${payment.paymentType === 'receive' ? '+' : '-'} ${payment.amountSat.toLocaleString()} sats`}
            />

            <PaymentInfoRow
              label="Fee"
              value={`${payment.feesSat.toLocaleString()} sats`}
            />

            <PaymentInfoRow
              label="Status"
              value={payment.status}
            />

            <PaymentInfoRow
              label="Date & Time"
              value={formatDateTime(payment.timestamp)}
            />
          </PaymentInfoCard>

          {/* Transaction ID if available */}
          {payment.txId && (
            <div className="mt-4">
              <CollapsibleCodeField
                label="Transaction ID"
                value={payment.txId}
                isVisible={visibleFields.txId}
                onToggle={() => toggleField('txId')}
              />
            </div>
          )}

          {/* Payment Type Specific Details */}
          {payment.details.type === 'lightning' && (
            <PaymentDetailsSection title="Lightning Details">
              {payment.details.swapId && (
                <CollapsibleCodeField
                  label="Swap ID"
                  value={payment.details.swapId}
                  isVisible={visibleFields.swapId}
                  onToggle={() => toggleField('swapId')}
                />
              )}

              {payment.details.invoice && (
                <CollapsibleCodeField
                  label="Invoice"
                  value={payment.details.invoice}
                  isVisible={visibleFields.invoice}
                  onToggle={() => toggleField('invoice')}
                />
              )}

              {payment.details.preimage && (
                <CollapsibleCodeField
                  label="Payment Preimage"
                  value={payment.details.preimage}
                  isVisible={visibleFields.preimage}
                  onToggle={() => toggleField('preimage')}
                />
              )}

              {payment.details.destinationPubkey && (
                <CollapsibleCodeField
                  label="Destination Public Key"
                  value={payment.details.destinationPubkey}
                  isVisible={visibleFields.destinationPubkey}
                  onToggle={() => toggleField('destinationPubkey')}
                />
              )}
            </PaymentDetailsSection>
          )}

          {/* Bitcoin payment details */}
          {payment.details.type === 'bitcoin' && (
            <PaymentDetailsSection title="Bitcoin Details">
              {payment.details.swapId && (
                <CollapsibleCodeField
                  label="Swap ID"
                  value={payment.details.swapId}
                  isVisible={visibleFields.swapId}
                  onToggle={() => toggleField('swapId')}
                />
              )}
            </PaymentDetailsSection>
          )}

          {/* Liquid payment details */}
          {payment.details.type === 'liquid' && (
            <PaymentDetailsSection title="Liquid Details">
              {payment.details.assetId && (
                <>
                  <PaymentInfoRow
                    label="Asset ID"
                    value={`${payment.details.assetId.substring(0, 8)}...`}
                  />

                  <CollapsibleCodeField
                    label="Full Asset ID"
                    value={payment.details.assetId}
                    isVisible={visibleFields.assetId}
                    onToggle={() => toggleField('assetId')}
                  />
                </>
              )}

              {payment.details.destination && (
                <CollapsibleCodeField
                  label="Destination"
                  value={payment.details.destination}
                  isVisible={visibleFields.destination}
                  onToggle={() => toggleField('destination')}
                />
              )}
            </PaymentDetailsSection>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <PrimaryButton onClick={onClose}>
            Close
          </PrimaryButton>
        </div>
      </DialogCard>
    </DialogContainer>
  );
};

export default PaymentDetailsDialog;
