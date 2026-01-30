import React, { createContext, useContext } from 'react';

const PARTNER_STORAGE_KEY = 'walletPartner';

interface PartnerContextType {
  partner: string | null;
  isKleverMode: boolean;
  partnerMismatch: boolean;
}

const PartnerContext = createContext<PartnerContextType>({
  partner: null,
  isKleverMode: false,
  partnerMismatch: false,
});

export const usePartner = () => useContext(PartnerContext);

export function getStoredPartner(): string | null {
  return localStorage.getItem(PARTNER_STORAGE_KEY);
}

export function storePartner(partner: string | null): void {
  // Store empty string for "no partner" so we can distinguish from "never stored"
  localStorage.setItem(PARTNER_STORAGE_KEY, partner ?? '');
}

export function clearStoredPartner(): void {
  localStorage.removeItem(PARTNER_STORAGE_KEY);
}

function detectPartner(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('p') || null;
}

const detectedPartner = detectPartner();
const storedPartner = getStoredPartner();
// Mismatch if there's a stored wallet and the partner context has changed in either direction
// (null -> partner, partner -> null, or partner A -> partner B)
// storedPartner is null when never set, '' when explicitly stored as no-partner
const hasStoredWallet = localStorage.getItem('walletMnemonic') !== null;
const normalizedStored = storedPartner || null; // treat '' same as null
const partnerMismatch = hasStoredWallet && storedPartner !== null && detectedPartner !== normalizedStored;

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PartnerContext.Provider value={{
      partner: detectedPartner,
      isKleverMode: detectedPartner === 'klever',
      partnerMismatch,
    }}>
      {children}
    </PartnerContext.Provider>
  );
};
