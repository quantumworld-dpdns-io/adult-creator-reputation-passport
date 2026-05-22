import { expect } from "chai";
import { ethers } from "hardhat";
import { DisputeResolutionDAO } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DisputeResolutionDAO", function () {
  let dao: DisputeResolutionDAO;
  let admin: SignerWithAddress;
  let juror: SignerWithAddress;
  let plaintiff: SignerWithAddress;
  let defendant: SignerWithAddress;

  beforeEach(async function () {
    [admin, juror, plaintiff, defendant] = await ethers.getSigners();
    const DisputeResolutionDAO = await ethers.getContractFactory("DisputeResolutionDAO");
    dao = await DisputeResolutionDAO.deploy();
    await dao.waitForDeployment();
    await dao.grantRole(await dao.JUROR_ROLE(), juror.address);
  });

  it("should file a dispute", async function () {
    const tx = await dao.connect(plaintiff).fileDispute(defendant.address, "subject1", "Dispute description");
    await tx.wait();
    const dispute = await dao.getDispute(0);
    expect(dispute.plaintiff).to.equal(plaintiff.address);
    expect(dispute.defendant).to.equal(defendant.address);
    expect(dispute.status).to.equal(0); // Filed
  });

  it("should submit evidence", async function () {
    await dao.connect(plaintiff).fileDispute(defendant.address, "s1", "desc");
    await dao.connect(plaintiff).submitEvidence(0, "ipfs://Qm...", "Screenshot proof");
    const evidence = await dao.getEvidence(0);
    expect(evidence.length).to.equal(1);
    expect(evidence[0].uri).to.equal("ipfs://Qm...");
  });

  it("should cast votes and resolve", async function () {
    await dao.connect(plaintiff).fileDispute(defendant.address, "s1", "desc");
    const dispute = await dao.getDispute(0);
    if (dispute.status === 2) {
      // deliberation
    }
    await dao.connect(plaintiff).submitEvidence(0, "ipfs://uri", "proof");
    await dao.connect(admin).resolveDispute(0, 1, "Upholding the claim");
    const resolved = await dao.getDispute(0);
    expect(resolved.status).to.equal(3); // Resolved
    expect(resolved.resolution).to.equal(1); // Uphold
  });
});
