import { expect } from "chai";
import { ethers } from "hardhat";
import { PassportSBT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PassportSBT", function () {
  let passport: PassportSBT;
  let owner: SignerWithAddress;
  let issuer: SignerWithAddress;
  let user: SignerWithAddress;
  let revoker: SignerWithAddress;

  beforeEach(async function () {
    [owner, issuer, user, revoker] = await ethers.getSigners();
    const PassportSBT = await ethers.getContractFactory("PassportSBT");
    passport = await PassportSBT.deploy();
    await passport.waitForDeployment();
    await passport.grantRole(await passport.MINTER_ROLE(), issuer.address);
    await passport.grantRole(await passport.REVOKER_ROLE(), revoker.address);
  });

  it("should deploy with correct name and symbol", async function () {
    expect(await passport.name()).to.equal("Adult Creator Passport");
    expect(await passport.symbol()).to.equal("ACP");
  });

  it("should mint a soulbound token", async function () {
    const tx = await passport.connect(issuer).safeMint(
      user.address,
      "hash123",
      "identity",
      "https://api.example.com/metadata/0",
      0
    );
    await tx.wait();

    expect(await passport.ownerOf(0)).to.equal(user.address);
    expect(await passport.locked(0)).to.be.true;

    const info = await passport.getCredentialInfo(0);
    expect(info.subjectHash).to.equal("hash123");
    expect(info.credentialType).to.equal("identity");
    expect(info.isLocked).to.be.true;
  });

  it("should prevent transfer of locked token", async function () {
    await passport.connect(issuer).safeMint(user.address, "hash1", "test", "uri", 0);
    await expect(
      passport.connect(user).transferFrom(user.address, owner.address, 0)
    ).to.be.revertedWith("Soulbound: token is locked");
  });

  it("should allow revoker to revoke a token", async function () {
    await passport.connect(issuer).safeMint(user.address, "hash1", "test", "uri", 0);
    await passport.connect(revoker).revoke(0, "Violation of terms");
    await expect(passport.ownerOf(0)).to.be.reverted;
  });

  it("should allow owner to burn their token", async function () {
    await passport.connect(issuer).safeMint(user.address, "hash1", "test", "uri", 0);
    await passport.connect(user).burn(0);
    await expect(passport.ownerOf(0)).to.be.reverted;
  });

  it("should detect expired tokens", async function () {
    const oneDay = 86400;
    const expiresAt = BigInt(Math.floor(Date.now() / 1000) - oneDay);
    await passport.connect(issuer).safeMint(
      user.address, "hash1", "test", "uri", expiresAt
    );
    expect(await passport.isExpired(0)).to.be.true;
  });

  it("should enforce role-based minting", async function () {
    await expect(
      passport.connect(user).safeMint(user.address, "h", "t", "u", 0)
    ).to.be.reverted;
  });

  it("should support IERC5192 interface", async function () {
    const iface = "0xb45a3c0e";
    expect(await passport.supportsInterface(iface)).to.be.true;
  });

  it("should pause and unpause", async function () {
    await passport.pause();
    await expect(
      passport.connect(issuer).safeMint(user.address, "h", "t", "u", 0)
    ).to.be.reverted;
    await passport.unpause();
    await passport.connect(issuer).safeMint(user.address, "h", "t", "u", 0);
    expect(await passport.ownerOf(0)).to.equal(user.address);
  });

  it("should get credentials by subject hash", async function () {
    await passport.connect(issuer).safeMint(user.address, "sub1", "type1", "uri1", 0);
    await passport.connect(issuer).safeMint(user.address, "sub1", "type2", "uri2", 0);
    const ids = await passport.getCredentialsBySubject("sub1");
    expect(ids.length).to.equal(2);
  });
});
