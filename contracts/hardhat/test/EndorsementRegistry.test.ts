import { expect } from "chai";
import { ethers } from "hardhat";
import { EndorsementRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EndorsementRegistry", function () {
  let registry: EndorsementRegistry;
  let admin: SignerWithAddress;
  let endorser: SignerWithAddress;

  beforeEach(async function () {
    [admin, endorser] = await ethers.getSigners();
    const EndorsementRegistry = await ethers.getContractFactory("EndorsementRegistry");
    registry = await EndorsementRegistry.deploy();
    await registry.waitForDeployment();
    await registry.grantRole(await registry.ENDORSER_ROLE(), endorser.address);
  });

  it("should add endorsement", async function () {
    const tx = await registry.connect(endorser).addEndorsement(
      "subject1", 75, "professionalism", "Great work ethic"
    );
    await tx.wait();

    const endorsements = await registry.getSubjectEndorsements("subject1");
    expect(endorsements.length).to.equal(1);
    expect(endorsements[0].weight).to.equal(75);
    expect(endorsements[0].category).to.equal("professionalism");
  });

  it("should accumulate total weight", async function () {
    await registry.connect(endorser).addEndorsement("s1", 50, "a", "");
    await registry.connect(endorser).addEndorsement("s1", 30, "b", "");
    expect(await registry.getTotalWeight("s1")).to.equal(80);
  });

  it("should reject invalid weight", async function () {
    await expect(
      registry.connect(endorser).addEndorsement("s1", 101, "a", "")
    ).to.be.revertedWith("Weight must be 1-100");
  });
});
