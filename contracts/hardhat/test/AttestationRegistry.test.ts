import { expect } from "chai";
import { ethers } from "hardhat";
import { AttestationRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AttestationRegistry", function () {
  let registry: AttestationRegistry;
  let admin: SignerWithAddress;
  let attester: SignerWithAddress;

  beforeEach(async function () {
    [admin, attester] = await ethers.getSigners();
    const AttestationRegistry = await ethers.getContractFactory("AttestationRegistry");
    registry = await AttestationRegistry.deploy();
    await registry.waitForDeployment();
    await registry.grantRole(await registry.ATTESTER_ROLE(), attester.address);
  });

  it("should create attestation", async function () {
    const tx = await registry.connect(attester).attest(
      "subject1",
      "schema1",
      ethers.toUtf8Bytes("data"),
      0
    );
    await tx.wait();

    expect(await registry.getAttestationCount()).to.equal(1);
  });

  it("should revoke attestation", async function () {
    const tx = await registry.connect(attester).attest("s1", "schema", ethers.toUtf8Bytes("d"), 0);
    const receipt = await tx.wait();
    const uid = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "string", "string", "bytes", "uint256"],
        [attester.address, "s1", "schema", ethers.toUtf8Bytes("d"), 0]
      )
    );
    const logs = await tx.wait();
    // actual UID from emit
    await registry.connect(attester).revoke(uid);
    const att = await registry.getAttestation(uid);
    expect(att.revoked).to.be.true;
  });

  it("should verify attestation", async function () {
    const data = ethers.toUtf8Bytes("verified-data");
    const tx = await registry.connect(attester).attest("s1", "schema", data, 0);
    const receipt = await tx.wait();
    const event = receipt.logs.find(
      (log: any) => log.fragment?.name === "AttestationCreated"
    );
    const uid = event?.args?.uid;

    expect(await registry.verifyAttestation(uid, "s1")).to.be.true;
    expect(await registry.verifyAttestation(uid, "wrong")).to.be.false;
  });
});
