import { ethers } from "ethers";
import fs from "fs";
import path from "path";

export enum DisputeStatus {
  Filed = 0,
  Evidence = 1,
  Deliberation = 2,
  Resolved = 3,
  Dismissed = 4,
}

export enum Resolution {
  None = 0,
  Uphold = 1,
  Reject = 2,
  Partial = 3,
}

export interface ReputationData {
  overallScore: bigint;
  reliabilityScore: bigint;
  professionalismScore: bigint;
  communityTrustScore: bigint;
  totalEndorsements: bigint;
  totalReviews: bigint;
  lastUpdated: bigint;
  proofHash: string;
}

export interface CredentialInfo {
  subjectHash: string;
  credentialType: string;
  issuedAt: bigint;
  expiresAt: bigint;
  isLocked: boolean;
  owner: string;
}

function loadArtifact(name: string): any {
  const artifactPath = path.join(
    __dirname, "..", "..", "..", "..",
    "contracts", "hardhat", "artifacts",
    "hardhat", "contracts", `${name}.sol`,
    `${name}.json`,
  );
  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

export class PassportClient {
  public provider: ethers.Provider;
  public signer?: ethers.Signer;

  public facade?: ethers.Contract;
  public passport?: ethers.Contract;
  public reputation?: ethers.Contract;
  public endorsement?: ethers.Contract;
  public dispute?: ethers.Contract;
  public attestation?: ethers.Contract;

  constructor(
    rpcUrl: string,
    privateKey?: string,
    facadeAddress?: string,
    passportAddress?: string,
    reputationAddress?: string,
    endorsementAddress?: string,
    disputeAddress?: string,
    attestationAddress?: string,
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    }

    if (facadeAddress) this.facade = new ethers.Contract(facadeAddress, loadArtifact("PassportFacade").abi, this.signer || this.provider);
    if (passportAddress) this.passport = new ethers.Contract(passportAddress, loadArtifact("PassportSBT").abi, this.signer || this.provider);
    if (reputationAddress) this.reputation = new ethers.Contract(reputationAddress, loadArtifact("ReputationOracle").abi, this.signer || this.provider);
    if (endorsementAddress) this.endorsement = new ethers.Contract(endorsementAddress, loadArtifact("EndorsementRegistry").abi, this.signer || this.provider);
    if (disputeAddress) this.dispute = new ethers.Contract(disputeAddress, loadArtifact("DisputeResolutionDAO").abi, this.signer || this.provider);
    if (attestationAddress) this.attestation = new ethers.Contract(attestationAddress, loadArtifact("AttestationRegistry").abi, this.signer || this.provider);
  }

  async issuePassport(
    to: string,
    subjectHash: string,
    credentialType: string,
    uri: string,
    expiresAt: bigint,
  ): Promise<string> {
    const tx = await this.facade!.issuePassport(to, subjectHash, credentialType, uri, expiresAt);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getPassportInfo(tokenId: bigint): Promise<CredentialInfo> {
    const result = await this.facade!.getPassportInfo(tokenId);
    return {
      subjectHash: result[0],
      credentialType: result[1],
      issuedAt: result[2],
      expiresAt: result[3],
      isLocked: result[4],
      owner: result[5],
    };
  }

  async getReputation(subjectHash: string): Promise<ReputationData> {
    const result = await this.reputation!.getReputation(subjectHash);
    return {
      overallScore: result[0],
      reliabilityScore: result[1],
      professionalismScore: result[2],
      communityTrustScore: result[3],
      totalEndorsements: result[4],
      totalReviews: result[5],
      lastUpdated: result[6],
      proofHash: result[7],
    };
  }

  async addEndorsement(
    subjectHash: string,
    weight: number,
    category: string,
    comment: string,
  ): Promise<string> {
    const tx = await this.endorsement!.addEndorsement(subjectHash, weight, category, comment);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async fileDispute(
    defendant: string,
    subjectHash: string,
    description: string,
  ): Promise<string> {
    const tx = await this.facade!.fileDispute(defendant, subjectHash, description);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async submitEvidence(
    disputeId: number,
    uri: string,
    description: string,
  ): Promise<string> {
    const tx = await this.dispute!.submitEvidence(disputeId, uri, description);
    const receipt = await tx.wait();
    return receipt.hash;
  }
}
