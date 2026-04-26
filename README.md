# Simple ETH Token Bank

A minimal DeFi-style project that demonstrates how an ERC20-like token interacts with a vault smart contract on Ethereum.

## Description

This repository contains two core contracts:

- `MockToken`: a lightweight ERC20-like token for local testing
- `TokenBank`: a vault that accepts deposits and allows withdrawals of the configured token

The project demonstrates the standard token flow:

`approve -> transferFrom (deposit) -> transfer (withdraw)`

## Contracts

### MockToken

`contracts/MockToken.sol`

Implemented features:

- `balanceOf`
- `transfer`
- `approve`
- `transferFrom`
- `allowance`

Design notes:

- Uses `require` checks for zero addresses, balances, and allowance
- Mints the full `initialSupply` to the deployer in the constructor

### TokenBank

`contracts/TokenBank.sol`

Implemented features:

- `deposit(uint256 amount)`
- `withdraw(uint256 amount)`
- per-user storage in `deposits`
- aggregate storage in `totalDeposits`
- `bankTokenBalance()` helper
- events: `Deposited`, `Withdrawn`

Design notes:

- Constructor validates non-zero token address
- Deposits pull tokens from user via `transferFrom`
- Withdrawals check user deposit before transferring tokens back

## Architecture and Flow

Deployment and interaction are organized as follows:

- Ignition module: `ignition/modules/TokenBank.ts`
  - Deploys `MockToken`
  - Deploys `TokenBank` with token address
- Script config: `scripts/config.ts`
  - Reads `TOKEN_ADDRESS` and `BANK_ADDRESS` from environment variables
- Interaction script: `scripts/bank.ts`
  - Approves bank spending
  - Deposits `100` tokens
  - Withdraws `100` tokens
  - Prints balances before and after each step

Typical local flow:

1. Start local Hardhat node
2. Compile and deploy contracts
3. Put deployed addresses into environment variables
4. Run interaction script (`approve -> deposit -> withdraw`)

## Installation

Install dependencies:

```bash
npm install
```

## Run Locally

Start local network:

```bash
just run-node
```

In another terminal, compile and deploy:

```bash
just deploy
```

Run the bank interaction script:

```bash
just run bank
```

Equivalent direct Hardhat commands:

```bash
npx hardhat node
npx hardhat compile
npx hardhat ignition deploy ignition/modules/TokenBank.ts --network localhost --reset
npx hardhat run scripts/bank.ts --network localhost
```

## Environment Variables

Create a `.env` file in project root:

```bash
TOKEN_ADDRESS=0x...
BANK_ADDRESS=0x...
```

Use values from deployment output (`deployed_addresses.json` under `ignition/deployments/chain-31337/`).

## Testing

The `package.json` `test` script is currently a placeholder.
Run Hardhat tests directly:

```bash
npx hardhat test
```

Current tests are located in:

- `test/MockToken.ts`
- `test/TokenBank.ts`

## Project Structure

- `contracts/` - Solidity contracts
- `ignition/modules/` - deployment modules
- `scripts/` - runtime interaction scripts
- `test/` - test suites
- `artifacts/`, `cache/`, `types/` - generated build/type outputs

## Security Notes and Limitations

This project is intentionally minimal

- No role-based access control
- No pause/emergency stop mechanism
- No reentrancy guard (current logic updates state before transfer, but defense-in-depth is still recommended in production)
- No fee logic or advanced accounting model

Do not use as-is for production funds.

