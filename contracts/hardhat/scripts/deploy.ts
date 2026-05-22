import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";

async function main(): Promise<void> {
  const network = await ethers.provider.getNetwork();
  console.log("Deploying to network:", network.name, "chainId:", network.chainId);

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const PassportSBT = await ethers.getContractFactory("PassportSBT");
  const passport = await PassportSBT.deploy();
  await passport.waitForDeployment();
  const passportAddress = await passport.getAddress();
  console.log("PassportSBT deployed to:", passportAddress);

  const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
  const reputationOracle = await ReputationOracle.deploy();
  await reputationOracle.waitForDeployment();
  const repOracleAddress = await reputationOracle.getAddress();
  console.log("ReputationOracle deployed to:", repOracleAddress);

  const EndorsementRegistry = await ethers.getContractFactory("EndorsementRegistry");
  const endorsementRegistry = await EndorsementRegistry.deploy();
  await endorsementRegistry.waitForDeployment();
  const endorsementAddress = await endorsementRegistry.getAddress();
  console.log("EndorsementRegistry deployed to:", endorsementAddress);

  const DisputeResolutionDAO = await ethers.getContractFactory("DisputeResolutionDAO");
  const disputeDAO = await DisputeResolutionDAO.deploy();
  await disputeDAO.waitForDeployment();
  const disputeAddress = await disputeDAO.getAddress();
  console.log("DisputeResolutionDAO deployed to:", disputeAddress);

  const AttestationRegistry = await ethers.getContractFactory("AttestationRegistry");
  const attestationRegistry = await AttestationRegistry.deploy();
  await attestationRegistry.waitForDeployment();
  const attestationAddress = await attestationRegistry.getAddress();
  console.log("AttestationRegistry deployed to:", attestationAddress);

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
  console.log("PassportFacade deployed to:", facadeAddress);

  const grantMinterTx = await passport.grantRole(await passport.MINTER_ROLE(), facadeAddress);
  await grantMinterTx.wait();
  console.log("Granted MINTER_ROLE to PassportFacade");

  const grantIssuerTx = await passport.grantRole(await passport.ISSUER_ROLE(), facadeAddress);
  await grantIssuerTx.wait();
  console.log("Granted ISSUER_ROLE to PassportFacade");

  console.log("\n=== Deployment Summary ===");
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
