# NonceSign DApp

## Overview
NonceSign is a decentralized application (DApp) designed for secure, tamper-proof document creation, signing, and tracking on the Ethereum blockchain. This application allows users to create documents, assign signers, and track the signing progress. Once all signers have signed the document, it is marked as completed.

## Features
- **Document Creation**: Users can create documents, define their details, and assign multiple signers.
- **Document Signing**: Signers can securely sign documents, providing a unique signature hash.
- **Progress Tracking**: Document status updates automatically once all signers have signed.
- **Authorization Management**: Only designated signers can sign a document.
- **Pausable Contract**: Allows the contract owner to pause and unpause the contract.
- **Reentrancy Protection**: Secures against reentrancy attacks during the signing process.

## Prerequisites
- [Node.js](https://nodejs.org/en/download/) and npm
- [Hardhat](https://hardhat.org/) - Ethereum development environment

## Installation

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/nonce-sign.git
    cd nonce-sign
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Compile the Contract**:
    ```bash
    npx hardhat compile
    ```

4. **Deploy the Contract**:
    Update the `hardhat.config.js` file with your wallet's private key and desired network configuration.
    
    ```bash
    npx hardhat run scripts/deploy.js --network <network-name>
    ```

## Usage

### 1. Contract Deployment
The contract is deployed to the base sepolia chain and is ready to be used for creating and signing documents.

- the contract address is: `0x336172f27e937e4810D1b4611D0d98E885f87095` and can be viewed on the sepolia explorer at https://sepolia.basescan.org/address/0x336172f27e937e4810D1b4611D0d98E885f87095

## Technologies Used
- Solidity
- Hardhat
- React
- Next.js
- Tailwind CSS
- Wagmi
- Coinbase Wallet SDK
- Onchain kit

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For any questions or inquiries, please contact the project maintainer at [contact@nonce.so](mailto:contact@nonce.so).
