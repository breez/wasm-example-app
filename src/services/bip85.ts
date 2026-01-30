import { HDKey } from '@scure/bip32';
import { hmac } from '@noble/hashes/hmac.js';
import { sha512 } from '@noble/hashes/sha2.js';
import * as bip39 from 'bip39';

const HARDENED = 0x80000000;

export interface KleverDeriveResult {
  /** The derived mnemonic string */
  mnemonic: string;
  /** The mnemonic string as UTF-8 bytes — Klever uses this as the seed for Xpriv::new_master */
  mnemonicBytes: number[];
}

/**
 * Replicates Klever's BIP-85 derivation from kos-rs/signer.rs exactly.
 *
 * Klever's derive_from_mnemonic:
 *   1. mnemonic → seed → root master key
 *   2. path = [39', 0', word_count', index']
 *   3. data = derive(secp, root, path)  →  returns 64-byte HMAC output
 *   4. entropy = data[0 .. word_count * 4 / 3]
 *   5. new mnemonic = Mnemonic::from_entropy_in(English, entropy)
 *   6. return mnemonic_str.as_bytes().to_vec()  ← string bytes, NOT seed
 *
 * Klever's derive(secp, root, path):
 *   1. bip85_root = root.derive_priv(secp, path)       ← first derivation
 *   2. derived    = bip85_root.derive_priv(secp, path)  ← second derivation (same path)
 *   3. HMAC-SHA512(key="bip-entropy-from-k", msg=derived.private_key)
 *   4. return 64-byte HMAC result
 *
 * Klever's get_xpub_as_string then uses these mnemonic bytes directly as
 * the seed for Xpriv::new_master (NOT converting mnemonic→seed via PBKDF2).
 * The Breez SDK ConnectRequest.seed should receive these bytes.
 */
export function deriveKleverMnemonic(
  mnemonic: string,
  index: number = 0,
  passphrase: string = '',
): KleverDeriveResult {
  if (index >= 0x80000000) {
    throw new Error(`Invalid index: ${index}`);
  }

  // Step 1: mnemonic → seed → root
  const wordCount = mnemonic.trim().split(/\s+/).length;
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
  const root = HDKey.fromMasterSeed(seed);

  // Step 2: build path [39', 0', word_count', index']
  const pathComponents = [
    39 + HARDENED,
    0 + HARDENED,
    wordCount + HARDENED,
    index + HARDENED,
  ];

  // Step 3: derive(secp, root, path) — mirrors Klever's derive() helper
  //   bip85_root = root.derive_priv(secp, path)
  let bip85Root: HDKey = root;
  for (const c of pathComponents) {
    bip85Root = bip85Root.deriveChild(c);
  }
  //   derived = bip85_root.derive_priv(secp, path)
  let derived: HDKey = bip85Root;
  for (const c of pathComponents) {
    derived = derived.deriveChild(c);
  }

  if (!derived.privateKey) {
    throw new Error('Failed to derive private key');
  }

  //   HMAC-SHA512(key="bip-entropy-from-k", msg=derived.private_key)
  const encoder = new TextEncoder();
  const data = hmac(sha512, encoder.encode('bip-entropy-from-k'), derived.privateKey);

  // Step 4: entropy = data[0 .. word_count * 4 / 3]
  const entropyLen = (wordCount * 4) / 3;
  const entropy = data.slice(0, entropyLen);

  // Step 5: Mnemonic::from_entropy_in(English, entropy)
  const hex = Array.from(entropy).map(b => b.toString(16).padStart(2, '0')).join('');
  const derivedMnemonic = bip39.entropyToMnemonic(hex);

  // Step 6: mnemonic_str.as_bytes().to_vec() — Klever returns mnemonic string as raw bytes
  const mnemonicBytes = Array.from(encoder.encode(derivedMnemonic));

  return {
    mnemonic: derivedMnemonic,
    mnemonicBytes,
  };
}
