// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract ReputationOracle is AccessControl, Pausable {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct ReputationData {
        uint256 overallScore;
        uint256 reliabilityScore;
        uint256 professionalismScore;
        uint256 communityTrustScore;
        uint256 totalEndorsements;
        uint256 totalReviews;
        uint256 lastUpdated;
        bytes32 proofHash;
    }

    mapping(string => ReputationData) private _reputations;
    mapping(string => uint256[]) private _historyTimestamps;
    mapping(uint256 => string) private _historyValues;

    event ReputationUpdated(
        string indexed subjectHash,
        uint256 overallScore,
        uint256 lastUpdated,
        bytes32 proofHash
    );

    event ReputationSlashed(
        string indexed subjectHash,
        uint256 amount,
        string reason
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function updateReputation(
        string memory subjectHash,
        uint256 overallScore,
        uint256 reliabilityScore,
        uint256 professionalismScore,
        uint256 communityTrustScore,
        uint256 totalEndorsements,
        uint256 totalReviews,
        bytes32 proofHash
    )
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        ReputationData storage rep = _reputations[subjectHash];
        rep.overallScore = overallScore;
        rep.reliabilityScore = reliabilityScore;
        rep.professionalismScore = professionalismScore;
        rep.communityTrustScore = communityTrustScore;
        rep.totalEndorsements = totalEndorsements;
        rep.totalReviews = totalReviews;
        rep.lastUpdated = block.timestamp;
        rep.proofHash = proofHash;

        emit ReputationUpdated(
            subjectHash,
            overallScore,
            block.timestamp,
            proofHash
        );
    }

    function slashReputation(
        string memory subjectHash,
        uint256 amount,
        string memory reason
    )
        external
        onlyRole(ADMIN_ROLE)
        whenNotPaused
    {
        ReputationData storage rep = _reputations[subjectHash];
        if (rep.overallScore >= amount) {
            rep.overallScore -= amount;
        } else {
            rep.overallScore = 0;
        }
        rep.lastUpdated = block.timestamp;

        emit ReputationSlashed(subjectHash, amount, reason);
        emit ReputationUpdated(
            subjectHash,
            rep.overallScore,
            block.timestamp,
            rep.proofHash
        );
    }

    function getReputation(string memory subjectHash)
        external
        view
        returns (ReputationData memory)
    {
        return _reputations[subjectHash];
    }

    function getReputationScore(string memory subjectHash)
        external
        view
        returns (uint256)
    {
        return _reputations[subjectHash].overallScore;
    }

    function verifyReputationProof(
        string memory subjectHash,
        bytes32 proofHash
    )
        external
        view
        returns (bool)
    {
        return _reputations[subjectHash].proofHash == proofHash;
    }
}
