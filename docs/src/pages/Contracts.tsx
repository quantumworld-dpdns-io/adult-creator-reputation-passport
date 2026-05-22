import {
  DotMatrixText,
  NothingCard,
  PillBadge,
  BarcodeGenerator,
} from "@dennislee928/nothingx-react-components";

const contracts = [
  {
    name: "PassportSBT",
    description: "ERC-5192 Soulbound Token — non-transferable credential passport",
    features: ["Mint with MINTER_ROLE", "Revoke with REVOKER_ROLE", "Owner burn", "Expiration detection", "Pausable"],
    address: "0x...PassportSBT",
    badge: "ERC-5192",
  },
  {
    name: "ReputationOracle",
    description: "On-chain reputation scoring with cryptographic proof verification",
    features: ["Multi-dimension scoring (5 axes)", "Proof hash verification", "Slash mechanism", "Role-based access"],
    address: "0x...RepOracle",
    badge: "Oracle",
  },
  {
    name: "EndorsementRegistry",
    description: "Weighted endorsement system with category tracking",
    features: ["1-100 weight scale", "Category tagging", "Total weight aggregation", "Per-subject query"],
    address: "0x...Endorse",
    badge: "Social",
  },
  {
    name: "DisputeResolutionDAO",
    description: "Decentralized dispute resolution with evidence and voting",
    features: ["5-phase lifecycle", "Evidence submission", "Juror voting", "Mediator resolution", "Full audit trail"],
    address: "0x...DisputeDAO",
    badge: "DAO",
  },
  {
    name: "AttestationRegistry",
    description: "EIP-712 typed attestations with expiration and revocation",
    features: ["Schema-based attestations", "Expiration support", "Revocation", "EIP-712 signing"],
    address: "0x...Attest",
    badge: "EIP-712",
  },
  {
    name: "PassportFacade",
    description: "Unified facade — single entry point for all passport operations",
    features: ["Issue passport", "Get subject profile", "File dispute", "Role delegation"],
    address: "0x...Facade",
    badge: "Facade",
  },
];

export function ContractsPage() {
  return (
    <div>
      <DotMatrixText>SMART CONTRACTS</DotMatrixText>
      <p style={{ color: "#aaa", fontSize: 13, marginBottom: 32 }}>
        Solidity 0.8.28 · Hardhat · Foundry · ERC-5192 · Layer 2
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {contracts.map((c) => (
          <NothingCard key={c.name}>
            <PillBadge variant="live">{c.badge}</PillBadge>
            <div style={{ fontWeight: "bold", fontSize: 14, margin: "8px 0", color: "#fff" }}>
              {c.name}
            </div>
            <p style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>
              {c.description}
            </p>
            <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, color: "#888" }}>
              {c.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div style={{ marginTop: 8 }}>
              <BarcodeGenerator value={c.address} height={24} />
            </div>
          </NothingCard>
        ))}
      </div>

      <NothingCard style={{ marginTop: 32 }}>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
          Deployed Sizes
        </div>
        <pre style={{
          background: "#111",
          padding: 16,
          borderRadius: 4,
          fontSize: 12,
          color: "#0f0",
        }}>
{`PassportSBT:         8.877 KiB deployed / 10.661 KiB initcode
ReputationOracle:    2.569 KiB / 3.154 KiB
EndorsementRegistry: 3.970 KiB / 4.370 KiB
DisputeResolutionDAO:7.385 KiB / 8.012 KiB
AttestationRegistry: 4.351 KiB / 5.786 KiB
PassportFacade:      3.508 KiB / 4.169 KiB`}
        </pre>
      </NothingCard>

      <NothingCard style={{ marginTop: 16 }}>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
          Test Results
        </div>
        <pre style={{
          background: "#111",
          padding: 16,
          borderRadius: 4,
          fontSize: 12,
          color: "#0f0",
        }}>
{`  AttestationRegistry    ✔ 4 passing
  DisputeResolutionDAO   ✔ 4 passing
  EndorsementRegistry    ✔ 3 passing
  PassportSBT            ✔ 10 passing
  ReputationOracle       ✔ 5 passing

  Total: 26 passing`}
        </pre>
      </NothingCard>
    </div>
  );
}
