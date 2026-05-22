// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./PassportSBT.sol";
import "./ReputationOracle.sol";
import "./EndorsementRegistry.sol";
import "./DisputeResolutionDAO.sol";
import "./AttestationRegistry.sol";

contract PassportFacade is AccessControl, Pausable {
    PassportSBT public passport;
    ReputationOracle public reputation;
    EndorsementRegistry public endorsements;
    DisputeResolutionDAO public disputes;
    AttestationRegistry public attestations;

    bytes32 public constant FACADE_ADMIN_ROLE = keccak256("FACADE_ADMIN_ROLE");

    event PassportCreated(
        address indexed owner,
        string subjectHash,
        uint256 tokenId
    );

    constructor(
        address _passport,
        address _reputation,
        address _endorsements,
        address _disputes,
        address _attestations
    ) {
        passport = PassportSBT(_passport);
        reputation = ReputationOracle(_reputation);
        endorsements = EndorsementRegistry(_endorsements);
        disputes = DisputeResolutionDAO(_disputes);
        attestations = AttestationRegistry(_attestations);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FACADE_ADMIN_ROLE, msg.sender);
    }

    function issuePassport(
        address to,
        string memory subjectHash,
        string memory credentialType,
        string memory uri,
        uint256 expiresAt
    ) external onlyRole(FACADE_ADMIN_ROLE) returns (uint256) {
        return passport.safeMint(to, subjectHash, credentialType, uri, expiresAt);
    }

    function getPassportInfo(uint256 tokenId)
        external
        view
        returns (
            string memory subjectHash,
            string memory credentialType,
            uint256 issuedAt,
            uint256 expiresAt,
            bool isLocked,
            address owner
        )
    {
        return passport.getCredentialInfo(tokenId);
    }

    function getSubjectProfile(string memory subjectHash)
        external
        view
        returns (
            ReputationOracle.ReputationData memory repData,
            uint256 endorsementCount,
            uint256 totalEndorsementWeight,
            bytes32[] memory attestationIds
        )
    {
        repData = reputation.getReputation(subjectHash);
        endorsementCount = endorsements.getEndorsementCount(subjectHash);
        totalEndorsementWeight = endorsements.getTotalWeight(subjectHash);
        attestationIds = attestations.getSubjectAttestations(subjectHash);
    }

    function fileDispute(
        address defendant,
        string memory subjectHash,
        string memory description
    ) external whenNotPaused returns (uint256) {
        return disputes.fileDispute(defendant, subjectHash, description);
    }
}
