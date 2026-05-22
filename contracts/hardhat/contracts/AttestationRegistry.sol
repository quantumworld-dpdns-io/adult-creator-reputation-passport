// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract AttestationRegistry is AccessControl, Pausable, EIP712 {
    bytes32 public constant ATTESTER_ROLE = keccak256("ATTESTER_ROLE");

    struct Attestation {
        bytes32 uid;
        address attester;
        string subjectHash;
        string schema;
        bytes data;
        uint256 expirationTime;
        uint256 revocationTime;
        bool revoked;
    }

    mapping(bytes32 => Attestation) private _attestations;
    mapping(address => bytes32[]) private _attesterAttestations;
    mapping(string => bytes32[]) private _subjectAttestations;
    bytes32[] private _allAttestations;

    event AttestationCreated(
        bytes32 indexed uid,
        address indexed attester,
        string indexed subjectHash,
        string schema,
        uint256 expirationTime
    );

    event AttestationRevoked(
        bytes32 indexed uid,
        address indexed revoker,
        uint256 revocationTime
    );

    constructor() EIP712("AttestationRegistry", "1.0.0") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ATTESTER_ROLE, msg.sender);
    }

    function attest(
        string memory subjectHash,
        string memory schema,
        bytes memory data,
        uint256 expirationTime
    )
        external
        onlyRole(ATTESTER_ROLE)
        whenNotPaused
        returns (bytes32)
    {
        bytes32 uid = keccak256(
            abi.encodePacked(
                msg.sender,
                subjectHash,
                schema,
                data,
                block.timestamp,
                block.number
            )
        );

        _attestations[uid] = Attestation({
            uid: uid,
            attester: msg.sender,
            subjectHash: subjectHash,
            schema: schema,
            data: data,
            expirationTime: expirationTime,
            revocationTime: 0,
            revoked: false
        });

        _attesterAttestations[msg.sender].push(uid);
        _subjectAttestations[subjectHash].push(uid);
        _allAttestations.push(uid);

        emit AttestationCreated(uid, msg.sender, subjectHash, schema, expirationTime);
        return uid;
    }

    function revoke(bytes32 uid) external whenNotPaused {
        Attestation storage a = _attestations[uid];
        require(a.attester == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        require(!a.revoked, "Already revoked");

        a.revoked = true;
        a.revocationTime = block.timestamp;

        emit AttestationRevoked(uid, msg.sender, block.timestamp);
    }

    function getAttestation(bytes32 uid) external view returns (Attestation memory) {
        return _attestations[uid];
    }

    function verifyAttestation(bytes32 uid, string memory subjectHash)
        external
        view
        returns (bool)
    {
        Attestation storage a = _attestations[uid];
        if (a.revoked) return false;
        if (a.expirationTime > 0 && block.timestamp > a.expirationTime) return false;
        if (keccak256(bytes(a.subjectHash)) != keccak256(bytes(subjectHash))) return false;
        return true;
    }

    function getSubjectAttestations(string memory subjectHash)
        external
        view
        returns (bytes32[] memory)
    {
        return _subjectAttestations[subjectHash];
    }

    function getAttestationCount() external view returns (uint256) {
        return _allAttestations.length;
    }
}
