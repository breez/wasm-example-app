/* tslint:disable */
/* eslint-disable */
export function connect(req: ConnectRequest): Promise<BindingLiquidSdk>;
export function connectWithSigner(req: ConnectWithSignerRequest, signer: Signer): Promise<BindingLiquidSdk>;
export function defaultConfig(network: LiquidNetwork, breez_api_key?: string | null): Config;
export function parseInvoice(input: string): LNInvoice;
export function setLogger(logger: Logger): void;
/**
 * Entry point invoked by JavaScript in a worker.
 */
export function task_worker_entry_point(ptr: number): void;
/**
 * The `ReadableStreamType` enum.
 *
 * *This API requires the following crate features to be activated: `ReadableStreamType`*
 */
type ReadableStreamType = "bytes";
export interface EventListener {
    onEvent: (e: SdkEvent) => void;
}

export interface Logger {
    log: (l: LogEntry) => void;
}

export interface Signer {
    xpub: () => number[];
    deriveXpub: (derivationPath: string) => number[];
    signEcdsa: (msg: number[], derivationPath: string) => number[];
    signEcdsaRecoverable: (msg: number[]) => number[];
    slip77MasterBlindingKey: () => number[];
    hmacSha256: (msg: number[], derivationPath: string) => number[];
    eciesEncrypt: (msg: number[]) => number[];
    eciesDecrypt: (msg: number[]) => number[];
}

export interface AcceptPaymentProposedFeesRequest {
    response: FetchPaymentProposedFeesResponse;
}

export interface FetchPaymentProposedFeesResponse {
    swapId: string;
    feesSat: number;
    payerAmountSat: number;
    receiverAmountSat: number;
}

export interface FetchPaymentProposedFeesRequest {
    swapId: string;
}

export interface LnUrlPaySuccessData {
    payment: Payment;
    successAction?: SuccessActionProcessed;
}

export type LnUrlPayResult = { type: "endpointSuccess"; data: LnUrlPaySuccessData } | { type: "endpointError"; data: LnUrlErrorData } | { type: "payError"; data: LnUrlPayErrorData };

export interface LnUrlPayRequest {
    prepareResponse: PrepareLnUrlPayResponse;
}

export interface PrepareLnUrlPayResponse {
    destination: SendDestination;
    feesSat: number;
    data: LnUrlPayRequestData;
    comment?: string;
    successAction?: SuccessAction;
}

export interface PrepareLnUrlPayRequest {
    data: LnUrlPayRequestData;
    amount: PayAmount;
    bip353Address?: string;
    comment?: string;
    validateSuccessActionUrl?: boolean;
}

export interface LogEntry {
    line: string;
    level: string;
}

export interface BuyBitcoinRequest {
    prepareResponse: PrepareBuyBitcoinResponse;
    redirectUrl?: string;
}

export interface PrepareBuyBitcoinResponse {
    provider: BuyBitcoinProvider;
    amountSat: number;
    feesSat: number;
}

export interface PrepareBuyBitcoinRequest {
    provider: BuyBitcoinProvider;
    amountSat: number;
}

export type BuyBitcoinProvider = "moonpay";

export interface RecommendedFees {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
}

export interface Payment {
    destination?: string;
    txId?: string;
    unblindingData?: string;
    timestamp: number;
    amountSat: number;
    feesSat: number;
    swapperFeesSat?: number;
    paymentType: PaymentType;
    status: PaymentState;
    details: PaymentDetails;
}

export type PaymentDetails = { type: "lightning"; swapId: string; description: string; liquidExpirationBlockheight: number; preimage?: string; invoice?: string; bolt12Offer?: string; paymentHash?: string; destinationPubkey?: string; lnurlInfo?: LnUrlInfo; bip353Address?: string; claimTxId?: string; refundTxId?: string; refundTxAmountSat?: number } | { type: "liquid"; destination: string; description: string; assetId: string; assetInfo?: AssetInfo; lnurlInfo?: LnUrlInfo; bip353Address?: string } | { type: "bitcoin"; swapId: string; description: string; autoAcceptedFees: boolean; liquidExpirationBlockheight?: number; bitcoinExpirationBlockheight?: number; claimTxId?: string; refundTxId?: string; refundTxAmountSat?: number };

export interface AssetInfo {
    name: string;
    ticker: string;
    amount: number;
    fees?: number;
}

export interface AssetMetadata {
    assetId: string;
    name: string;
    ticker: string;
    precision: number;
    fiatId?: string;
}

export interface LnUrlInfo {
    lnAddress?: string;
    lnurlPayComment?: string;
    lnurlPayDomain?: string;
    lnurlPayMetadata?: string;
    lnurlPaySuccessAction?: SuccessActionProcessed;
    lnurlPayUnprocessedSuccessAction?: SuccessAction;
    lnurlWithdrawEndpoint?: string;
}

export type PaymentStatus = "pending" | "complete";

export type PaymentType = "receive" | "send";

export type PaymentState = "created" | "pending" | "complete" | "failed" | "timedOut" | "refundable" | "refundPending" | "waitingFeeAcceptance";

export interface RefundableSwap {
    swapAddress: string;
    timestamp: number;
    amountSat: number;
    lastRefundTxId?: string;
}

export type GetPaymentRequest = { type: "paymentHash"; paymentHash: string } | { type: "swapId"; swapId: string };

export type ListPaymentDetails = { type: "liquid"; assetId?: string; destination?: string } | { type: "bitcoin"; address?: string };

export interface ListPaymentsRequest {
    filters?: PaymentType[];
    states?: PaymentState[];
    fromTimestamp?: number;
    toTimestamp?: number;
    offset?: number;
    limit?: number;
    details?: ListPaymentDetails;
    sortAscending?: boolean;
}

export interface RestoreRequest {
    backupPath?: string;
}

export interface BackupRequest {
    backupPath?: string;
}

export interface CheckMessageResponse {
    isValid: boolean;
}

export interface CheckMessageRequest {
    message: string;
    pubkey: string;
    signature: string;
}

export interface SignMessageResponse {
    signature: string;
}

export interface SignMessageRequest {
    message: string;
}

export interface GetInfoResponse {
    walletInfo: WalletInfo;
    blockchainInfo: BlockchainInfo;
}

export interface WalletInfo {
    balanceSat: number;
    pendingSendSat: number;
    pendingReceiveSat: number;
    fingerprint: string;
    pubkey: string;
    assetBalances: AssetBalance[];
}

export interface BlockchainInfo {
    liquidTip: number;
    bitcoinTip: number;
}

export interface AssetBalance {
    assetId: string;
    balanceSat: number;
    name?: string;
    ticker?: string;
    balance?: number;
}

export interface RefundResponse {
    refundTxId: string;
}

export interface RefundRequest {
    swapAddress: string;
    refundAddress: string;
    feeRateSatPerVbyte: number;
}

export interface PrepareRefundResponse {
    txVsize: number;
    txFeeSat: number;
    lastRefundTxId?: string;
}

export interface PrepareRefundRequest {
    swapAddress: string;
    refundAddress: string;
    feeRateSatPerVbyte: number;
}

export interface PayOnchainRequest {
    address: string;
    prepareResponse: PreparePayOnchainResponse;
}

export interface PreparePayOnchainResponse {
    receiverAmountSat: number;
    claimFeesSat: number;
    totalFeesSat: number;
}

export interface PreparePayOnchainRequest {
    amount: PayAmount;
    feeRateSatPerVbyte?: number;
}

export type PayAmount = { type: "bitcoin"; receiverAmountSat: number } | { type: "asset"; assetId: string; receiverAmount: number; estimateAssetFees?: boolean } | { type: "drain" };

export interface SendPaymentResponse {
    payment: Payment;
}

export interface SendPaymentRequest {
    prepareResponse: PrepareSendResponse;
    useAssetFees?: boolean;
}

export interface PrepareSendResponse {
    destination: SendDestination;
    feesSat?: number;
    estimatedAssetFees?: number;
}

export type SendDestination = { type: "liquidAddress"; addressData: LiquidAddressData; bip353Address?: string } | { type: "bolt11"; invoice: LNInvoice; bip353Address?: string } | { type: "bolt12"; offer: LNOffer; receiverAmountSat: number; bip353Address?: string };

export interface PrepareSendRequest {
    destination: string;
    amount?: PayAmount;
}

export interface OnchainPaymentLimitsResponse {
    send: Limits;
    receive: Limits;
}

export interface LightningPaymentLimitsResponse {
    send: Limits;
    receive: Limits;
}

export interface Limits {
    minSat: number;
    maxSat: number;
    maxZeroConfSat: number;
}

export interface ReceivePaymentResponse {
    destination: string;
}

export interface ReceivePaymentRequest {
    prepareResponse: PrepareReceiveResponse;
    description?: string;
    useDescriptionHash?: boolean;
}

export interface PrepareReceiveResponse {
    paymentMethod: PaymentMethod;
    amount?: ReceiveAmount;
    feesSat: number;
    minPayerAmountSat?: number;
    maxPayerAmountSat?: number;
    swapperFeerate?: number;
}

export interface PrepareReceiveRequest {
    paymentMethod: PaymentMethod;
    amount?: ReceiveAmount;
}

export type ReceiveAmount = { type: "bitcoin"; payerAmountSat: number } | { type: "asset"; assetId: string; payerAmount?: number };

export type PaymentMethod = "lightning" | "bitcoinAddress" | "liquidAddress";

export interface ConnectWithSignerRequest {
    config: Config;
}

export interface ConnectRequest {
    config: Config;
    mnemonic?: string;
    passphrase?: string;
    seed?: number[];
}

export type SdkEvent = { type: "paymentFailed"; details: Payment } | { type: "paymentPending"; details: Payment } | { type: "paymentRefundable"; details: Payment } | { type: "paymentRefunded"; details: Payment } | { type: "paymentRefundPending"; details: Payment } | { type: "paymentSucceeded"; details: Payment } | { type: "paymentWaitingConfirmation"; details: Payment } | { type: "paymentWaitingFeeAcceptance"; details: Payment } | { type: "synced" } | { type: "dataSynced"; didPullNewRecords: boolean };

export type LiquidNetwork = "mainnet" | "testnet" | "regtest";

export interface Config {
    liquidExplorer: BlockchainExplorer;
    bitcoinExplorer: BlockchainExplorer;
    workingDir: string;
    cacheDir?: string;
    network: LiquidNetwork;
    paymentTimeoutSec: number;
    syncServiceUrl?: string;
    zeroConfMaxAmountSat?: number;
    breezApiKey?: string;
    externalInputParsers?: ExternalInputParser[];
    useDefaultExternalInputParsers: boolean;
    onchainFeeRateLeewaySatPerVbyte?: number;
    assetMetadata?: AssetMetadata[];
    sideswapApiKey?: string;
}

export type BlockchainExplorer = { type: "esplora"; url: string; useWaterfalls: boolean };

export interface Symbol {
    grapheme?: string;
    template?: string;
    rtl?: boolean;
    position?: number;
}

export interface LocalizedName {
    locale: string;
    name: string;
}

export interface LocaleOverrides {
    locale: string;
    spacing?: number;
    symbol: Symbol;
}

export interface CurrencyInfo {
    name: string;
    fractionSize: number;
    spacing?: number;
    symbol?: Symbol;
    uniqSymbol?: Symbol;
    localizedName: LocalizedName[];
    localeOverrides: LocaleOverrides[];
}

export interface FiatCurrency {
    id: string;
    info: CurrencyInfo;
}

export interface Rate {
    coin: string;
    value: number;
}

export type LnUrlWithdrawResult = { type: "ok"; data: LnUrlWithdrawSuccessData } | { type: "timeout"; data: LnUrlWithdrawSuccessData } | { type: "errorStatus"; data: LnUrlErrorData };

export interface LnUrlWithdrawSuccessData {
    invoice: LNInvoice;
}

export interface LnUrlWithdrawRequest {
    data: LnUrlWithdrawRequestData;
    amountMsat: number;
    description?: string;
}

export interface LnUrlErrorData {
    reason: string;
}

export interface LnUrlAuthRequestData {
    k1: string;
    action?: string;
    domain: string;
    url: string;
}

export type LnUrlCallbackStatus = { type: "ok" } | ({ type: "errorStatus" } & {} & LnUrlErrorData);

export interface LnUrlWithdrawRequestData {
    callback: string;
    k1: string;
    defaultDescription: string;
    minWithdrawable: number;
    maxWithdrawable: number;
}

export interface LnUrlPayErrorData {
    paymentHash: string;
    reason: string;
}

export interface UrlSuccessActionData {
    description: string;
    url: string;
    matchesCallbackDomain: boolean;
}

export interface MessageSuccessActionData {
    message: string;
}

export interface AesSuccessActionDataDecrypted {
    description: string;
    plaintext: string;
}

export type AesSuccessActionDataResult = { type: "decrypted"; data: AesSuccessActionDataDecrypted } | { type: "errorStatus"; reason: string };

export interface AesSuccessActionData {
    description: string;
    ciphertext: string;
    iv: string;
}

export type SuccessActionProcessed = { type: "aes"; result: AesSuccessActionDataResult } | { type: "message"; data: MessageSuccessActionData } | { type: "url"; data: UrlSuccessActionData };

export type SuccessAction = { type: "aes"; data: AesSuccessActionData } | { type: "message"; data: MessageSuccessActionData } | { type: "url"; data: UrlSuccessActionData };

export interface LnUrlPayRequestData {
    callback: string;
    minSendable: number;
    maxSendable: number;
    metadataStr: string;
    commentAllowed: number;
    domain: string;
    allowsNostr: boolean;
    nostrPubkey?: string;
    lnAddress?: string;
}

export interface LiquidAddressData {
    address: string;
    network: Network;
    assetId?: string;
    amount?: number;
    amountSat?: number;
    label?: string;
    message?: string;
}

export interface BitcoinAddressData {
    address: string;
    network: Network;
    amountSat?: number;
    label?: string;
    message?: string;
}

export type InputType = { type: "bitcoinAddress"; address: BitcoinAddressData } | { type: "liquidAddress"; address: LiquidAddressData } | { type: "bolt11"; invoice: LNInvoice } | { type: "bolt12Offer"; offer: LNOffer; bip353Address?: string } | { type: "nodeId"; nodeId: string } | { type: "url"; url: string } | { type: "lnUrlPay"; data: LnUrlPayRequestData; bip353Address?: string } | { type: "lnUrlWithdraw"; data: LnUrlWithdrawRequestData } | { type: "lnUrlAuth"; data: LnUrlAuthRequestData } | { type: "lnUrlError"; data: LnUrlErrorData };

export interface LNOffer {
    offer: string;
    chains: string[];
    minAmount?: Amount;
    description?: string;
    absoluteExpiry?: number;
    issuer?: string;
    signingPubkey?: string;
    paths: LnOfferBlindedPath[];
}

export interface LnOfferBlindedPath {
    blindedHops: string[];
}

export type Amount = { type: "bitcoin"; amountMsat: number } | { type: "currency"; iso4217Code: string; fractionalAmount: number };

export interface RouteHintHop {
    srcNodeId: string;
    shortChannelId: string;
    feesBaseMsat: number;
    feesProportionalMillionths: number;
    cltvExpiryDelta: number;
    htlcMinimumMsat?: number;
    htlcMaximumMsat?: number;
}

export interface RouteHint {
    hops: RouteHintHop[];
}

export interface LNInvoice {
    bolt11: string;
    network: Network;
    payeePubkey: string;
    paymentHash: string;
    description?: string;
    descriptionHash?: string;
    amountMsat?: number;
    timestamp: number;
    expiry: number;
    routingHints: RouteHint[];
    paymentSecret: number[];
    minFinalCltvExpiryDelta: number;
}

export interface ExternalInputParser {
    providerId: string;
    inputRegex: string;
    parserUrl: string;
}

export type Network = "bitcoin" | "testnet" | "signet" | "regtest";

export class BindingLiquidSdk {
  private constructor();
  free(): void;
  getInfo(): Promise<GetInfoResponse>;
  signMessage(req: SignMessageRequest): SignMessageResponse;
  checkMessage(req: CheckMessageRequest): CheckMessageResponse;
  parse(input: string): Promise<InputType>;
  addEventListener(listener: EventListener): Promise<string>;
  removeEventListener(id: string): Promise<void>;
  prepareSendPayment(req: PrepareSendRequest): Promise<PrepareSendResponse>;
  sendPayment(req: SendPaymentRequest): Promise<SendPaymentResponse>;
  prepareReceivePayment(req: PrepareReceiveRequest): Promise<PrepareReceiveResponse>;
  receivePayment(req: ReceivePaymentRequest): Promise<ReceivePaymentResponse>;
  fetchLightningLimits(): Promise<LightningPaymentLimitsResponse>;
  fetchOnchainLimits(): Promise<OnchainPaymentLimitsResponse>;
  preparePayOnchain(req: PreparePayOnchainRequest): Promise<PreparePayOnchainResponse>;
  payOnchain(req: PayOnchainRequest): Promise<SendPaymentResponse>;
  prepareBuyBitcoin(req: PrepareBuyBitcoinRequest): Promise<PrepareBuyBitcoinResponse>;
  buyBitcoin(req: BuyBitcoinRequest): Promise<string>;
  listPayments(req: ListPaymentsRequest): Promise<Payment[]>;
  getPayment(req: GetPaymentRequest): Promise<Payment | undefined>;
  fetchPaymentProposedFees(req: FetchPaymentProposedFeesRequest): Promise<FetchPaymentProposedFeesResponse>;
  acceptPaymentProposedFees(req: AcceptPaymentProposedFeesRequest): Promise<void>;
  prepareLnurlPay(req: PrepareLnUrlPayRequest): Promise<PrepareLnUrlPayResponse>;
  lnurlPay(req: LnUrlPayRequest): Promise<LnUrlPayResult>;
  lnurlWithdraw(req: LnUrlWithdrawRequest): Promise<LnUrlWithdrawResult>;
  lnurlAuth(req_data: LnUrlAuthRequestData): Promise<LnUrlCallbackStatus>;
  registerWebhook(webhook_url: string): Promise<void>;
  unregisterWebhook(): Promise<void>;
  fetchFiatRates(): Promise<Rate[]>;
  listFiatCurrencies(): Promise<FiatCurrency[]>;
  listRefundables(): Promise<RefundableSwap[]>;
  prepareRefund(req: PrepareRefundRequest): Promise<PrepareRefundResponse>;
  refund(req: RefundRequest): Promise<RefundResponse>;
  rescanOnchainSwaps(): Promise<void>;
  sync(): Promise<void>;
  recommendedFees(): Promise<RecommendedFees>;
  backup(req: BackupRequest): void;
  restore(req: RestoreRequest): void;
  disconnect(): Promise<void>;
}
export class IntoUnderlyingByteSource {
  private constructor();
  free(): void;
  start(controller: ReadableByteStreamController): void;
  pull(controller: ReadableByteStreamController): Promise<any>;
  cancel(): void;
  readonly type: ReadableStreamType;
  readonly autoAllocateChunkSize: number;
}
export class IntoUnderlyingSink {
  private constructor();
  free(): void;
  write(chunk: any): Promise<any>;
  close(): Promise<any>;
  abort(reason: any): Promise<any>;
}
export class IntoUnderlyingSource {
  private constructor();
  free(): void;
  pull(controller: ReadableStreamDefaultController): Promise<any>;
  cancel(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_bindingliquidsdk_free: (a: number, b: number) => void;
  readonly connect: (a: any) => any;
  readonly connectWithSigner: (a: any, b: any) => any;
  readonly defaultConfig: (a: any, b: number, c: number) => [number, number, number];
  readonly parseInvoice: (a: number, b: number) => [number, number, number];
  readonly setLogger: (a: any) => [number, number];
  readonly bindingliquidsdk_getInfo: (a: number) => any;
  readonly bindingliquidsdk_signMessage: (a: number, b: any) => [number, number, number];
  readonly bindingliquidsdk_checkMessage: (a: number, b: any) => [number, number, number];
  readonly bindingliquidsdk_parse: (a: number, b: number, c: number) => any;
  readonly bindingliquidsdk_addEventListener: (a: number, b: any) => any;
  readonly bindingliquidsdk_removeEventListener: (a: number, b: number, c: number) => any;
  readonly bindingliquidsdk_prepareSendPayment: (a: number, b: any) => any;
  readonly bindingliquidsdk_sendPayment: (a: number, b: any) => any;
  readonly bindingliquidsdk_prepareReceivePayment: (a: number, b: any) => any;
  readonly bindingliquidsdk_receivePayment: (a: number, b: any) => any;
  readonly bindingliquidsdk_fetchLightningLimits: (a: number) => any;
  readonly bindingliquidsdk_fetchOnchainLimits: (a: number) => any;
  readonly bindingliquidsdk_preparePayOnchain: (a: number, b: any) => any;
  readonly bindingliquidsdk_payOnchain: (a: number, b: any) => any;
  readonly bindingliquidsdk_prepareBuyBitcoin: (a: number, b: any) => any;
  readonly bindingliquidsdk_buyBitcoin: (a: number, b: any) => any;
  readonly bindingliquidsdk_listPayments: (a: number, b: any) => any;
  readonly bindingliquidsdk_getPayment: (a: number, b: any) => any;
  readonly bindingliquidsdk_fetchPaymentProposedFees: (a: number, b: any) => any;
  readonly bindingliquidsdk_acceptPaymentProposedFees: (a: number, b: any) => any;
  readonly bindingliquidsdk_prepareLnurlPay: (a: number, b: any) => any;
  readonly bindingliquidsdk_lnurlPay: (a: number, b: any) => any;
  readonly bindingliquidsdk_lnurlWithdraw: (a: number, b: any) => any;
  readonly bindingliquidsdk_lnurlAuth: (a: number, b: any) => any;
  readonly bindingliquidsdk_registerWebhook: (a: number, b: number, c: number) => any;
  readonly bindingliquidsdk_unregisterWebhook: (a: number) => any;
  readonly bindingliquidsdk_fetchFiatRates: (a: number) => any;
  readonly bindingliquidsdk_listFiatCurrencies: (a: number) => any;
  readonly bindingliquidsdk_listRefundables: (a: number) => any;
  readonly bindingliquidsdk_prepareRefund: (a: number, b: any) => any;
  readonly bindingliquidsdk_refund: (a: number, b: any) => any;
  readonly bindingliquidsdk_rescanOnchainSwaps: (a: number) => any;
  readonly bindingliquidsdk_sync: (a: number) => any;
  readonly bindingliquidsdk_recommendedFees: (a: number) => any;
  readonly bindingliquidsdk_backup: (a: number, b: any) => [number, number];
  readonly bindingliquidsdk_restore: (a: number, b: any) => [number, number];
  readonly bindingliquidsdk_disconnect: (a: number) => any;
  readonly rustsecp256k1_v0_6_1_context_create: (a: number) => number;
  readonly rustsecp256k1_v0_6_1_context_destroy: (a: number) => void;
  readonly rustsecp256k1_v0_6_1_default_illegal_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_6_1_default_error_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_10_0_context_create: (a: number) => number;
  readonly rustsecp256k1_v0_10_0_context_destroy: (a: number) => void;
  readonly rustsecp256k1_v0_10_0_default_illegal_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_10_0_default_error_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1zkp_v0_10_0_default_illegal_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1zkp_v0_10_0_default_error_callback_fn: (a: number, b: number) => void;
  readonly rust_sqlite_wasm_shim_localtime_js: (a: bigint, b: number) => void;
  readonly rust_sqlite_wasm_shim_tzset_js: (a: number, b: number, c: number, d: number) => void;
  readonly rust_sqlite_wasm_shim_emscripten_get_now: () => number;
  readonly rust_sqlite_wasm_shim_malloc: (a: number) => number;
  readonly rust_sqlite_wasm_shim_free: (a: number) => void;
  readonly rust_sqlite_wasm_shim_realloc: (a: number, b: number) => number;
  readonly sqlite3_os_init: () => number;
  readonly task_worker_entry_point: (a: number) => [number, number];
  readonly __wbg_intounderlyingbytesource_free: (a: number, b: number) => void;
  readonly intounderlyingbytesource_type: (a: number) => number;
  readonly intounderlyingbytesource_autoAllocateChunkSize: (a: number) => number;
  readonly intounderlyingbytesource_start: (a: number, b: any) => void;
  readonly intounderlyingbytesource_pull: (a: number, b: any) => any;
  readonly intounderlyingbytesource_cancel: (a: number) => void;
  readonly __wbg_intounderlyingsource_free: (a: number, b: number) => void;
  readonly intounderlyingsource_pull: (a: number, b: any) => any;
  readonly intounderlyingsource_cancel: (a: number) => void;
  readonly __wbg_intounderlyingsink_free: (a: number, b: number) => void;
  readonly intounderlyingsink_write: (a: number, b: any) => any;
  readonly intounderlyingsink_close: (a: number) => any;
  readonly intounderlyingsink_abort: (a: number, b: any) => any;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_6: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly closure38_externref_shim_multivalue_shim: (a: number, b: number, c: any) => [number, number];
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hc5a41db1dabe9b5a: (a: number, b: number) => void;
  readonly closure484_externref_shim: (a: number, b: number, c: any) => void;
  readonly _dyn_core__ops__function__Fn_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h65b85e8787f1cd5e: (a: number, b: number) => void;
  readonly closure833_externref_shim: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
