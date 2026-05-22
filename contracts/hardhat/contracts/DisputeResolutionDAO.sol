// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DisputeResolutionDAO is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MEDIATOR_ROLE = keccak256("MEDIATOR_ROLE");
    bytes32 public constant JUROR_ROLE = keccak256("JUROR_ROLE");

    enum DisputeStatus { Filed, Evidence, Deliberation, Resolved, Dismissed }
    enum Resolution { None, Uphold, Reject, Partial }

    struct Dispute {
        uint256 id;
        address plaintiff;
        address defendant;
        string subjectHash;
        string description;
        DisputeStatus status;
        Resolution resolution;
        string resolutionNotes;
        uint256 createdAt;
        uint256 resolvedAt;
        address mediator;
    }

    struct Evidence {
        address submitter;
        string uri;
        string description;
        uint256 timestamp;
    }

    struct Vote {
        address juror;
        Resolution vote;
        string rationale;
        uint256 timestamp;
    }

    uint256 private _nextDisputeId;
    mapping(uint256 => Dispute) private _disputes;
    mapping(uint256 => Evidence[]) private _evidence;
    mapping(uint256 => Vote[]) private _votes;
    mapping(uint256 => mapping(address => bool)) private _hasVoted;
    uint256 private _votingPeriod = 7 days;

    event DisputeFiled(uint256 indexed disputeId, address indexed plaintiff, string subjectHash);
    event EvidenceSubmitted(uint256 indexed disputeId, address indexed submitter, string uri);
    event VoteCast(uint256 indexed disputeId, address indexed juror, Resolution vote);
    event DisputeResolved(uint256 indexed disputeId, Resolution resolution, string notes);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MEDIATOR_ROLE, msg.sender);
        _grantRole(JUROR_ROLE, msg.sender);
    }

    function fileDispute(
        address defendant,
        string memory subjectHash,
        string memory description
    )
        external
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        uint256 disputeId = _nextDisputeId++;
        _disputes[disputeId] = Dispute({
            id: disputeId,
            plaintiff: msg.sender,
            defendant: defendant,
            subjectHash: subjectHash,
            description: description,
            status: DisputeStatus.Filed,
            resolution: Resolution.None,
            resolutionNotes: "",
            createdAt: block.timestamp,
            resolvedAt: 0,
            mediator: address(0)
        });

        emit DisputeFiled(disputeId, msg.sender, subjectHash);
        return disputeId;
    }

    function submitEvidence(uint256 disputeId, string memory uri, string memory description)
        external
        whenNotPaused
    {
        Dispute storage d = _disputes[disputeId];
        require(d.status == DisputeStatus.Filed || d.status == DisputeStatus.Evidence, "Wrong status");
        require(
            msg.sender == d.plaintiff || msg.sender == d.defendant || hasRole(MEDIATOR_ROLE, msg.sender),
            "Not authorized"
        );

        _evidence[disputeId].push(Evidence({
            submitter: msg.sender,
            uri: uri,
            description: description,
            timestamp: block.timestamp
        }));

        if (d.status == DisputeStatus.Filed) {
            d.status = DisputeStatus.Evidence;
        }

        emit EvidenceSubmitted(disputeId, msg.sender, uri);
    }

    function startDeliberation(uint256 disputeId)
        external
        onlyRole(MEDIATOR_ROLE)
        whenNotPaused
    {
        Dispute storage d = _disputes[disputeId];
        require(d.status == DisputeStatus.Evidence, "Not in evidence phase");
        d.status = DisputeStatus.Deliberation;
    }

    function castVote(uint256 disputeId, Resolution vote, string memory rationale)
        external
        onlyRole(JUROR_ROLE)
        whenNotPaused
    {
        Dispute storage d = _disputes[disputeId];
        require(d.status == DisputeStatus.Deliberation, "Not in deliberation");
        require(!_hasVoted[disputeId][msg.sender], "Already voted");
        require(vote != Resolution.None, "Must choose a resolution");

        _hasVoted[disputeId][msg.sender] = true;
        _votes[disputeId].push(Vote({
            juror: msg.sender,
            vote: vote,
            rationale: rationale,
            timestamp: block.timestamp
        }));

        emit VoteCast(disputeId, msg.sender, vote);
    }

    function resolveDispute(uint256 disputeId, Resolution resolution, string memory notes)
        external
        onlyRole(MEDIATOR_ROLE)
        whenNotPaused
        nonReentrant
    {
        Dispute storage d = _disputes[disputeId];
        require(d.status == DisputeStatus.Deliberation, "Not in deliberation");
        require(resolution != Resolution.None, "Must choose a resolution");

        d.status = DisputeStatus.Resolved;
        d.resolution = resolution;
        d.resolutionNotes = notes;
        d.resolvedAt = block.timestamp;

        emit DisputeResolved(disputeId, resolution, notes);
    }

    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        require(disputeId < _nextDisputeId, "Dispute does not exist");
        return _disputes[disputeId];
    }

    function getEvidence(uint256 disputeId) external view returns (Evidence[] memory) {
        return _evidence[disputeId];
    }

    function getVotes(uint256 disputeId) external view returns (Vote[] memory) {
        return _votes[disputeId];
    }

    function setVotingPeriod(uint256 period) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _votingPeriod = period;
    }

    function getVotingPeriod() external view returns (uint256) {
        return _votingPeriod;
    }
}
