# Layer 2 Deployment Guide
#
# Available networks:
#   sepolia   - Ethereum Sepolia testnet (chainId: 11155111)
#   polygon   - Polygon PoS (chainId: 137)
#   optimism  - Optimism Mainnet (chainId: 10)
#   arbitrum  - Arbitrum One (chainId: 42161)
#   base      - Base Mainnet (chainId: 8453)
#
# Prerequisites:
#   1. Set PRIVATE_KEY in .env
#   2. Set RPC URLs in .env
#   3. Set block explorer API keys for verification
#
# Deploy to local Hardhat node:
#   npx hardhat node &
#   npx hardhat run scripts/deploy.ts --network localhost
#
# Deploy to Sepolia testnet:
#   npx hardhat run scripts/deploy-l2.ts --network sepolia
#
# Deploy to Polygon:
#   npx hardhat run scripts/deploy-l2.ts --network polygon
#
# Deploy to Optimism:
#   npx hardhat run scripts/deploy-l2.ts --network optimism
#
# Deploy to Arbitrum:
#   npx hardhat run scripts/deploy-l2.ts --network arbitrum
#
# Deploy to Base:
#   npx hardhat run scripts/deploy-l2.ts --network base
#
# Verify contracts on Etherscan (after deployment):
#   npx hardhat verify --network polygon <PASSPORT_SBT_ADDRESS>
#   npx hardhat verify --network polygon <REPUTATION_ORACLE_ADDRESS>
#   npx hardhat verify --network polygon <ENDORSEMENT_REGISTRY_ADDRESS>
#   npx hardhat verify --network polygon <DISPUTE_RESOLUTION_DAO_ADDRESS>
#   npx hardhat verify --network polygon <ATTESTATION_REGISTRY_ADDRESS>
#   npx hardhat verify --network polygon <PASSPORT_FACADE_ADDRESS> \
#     <PASSPORT_SBT_ADDRESS> <REPUTATION_ORACLE_ADDRESS> \
#     <ENDORSEMENT_REGISTRY_ADDRESS> <DISPUTE_RESOLUTION_DAO_ADDRESS> \
#     <ATTESTATION_REGISTRY_ADDRESS>
