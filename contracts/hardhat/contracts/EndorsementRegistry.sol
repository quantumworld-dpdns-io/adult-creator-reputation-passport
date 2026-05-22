// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract EndorsementRegistry is AccessControl, Pausable {
    bytes32 public constant ENDORSER_ROLE = keccak256("ENDORSER_ROLE");

    struct Endorsement {
        address endorser;
        string subjectHash;
        uint256 weight;
        string category;
        string comment;
        uint256 timestamp;
    }

    uint256 private _nextEndorsementId;
    mapping(uint256 => Endorsement) private _endorsements;
    mapping(string => uint256[]) private _subjectEndorsements;
    mapping(address => mapping(string => uint256)) private _endorserWeight;
    mapping(string => uint256) private _totalWeight;

    event EndorsementAdded(
        uint256 indexed endorsementId,
        address indexed endorser,
        string indexed subjectHash,
        uint256 weight,
        string category
    );

    event EndorsementWeightAdjusted(
        address indexed endorser,
        string indexed subjectHash,
        uint256 newWeight
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ENDORSER_ROLE, msg.sender);
    }

    function addEndorsement(
        string memory subjectHash,
        uint256 weight,
        string memory category,
        string memory comment
    )
        external
        onlyRole(ENDORSER_ROLE)
        whenNotPaused
        returns (uint256)
    {
        require(weight > 0 && weight <= 100, "Weight must be 1-100");
        uint256 endorsementId = _nextEndorsementId++;

        _endorsements[endorsementId] = Endorsement({
            endorser: msg.sender,
            subjectHash: subjectHash,
            weight: weight,
            category: category,
            comment: comment,
            timestamp: block.timestamp
        });

        _subjectEndorsements[subjectHash].push(endorsementId);
        _totalWeight[subjectHash] += weight;

        emit EndorsementAdded(endorsementId, msg.sender, subjectHash, weight, category);
        return endorsementId;
    }

    function getEndorsement(uint256 endorsementId)
        external
        view
        returns (Endorsement memory)
    {
        require(endorsementId < _nextEndorsementId, "Endorsement does not exist");
        return _endorsements[endorsementId];
    }

    function getSubjectEndorsements(string memory subjectHash)
        external
        view
        returns (Endorsement[] memory)
    {
        uint256[] storage ids = _subjectEndorsements[subjectHash];
        Endorsement[] memory result = new Endorsement[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _endorsements[ids[i]];
        }
        return result;
    }

    function getEndorsementCount(string memory subjectHash)
        external
        view
        returns (uint256)
    {
        return _subjectEndorsements[subjectHash].length;
    }

    function getTotalWeight(string memory subjectHash)
        external
        view
        returns (uint256)
    {
        return _totalWeight[subjectHash];
    }
}
