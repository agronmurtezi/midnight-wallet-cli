# Wallet CLI Architecture

A comprehensive technical reference for the Midnight Wallet CLI application.

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Application Flow](#application-flow)
4. [Navigation System](#navigation-system)
5. [Screen vs Component Architecture](#screen-vs-component-architecture)
6. [State Management](#state-management)
7. [Wallet System](#wallet-system)
8. [Configuration & Environments](#configuration--environments)
9. [Keyboard Handling](#keyboard-handling)
10. [Security](#security)
11. [Data Flow Diagrams](#data-flow-diagrams)
12. [Dependencies](#dependencies)

---

## Overview

The Wallet CLI is an interactive terminal user interface (TUI) for managing Midnight wallets. Built with
[Ink](https://github.com/vadimdemedes/ink) (React for CLIs), it features:

- **Three-Wallet Architecture**: Manages Shielded, Unshielded, and Dust wallets simultaneously
- **Typed Stack Navigator**: Type-safe screen transitions with compile-time guarantees
- **Real-time Updates**: RxJS-powered wallet state subscriptions
- **Clean Separation**: Navigation-aware screens vs. reusable UI components

---

## Project Structure

```
src/
├── index.tsx                      # Entry point with graceful shutdown
├── App.tsx                        # Root component (composition root)
├── types.ts                       # Global TypeScript type definitions
├── constants.ts                   # Constants (NIGHT_TOKEN_ID)
│
├── screens/                       # Navigation-aware screen components
│   ├── ScreenHost.tsx             # Top-level router (dashboard vs setup)
│   ├── index.ts
│   ├── setup/                     # Setup flow screens
│   │   ├── EnvironmentScreen.tsx  # Environment selection
│   │   ├── SeedTypeScreen.tsx     # Seed input method selection
│   │   ├── SeedScreen.tsx         # Seed input form
│   │   ├── InitializingScreen.tsx # Wallet initialization loading
│   │   └── index.tsx              # SetupScreenHost router
│   └── dashboard/                 # Dashboard screens
│       ├── DashboardScreen.tsx    # Main dashboard with local view modes
│       ├── WalletStateView.tsx    # Wallet balances/addresses display
│       ├── SyncProgressView.tsx   # Sync percentage display
│       ├── TransferView.tsx       # Token transfer workflow
│       ├── DustRegistrationView.tsx
│       ├── DustDeregistrationView.tsx
│       ├── SettingsView.tsx
│       ├── transfer/              # Transfer workflow components
│       ├── dustRegistration/      # Dust registration step components
│       └── dustDeregistration/    # Dust deregistration step components
│
├── components/                    # Reusable UI components (no navigation)
│   ├── StatusHeader.tsx           # Environment/sync status display
│   ├── BackHint.tsx               # "Press Esc to go back" hint
│   ├── Loader.tsx                 # Loading spinner animation
│   ├── TransactionResult.tsx      # Transaction success/error/processing
│   └── UtxoSelect.tsx             # UTXO selection dropdown
│
├── navigation/                    # Stack-based navigation system
│   ├── types.ts                   # Route definitions & Navigator interface
│   ├── useStackNavigator.ts       # Stack navigation React hook
│   └── index.ts
│
├── lib/                           # Business logic and wallet operations
│   ├── wallet.ts                  # Wallet initialization and setup
│   ├── transfer.ts                # Token transfer execution
│   ├── dustRegistration.ts        # Dust registration transaction
│   └── dustDeregistration.ts      # Dust deregistration transaction
│
├── config/                        # Configuration management
│   └── environments.ts            # Network environment configs
│
└── utils/                         # Utility functions
    ├── sync.ts                    # Sync percentage calculations
    ├── balance.ts                 # Balance formatting
    ├── display.ts                 # Display formatting utilities
    └── addressValidation.ts       # Address validation utilities
```

---

## Application Flow

### Entry Point (`index.tsx`)

The entry point wraps the App component with Ink's `render()` and sets up graceful shutdown:

```typescript
const { waitUntilExit } = render(<App onExit={handleExit} />);

// Graceful shutdown handlers
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
```

### Navigation Flow

```
environment → seedType → seed → initializing → dashboard
     ↑           ↑         ↑         ✗            ✗
   (start)     (back)    (back)   (no back)   (no back)
```

**Navigation rules:**

| Transition               | Method    | Can Go Back?             |
| ------------------------ | --------- | ------------------------ |
| environment → seedType   | `push`    | Yes                      |
| seedType → seed          | `push`    | Yes                      |
| seed → initializing      | `replace` | No (seed screen removed) |
| initializing → dashboard | `replace` | No (terminal state)      |

---

## Navigation System

### Route Definitions (`navigation/types.ts`)

Routes define the navigation contract - which screens exist and what data they require:

```typescript
type Routes = {
  environment: undefined; // No params
  seedType: { environment: Environment }; // Needs environment
  seed: { environment: Environment; seedType: SeedType }; // Needs both
  initializing: {
    // All three
    environment: Environment;
    seedType: SeedType;
    seed: Uint8Array;
  };
  dashboard: { environment: Environment }; // Just environment
};
```

### Navigator API

The `Navigator` interface provides type-safe navigation methods:

| Method                  | Description                                 |
| ----------------------- | ------------------------------------------- |
| `push(name, params)`    | Add a new screen to the stack               |
| `replace(name, params)` | Replace current screen (no back navigation) |
| `pop()`                 | Go back to the previous screen              |
| `reset(name, params)`   | Clear stack and start fresh                 |
| `canGoBack()`           | Check if back navigation is possible        |
| `route`                 | Current active route                        |
| `stack`                 | Full navigation history                     |

### Stack Navigator Hook

```typescript
const nav = useStackNavigator({ name: 'environment', params: undefined });

// Navigate forward
nav.push('seedType', { environment: 'preprod' });

// Replace current (seed → initializing)
nav.replace('initializing', { environment, seedType, seed });

// Go back
nav.pop();
```

### Type Safety

TypeScript enforces parameter requirements at compile time:

```typescript
// ✓ Correct
nav.push('seedType', { environment: 'dev' });

// ✗ Error: Argument of type '{}' is not assignable
nav.push('seedType', {});

// ✗ Error: Expected 2 arguments, but got 1
nav.push('seedType');
```

---

## Screen vs Component Architecture

The CLI enforces a strict separation between **Screens** (navigation-aware) and **Components** (reusable UI).

### Ownership Rules

#### Screens (`/screens/**`)

Screens represent route-level "pages" and are responsible for:

- **Navigation**: Can call `nav.push()`, `nav.replace()`, `nav.pop()`, `nav.reset()`
- **Route Awareness**: Receive `route` and `nav` props, read data from `route.params`
- **Data Flow**: Coordinate between navigation, components, and App callbacks
- **Screen Logic**: Handle screen-specific business logic

```typescript
// Screen example - navigation-aware
export const SeedTypeScreen: React.FC<Props> = ({ route, nav }) => {
  const handleSelectSeedType = (seedType: SeedType) => {
    nav.push('seed', {
      environment: route.params.environment,
      seedType,
    });
  };

  return <SeedTypeSelect onSelectSeedType={handleSelectSeedType} />;
};
```

#### Components (`/components/**`)

Components are pure, reusable UI building blocks:

- **No Navigation**: Must NOT import navigation types or call `nav.*`
- **No Route Awareness**: Must NOT know about routes or app flow
- **Callback-Based**: Communicate ONLY via props and callbacks
- **Reusable**: Can be used across multiple screens or projects

```typescript
// Component example - navigation-agnostic
interface Props {
  onSelectSeedType: (seedType: SeedType) => void;
}

export const SeedTypeSelect: React.FC<Props> = ({ onSelectSeedType }) => {
  return (
    <SelectInput
      items={seedTypes}
      onSelect={(item) => onSelectSeedType(item.value)}
    />
  );
};
```

### Screen Routing Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  - Creates navigator (useStackNavigator)                    │
│  - Manages global state (facade, state, errors)             │
│  - Centralized keyboard handling (Ctrl+C, Esc)              │
│  - Async wallet initialization                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    <ScreenHost />
                           │
        ┌──────────────────┴────────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────────┐                ┌──────────────────────┐
│ DashboardScreen   │                │  SetupScreenHost     │
│  (dashboard)      │                │   (setup routes)     │
│                   │                └──────────────────────┘
│ Local view modes: │                           │
│ - WalletState     │       ┌───────────────────┼───────────────────┐
│ - SyncProgress    │       │                   │                   │
│ - Transfer        │       ▼                   ▼                   ▼
│ - DustReg/Dereg   │  Environment        SeedType              Seed
│ - Settings        │    Screen            Screen              Screen
└───────────────────┘       │                   │                   │
                            ▼                   ▼                   ▼
                     EnvironmentSelect   SeedTypeSelect        SeedInput
                       (component)         (component)        (component)
```

---

## State Management

### State Locations

| State Type   | Location            | Description                            |
| ------------ | ------------------- | -------------------------------------- |
| Navigation   | `useStackNavigator` | Route stack, current route             |
| Global       | `App.tsx`           | facade, walletState, errors, networkId |
| Route params | `route.params`      | Data passed between screens            |
| Local view   | `DashboardScreen`   | Current view mode within dashboard     |

### Global State (App.tsx)

```typescript
// Wallet infrastructure
const [facade, setFacade] = useState<WalletFacade | undefined>();
const [state, setState] = useState<FacadeState | undefined>();
const [error, setError] = useState<string | undefined>();

// Configuration
const [networkId, setNetworkId] = useState<NetworkId>();
const [currentConfig, setCurrentConfig] = useState<EnvironmentConfig>();

// Keys and credentials (derived during initialization)
const [secretKeys, setSecretKeys] = useState<SecretKeys>();
const [unshieldedKeystore, setUnshieldedKeystore] = useState<UnshieldedKeystore>();
```

### RxJS Subscriptions

The app subscribes to wallet state changes using RxJS:

```typescript
useEffect(() => {
  if (!facade) return;

  const subscription = facade.state().subscribe({
    next: (newState) => setState(newState),
    error: (err) => setError(err.message),
  });

  return () => subscription.unsubscribe();
}, [facade]);
```

---

## Wallet System

### Three-Wallet Architecture

The Midnight wallet system uses three specialized wallets:

| Wallet     | Address Prefix | Purpose                  |
| ---------- | -------------- | ------------------------ |
| Shielded   | `zswap1...`    | Private transactions     |
| Unshielded | `night1...`    | Transparent transactions |
| Dust       | `dust1...`     | Dust generation/burning  |

### Initialization Process (`lib/wallet.ts`)

1. Create HD wallet from seed
2. Derive keys for account 0, roles [Zswap, NightExternal, Dust] at index 0
3. Generate secret keys for each wallet type
4. Initialize ShieldedWallet, UnshieldedWallet, and DustWallet
5. Create WalletFacade to coordinate all three
6. Start facade with secret keys
7. Subscribe to state updates

### Address Encoding

```typescript
// Shielded addresses (objects requiring encoding)
ShieldedAddress.codec.encode(networkId, state.shielded.address).asString();
// Returns: zswap1...

// Unshielded addresses (objects requiring encoding)
UnshieldedAddress.codec.encode(networkId, state.unshielded.address).asString();
// Returns: night1...

// Dust addresses (already strings)
state.dust.dustAddress;
// Returns: dust1...
```

### Balance Formatting

Balances are stored as bigint with 6 decimal places. The formatter abbreviates large values:

```typescript
function formatBalance(balance: bigint): string {
  const denomination = BigInt(10 ** 6); // 6 decimal places
  const value = balance / denomination;
  const fractionalPart = balance % denomination;

  // Abbreviate large values
  if (value >= 1_000_000_000_000n) return `${value / trillion}T`; // Trillions
  if (value >= 1_000_000_000n) return `${value / billion}B`; // Billions
  if (value >= 1_000_000n) return `${value / million}M`; // Millions

  // For smaller values, show with thousands separators
  const wholeStr = value.toLocaleString('en-US');
  if (fractionalPart > 0n) {
    const fractionalStr = fractionalPart.toString().padStart(6, '0').replace(/0+$/, '');
    return `${wholeStr}.${fractionalStr}`;
  }
  return wholeStr;
}
```

**Examples:**

- `1500000000000000000n` → `"1.5B"`
- `2500000n` → `"2.5"`
- `1234567890n` → `"1,234.56789"`

### Sync Percentage Calculation

```typescript
const shieldedPercent = (shieldedApplied / shieldedTotal) * 100;
const unshieldedPercent = (unshieldedApplied / unshieldedTotal) * 100;
const dustPercent = (dustApplied / dustTotal) * 100;
const overall = (shieldedPercent + unshieldedPercent + dustPercent) / 3;
```

When a wallet has no transactions (total = 0), it's considered 100% synced.

---

## Configuration & Environments

### Supported Networks (`config/environments.ts`)

| Environment    | NetworkId  | Indexer                            | Node RPC                       |
| -------------- | ---------- | ---------------------------------- | ------------------------------ |
| **preprod**    | PreProd    | indexer.preprod.midnight.network   | rpc.preprod.midnight.network   |
| **preview**    | Preview    | indexer.preview.midnight.network   | rpc.preview.midnight.network   |
| **qanet**      | QaNet      | indexer.qanet.dev.midnight.network | rpc.qanet.dev.midnight.network |
| **dev**        | DevNet     | indexer.devnet.midnight.network    | rpc.devnet.midnight.network    |
| **undeployed** | Undeployed | localhost:8088                     | localhost:8080                 |

### Environment Configuration Structure

```typescript
interface EnvironmentConfig {
  indexer: string; // HTTP URL for GraphQL indexer
  indexerWs: string; // WebSocket URL for subscriptions
  nodeRpc: string; // WebSocket URL for node RPC
  provingServer: string; // URL for proving server (localhost:6300)
  networkId: NetworkId; // Network identifier for address encoding
}
```

---

## Keyboard Handling

### Centralized Handler (App.tsx)

The App component manages global keyboard shortcuts:

```typescript
useInput((input, key) => {
  // Exit from any screen
  if (key.ctrl && input === 'c') {
    handleQuit();
    return;
  }

  // Back navigation (setup only)
  if (key.escape) {
    if (nav.route.name !== 'dashboard' && nav.route.name !== 'initializing' && nav.canGoBack()) {
      setError(undefined); // Clear error first
      nav.pop();
    }
  }
});
```

### Keyboard Shortcuts Summary

**During Setup:** | Key | Action | |-----|--------| | Arrow Keys | Navigate menu options | | Enter | Select menu item |
| Esc | Go back to previous screen | | Ctrl+C | Exit application |

**In Dashboard:** | Key | Action | |-----|--------| | s | View wallet state | | p | View sync progress | | t | Token
transfer | | r | Dust registration | | d | Dust deregistration | | c | Settings (change environment) | | q | Quit
application | | Ctrl+C | Exit application |

### Back Navigation Semantics

- Esc clears error state and pops stack **only in setup flow**
- Esc does nothing on dashboard (user must press 'q' to quit)
- Esc cannot navigate back from initializing (reached via `nav.replace`)

---

## Security

### Seed Handling (Critical)

**The seed must NEVER be stored in App React state or long-lived global state.**

- Seed may only exist in route params during the `initializing` transition
- On initialization success: `nav.replace('dashboard')` discards the seed
- On initialization error: `nav.replace('seed')` discards the seed
- Seed must not persist beyond the initialization scope

```typescript
const handleSeedSubmit = async (seed: Uint8Array) => {
  nav.replace('initializing', { environment, seedType, seed });

  try {
    const facade = await initializeWallet(seed, envConfig);
    setFacade(facade);
    nav.replace('dashboard', { environment }); // Seed discarded
  } catch (err) {
    setError(`Failed to initialize: ${err}`);
    nav.replace('seed', { environment, seedType }); // Seed discarded
  }
};
```

### Graceful Shutdown

The application handles cleanup on exit:

1. Unsubscribes from RxJS state subscription
2. Stops the WalletFacade
3. Clears HD wallet sensitive data
4. Exits process

---

## Data Flow Diagrams

### Setup Flow Data Flow

```
User Input
    │
    ▼
┌─────────────────────┐
│ EnvironmentSelect   │ ──onSelectEnvironment(env)──► EnvironmentScreen
│   (Component)       │                                      │
└─────────────────────┘                                      │
                                        nav.push('seedType', { environment })
                                                             ▼
                                                    ┌─────────────────────┐
                                                    │  SeedTypeScreen     │
                                                    │  ┌─────────────┐    │
                                                    │  │SeedTypeSelect│   │
                                                    │  └─────────────┘    │
                                                    │         │            │
                                                    │  onSelectSeedType   │
                                                    │         │            │
                                                    │  nav.push('seed')   │
                                                    └─────────────────────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────────┐
                                                    │   SeedScreen        │
                                                    │   ┌───────────┐     │
                                                    │   │ SeedInput │     │
                                                    │   └───────────┘     │
                                                    │         │            │
                                                    │   onSubmitSeed      │
                                                    └─────────────────────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────────┐
                                                    │     App.tsx         │
                                                    │  handleSeedSubmit   │
                                                    │         │            │
                                                    │  nav.replace        │
                                                    │  ('initializing')   │
                                                    └─────────────────────┘
                                                             │
                                              ┌──────────────┴──────────────┐
                                              │                             │
                                         Success                          Error
                                              │                             │
                                    nav.replace('dashboard')     setError() +
                                              │                   nav.replace('seed')
                                              ▼
                                    ┌─────────────────────┐
                                    │  DashboardScreen    │
                                    │  (local view modes) │
                                    └─────────────────────┘
```

### Ownership Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                    src/App.tsx                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Composition Root                                  │  │
│  │ ✓ Creates and owns navigator                     │  │
│  │ ✓ Manages global facade, state, errors           │  │
│  │ ✓ Centralized keyboard handling (Ctrl+C, Esc)    │  │
│  │ ✓ Async wallet initialization                    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Renders
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    /screens/**                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ✓ Import navigation types (Route, Navigator)     │  │
│  │ ✓ Call nav.push(), nav.replace(), nav.pop()      │  │
│  │ ✓ Read route.params                              │  │
│  │ ✓ Coordinate navigation and components           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Props & Callbacks
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  /components/**                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ✗ NO navigation imports                          │  │
│  │ ✗ NO nav.* calls                                 │  │
│  │ ✗ NO route awareness                             │  │
│  │ ✓ Callbacks only (onSelect, onSubmit, onQuit)    │  │
│  │ ✓ Reusable across screens                        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Dependencies

### Runtime Dependencies

| Package                        | Version | Purpose                         |
| ------------------------------ | ------- | ------------------------------- |
| `@midnight-ntwrk/wallet-sdk-*` | -       | Midnight wallet SDK packages    |
| `@scure/bip39`                 | ^1.4.0  | BIP39 mnemonic phrase utilities |
| `ink`                          | ^5.1.0  | React-based TUI framework       |
| `ink-select-input`             | ^6.0.0  | Select menu component           |
| `ink-text-input`               | ^6.0.0  | Text input component            |
| `react`                        | ^18.3.1 | React library                   |

### Dev Dependencies

| Package        | Version  | Purpose                |
| -------------- | -------- | ---------------------- |
| `tsx`          | ^4.20.4  | TypeScript executor    |
| `typescript`   | ^5.9.3   | TypeScript compiler    |
| `@types/react` | ^18.3.18 | React type definitions |

---

## Benefits of This Architecture

1. **Type Safety**: Invalid navigation calls caught at compile time
2. **Clear Data Flow**: Explicit params passed between screens
3. **Maintainable**: Easy to add new routes or modify flow
4. **Testable**: Navigator can be mocked for testing screens
5. **No Global State Pollution**: Each screen gets exactly what it needs via props
6. **Separation of Concerns**: Navigation logic separate from UI components
7. **Security**: Seed handling follows strict security invariants

---

## Future Extensions

This architecture makes it easy to:

- Add new screens (define route, add case in switch)
- Add deep linking (parse URL/command args into route)
- Add navigation history/breadcrumbs
- Add modal overlays (separate modal stack)
- Add navigation guards (validation before transition)
