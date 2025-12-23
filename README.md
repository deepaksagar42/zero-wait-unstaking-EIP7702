# 🚀 Zero-Wait Unstaking Using EIP-7702

This project demonstrates a **zero-wait unstaking mechanism** that allows users to withdraw tokens **immediately after the lock expires**. By leveraging **EIP-7702 delegated execution**, the system ensures unstaking occurs in the **first valid block**, eliminating manual delays and capital inefficiency.

---

## 📖 1. Problem Statement
Traditional staking introduces significant UX friction:
* **Manual Tracking:** Users must manually monitor lock expiry.
* **Execution Lag:** Unstaking often happens minutes or hours late due to human delay or UI refreshes.
* **EOA Limitations:** Standard Externally Owned Accounts (EOAs) cannot execute conditional logic or batch calls.
* **Timing Mismatch:** Local system time is unreliable; only `block.timestamp` represents the true state of the chain.

**The Goal:** Enable unstaking **exactly when eligible**, in the first available block, using smart-account style execution for standard EOAs.

---

## 💡 2. Solution Overview
We achieve "Zero-Wait" performance by combining three pillars:

1.  **Block-Accurate Timing:** Using `block.timestamp` to trigger logic at the consensus layer.
2.  **EIP-7702 Delegation:** The EOA temporarily "adopts" smart contract logic from `WalletLogic.sol` to perform an atomic unstake.
3.  **Automated Watcher:** An off-chain Node.js script that monitors blocks and submits the transaction the instant `currentTimestamp >= unlockTime`.

---

## 🏗️ 3. Architecture & Components

### Smart Contracts
* **`TestToken.sol`**: Standard ERC20 used for the staking pool.
* **`SimpleStaking.sol`**: 
    * Tracks user balances and `unlockTime`.
    * Enforces: `require(block.timestamp >= user.unlockTime, "Still locked")`.
* **`WalletLogic.sol`**: 
    * The stateless logic contract.
    * Contains `executeUnstake(address staking)` which triggers the unstake call.
    * Designed to be called via EIP-7702 delegation.

### Off-Chain Automation (`unstaking/unstake.js`)
* **Listener:** Polls BSC Testnet for new block headers.
* **Logic:** Compares `block.timestamp` from the header against the stored `unlockTime`.
* **Executor:** When valid, it signs and broadcasts an EIP-7702 transaction.

---

## 🛠️ 4. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Smart Contracts** | Solidity ^0.8.x |
| **Framework** | Hardhat |
| **Blockchain** | BSC Testnet |
| **Account Model** | EIP-7702 (Delegated Execution) |
| **Automation** | Node.js / Ethers.js |

---

## 🚀 5. How to Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [npm](https://www.npmjs.com/)
* A wallet with **BSC Testnet BNB**

### 1. Clone & Install
```bash
git clone [https://github.com/deepaksagar42/zero-wait-unstaking-EIP7702.git](https://github.com/deepaksagar42/zero-wait-unstaking-EIP7702.git)
cd zero-wait-unstaking-EIP7702
npm install
```
### 2. Environment Setup
```bash
Create a .env file in the project root...
PRIVATE_KEY=your_testnet_private_key(also add 0x in start ..to convert into hexadecimal)
```

### 3. Compile & Deploy
```bash
# Compile contracts
npx hardhat compile

# Deploy to BSC Testnet
npx hardhat run scripts/deploy.ts --network bscTestnet
```

### 4. Stake and Automate
```bash
# Stake tokens into the contract
npx hardhat run scripts/approveAndStake.ts --network bscTestnet

# Start the zero-wait automated listener
node unstaking/unstake.js
```
## 🔍 6. Technical Flow
1. Staking: User stakes 100 tokens; ```SimpleStaking``` sets ```unlockTime = block.timestamp + LOCK_DURATION.```
 
2. Monitoring: The ```unstake.js``` script watches every new block on BSC.

3. Trigger: As soon as a block header arrives where ```timestamp >= unlockTime:```
  - The script prepares an EIP-7702 transaction.
  - The EOA executes the unstake via the WalletLogic contract.
4. Result: Tokens are returned to the EOA in the very first block possible.

## ✅ 7. Conclusion
This project demonstrates how EIP-7702 enables a new era of "Intent-centric" UX. Users no longer need to wait or manually click "Unstake." By combining delegated execution with block-accurate automation, we maximize capital efficiency and remove the friction of traditional EOAs.
