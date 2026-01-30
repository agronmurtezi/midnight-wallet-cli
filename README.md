# Midnight Wallet CLI

An interactive terminal interface for managing Midnight wallets. Built with [Ink](https://github.com/vadimdemedes/ink) and React.

> **⚠️ Disclaimer:** This software is intended for development and testing purposes only. It is not intended for mainnet use.

## Features

- **Three-Wallet System**: Manages Shielded, Unshielded, and Dust wallets simultaneously
- **Multiple Networks**: Connect to preprod, preview, qanet, dev, or local environments
- **Real-time Sync**: Live wallet state updates with sync progress indicator
- **Token Transfers**: Send tokens between shielded and unshielded wallets
- **Dust Management**: Register and deregister dust for transaction fees
- **Flexible Authentication**: BIP39 mnemonic, hex seed, or random seed generation

## Prerequisites

- Node.js 20+
- Proving server running at `http://localhost:6300`
- Valid wallet seed (24-word mnemonic or 64-char hex)

## Quick Start

```bash
yarn install
yarn start
```

## Usage

### Setup Flow

1. **Select Environment** - Choose network (preprod, preview, qanet, dev, undeployed)
2. **Select Seed Type** - Mnemonic, hex seed, or generate random
3. **Enter Seed** - Input your wallet seed
4. **Dashboard** - Interact with your wallets

### Keyboard Shortcuts

**Setup Screens:**

| Key        | Action           |
| ---------- | ---------------- |
| Arrow Keys | Navigate options |
| Enter      | Select           |
| Esc        | Go back          |
| Ctrl+C     | Exit             |

**Dashboard:**

| Key    | Action          |
| ------ | --------------- |
| s      | Wallet state    |
| p      | Sync progress   |
| t      | Transfer tokens |
| r      | Register dust   |
| d      | Deregister dust |
| c      | Settings        |
| q      | Quit            |
| Ctrl+C | Exit            |

## Environments

| Environment    | Network    | Description            |
| -------------- | ---------- | ---------------------- |
| **preprod**    | PreProd    | Pre-production network |
| **preview**    | Preview    | Preview network        |
| **qanet**      | QaNet      | QA testing network     |
| **dev**        | DevNet     | Development network    |
| **undeployed** | Undeployed | Local (localhost)      |

## Wallet Types

| Wallet     | Address   | Purpose                  |
| ---------- | --------- | ------------------------ |
| Shielded   | `zswap1…` | Private transactions     |
| Unshielded | `night1…` | Transparent transactions |
| Dust       | `dust1…`  | Transaction fees         |

## Development

```bash
yarn start        # Run CLI
yarn dist         # Build to dist/
yarn typecheck    # Type check
yarn lint         # Lint code
yarn format       # Format code
yarn clean        # Clean build artifacts
```

## Troubleshooting

### "Failed to initialize wallets"

- Verify proving server is running at `http://localhost:6300`
- Check network connectivity to the selected environment

### "Invalid seed format"

**Hex seed:**

- Exactly 64 hexadecimal characters (0-9, a-f)
- No spaces or special characters

**Mnemonic:**

- Exactly 24 BIP39 words
- Space or comma separated

### Wallets not syncing

- Check internet connection
- Verify environment endpoints are accessible
- Initial sync may take several minutes

### Terminal display issues

- Ensure terminal supports ANSI colors and UTF-8
- Try resizing terminal window

## Architecture

For technical documentation including navigation system, state management, and component architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).
