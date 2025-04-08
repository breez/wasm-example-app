# Breez Lightning Wallet (Web Demo)

A demonstration web application showing how to implement a Lightning Network wallet using the Breez SDK with WebAssembly.

## Overview

This project demonstrates building a web-based Lightning wallet that enables users to:

- Connect with a mnemonic seed phrase
- Send Lightning payments using bolt11 invoices
- Receive Lightning payments by generating invoices
- View transaction history
- View detailed payment information

The application showcases best practices for implementing a Lightning wallet in a web environment using React and the Breez SDK WebAssembly bindings.

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- Breez SDK (WASM version) for Lightning Network functionality

## Prerequisites

- A Breez API key ([Get one here](https://breez.technology))

## Getting Started

### Clone the repository

```bash
git clone https://github.com/yourusername/breez-wasm-wallet.git
cd breez-wasm-wallet
```

### Install dependencies

```bash
npm install
```

### Set up environment variables

1. Create a `.env.local` file in the project root
2. Add your Breez API key:

```
VITE_BREEZ_API_KEY="your_breez_api_key_here"
```

### Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
/src
  /components        # UI components
    /ui              # Reusable UI component library
  /contexts          # React context providers
  /services          # Business logic and API communication
  App.tsx            # Main application component
  main.tsx           # Application entry point
  index.css          # Global styles
/pkg                 # WebAssembly bindings for Breez SDK
```

## Key Components

- **walletService.ts** - Handles communication with the Breez SDK
- **SendPaymentDialog** - Dialog for making Lightning payments
- **ReceivePaymentDialog** - Dialog for generating invoices
- **PaymentDetailsDialog** - Shows detailed information about transactions


## Security Notes

- The application stores your mnemonic in localStorage, which is not suitable for production use
- For a production application, use secure storage and encryption for sensitive data