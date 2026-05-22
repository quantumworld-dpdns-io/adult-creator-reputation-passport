import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";

const L2_DEPLOYMENTS: Record<string, { chainId: number; name: string }> = {
  polygon: { chainId: 137, name: "Polygon Mainnet" },
  optimism: { chainId: 10, name: "Optimism Mainnet" },
  arbitrum: { chainId: 42161, name: "Arbitrum One" },
  base: { chainId: 8453, name: "Base Mainnet" },
  scroll: { chainId: 534352, name: "Scroll Mainnet" },
  zksync: { chainId: 324, name: "zkSync Era" },
};

async function main(): Promise<void> {
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = network.name;

  const l2Config = Object.entries(L2_DEPLOYMENTS).find(
    ([, c]) => c.chainId === chainId
  );

  console.log(`Deploying to ${l2Config ? l2Config[1].name : networkName} (chainId: ${chainId})`);

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  const PassportSBT = await ethers.getContractFactory("PassportSBT");
  const passport = await PassportSBT.deploy();
  await passport.waitForDeployment();
  const passportAddress = await passport.getAddress();
  console.log("PassportSBT:", passportAddress);

  const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
  const reputationOracle = await ReputationOracle.deploy();
  await reputationOracle.waitForDeployment();
  const repOracleAddress = await reputationOracle.getAddress();
  console.log("ReputationOracle:", repOracleAddress);

  const EndorsementRegistry = await ethers.getContractFactory("EndorsementRegistry");
  const endorsementRegistry = await EndorsementRegistry.deploy();
  await endorsementRegistry.waitForDeployment();
  const endorsementAddress = await endorsementRegistry.getAddress();
  console.log("EndorsementRegistry:", endorsementAddress);

  const DisputeResolutionDAO = await ethers.getContractFactory("DisputeResolutionDAO");
  const disputeDAO = await DisputeResolutionDAO.deploy();
  await disputeDAO.waitForDeployment();
  const disputeAddress = await disputeDAO.getAddress();
  console.log("DisputeResolutionDAO:", disputeAddress);

  const AttestationRegistry = await ethers.getContractFactory("AttestationRegistry");
  const attestationRegistry = await AttestationRegistry.deploy();
  await attestationRegistry.waitForDeployment();
  const attestationAddress = await attestationRegistry.getAddress();
  console.log("AttestationRegistry:", attestationAddress);

  const PassportFacade = await ethers.getContractFactory("PassportFacade");
  const facade = await PassportFacade.deploy(
    passportAddress,
    repOracleAddress,
    endorsementAddress,
    disputeAddress,
    attestationAddress
  );
  await facade.waitForDeployment();
  const facadeAddress = await facade.getAddress();
  console.log("PassportFacade:", facadeAddress);

  await passport.grantRole(await passport.MINTER_ROLE(), facadeAddress);
  await passport.grantRole(await passport.ISSUER_ROLE(), facadeAddress);
  console.log("Granted MINTER_ROLE + ISSUER_ROLE to PassportFacade");

  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contracts on block explorer...");
    await hre.run("verify:verify", { address: passportAddress, constructorArguments: [] });
    await hre.run("verify:verify", { address: repOracleAddress, constructorArguments: [] });
    await hre.run("verify:verify", { address: endorsementAddress, constructorArguments: [] });
    await hre.run("verify:verify", { address: disputeAddress, constructorArguments: [] });
    await hre.run("verify:verify", { address: attestationAddress, constructorArguments: [] });
    await hre.run("verify:verify", {
      address: facadeAddress,
      constructorArguments: [passportAddress, repOracleAddress, endorsementAddress, disputeAddress, attestationAddress],
    });
  }

  console.log("\n=== Deployment Summary ===");
  console.log(`Network:             ${l2Config ? l2Config[1].name : networkName}`);
  console.log(`Chain ID:            ${chainId}`);
  console.log(`Deployer:            ${deployer.address}`);
  console.log(`PassportSBT:         ${passportAddress}`);
  console.log(`ReputationOracle:    ${repOracleAddress}`);
  console.log(`EndorsementRegistry: ${endorsementAddress}`);
  console.log(`DisputeResolutionDAO:${disputeAddress}`);
  console.log(`AttestationRegistry: ${attestationAddress}`);
  console.log(`PassportFacade:      ${facadeAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
