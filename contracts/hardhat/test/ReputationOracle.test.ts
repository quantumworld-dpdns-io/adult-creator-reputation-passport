import { expect } from "chai";
import { ethers } from "hardhat";
import { ReputationOracle } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ReputationOracle", function () {
  let oracle: ReputationOracle;
  let admin: SignerWithAddress;
  let nonOracle: SignerWithAddress;

  beforeEach(async function () {
    [admin, nonOracle] = await ethers.getSigners();
    const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
    oracle = await ReputationOracle.deploy();
    await oracle.waitForDeployment();
  });

  it("should update reputation", async function () {
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof"));
    await oracle.updateReputation(
      "subject1", 85, 90, 80, 85, 10, 5, proofHash
    );
    const rep = await oracle.getReputation("subject1");
    expect(rep.overallScore).to.equal(85);
    expect(rep.reliabilityScore).to.equal(90);
    expect(rep.professionalismScore).to.equal(80);
  });

  it("should slash reputation", async function () {
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof"));
    await oracle.updateReputation("subject1", 100, 100, 100, 100, 0, 0, proofHash);
    await oracle.slashReputation("subject1", 30, "Policy violation");
    expect(await oracle.getReputationScore("subject1")).to.equal(70);
  });

  it("should enforce role-based access", async function () {
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof"));
    await expect(
      oracle.connect(nonOracle).updateReputation("s", 1, 1, 1, 1, 0, 0, proofHash)
    ).to.be.reverted;
  });

  it("should verify proof hash", async function () {
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("valid-proof"));
    await oracle.updateReputation("s", 90, 90, 90, 90, 5, 3, proofHash);
    expect(await oracle.verifyReputationProof("s", proofHash)).to.be.true;
    expect(
      await oracle.verifyReputationProof("s", ethers.keccak256(ethers.toUtf8Bytes("fake")))
    ).to.be.false;
  });

  it("should not slash below zero", async function () {
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof"));
    await oracle.updateReputation("s", 10, 10, 10, 10, 0, 0, proofHash);
    await oracle.slashReputation("s", 100, "Massive slash");
    expect(await oracle.getReputationScore("s")).to.equal(0);
  });
});
