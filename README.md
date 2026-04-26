# Simple ETH Token Bank

A minimal DeFi-style project demonstrating how ERC20 tokens interact with a smart contract vault on Ethereum.

## 🚀 Overview

This project implements:

- ERC20-like token (`MockToken`)
- Vault contract (`TokenBank`)
- Full flow: `approve → deposit → withdraw`

It demonstrates core Ethereum concepts:

- `mapping` for balances and deposits
- `msg.sender` for authorization
- `approve / transferFrom` pattern
- contract-to-contract interaction
- events

---

## 🧱 Contracts

### MockToken

A simplified ERC20 token used for testing.

Features:
- `balanceOf`
- `transfer`
- `approve`
- `transferFrom`

---

### TokenBank

A vault contract that accepts token deposits.

Features:
- deposit tokens via `transferFrom`
- withdraw tokens
- track user balances
- emits events

---

## 🔁 Flow

1. User receives tokens
2. User approves TokenBank: