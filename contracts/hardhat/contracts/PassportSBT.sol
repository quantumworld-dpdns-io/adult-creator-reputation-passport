// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

contract PassportSBT is ERC721URIStorage, AccessControl, Pausable, ReentrancyGuard, IERC5192 {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant REVOKER_ROLE = keccak256("REVOKER_ROLE");

    uint256 private _nextTokenId;
    mapping(uint256 => bool) private _lockedTokens;
    mapping(uint256 => string) private _credentialTypes;
    mapping(uint256 => string) private _subjectHashes;
    mapping(uint256 => uint256) private _issuedAt;
    mapping(uint256 => uint256) private _expiresAt;
    mapping(string => uint256[]) private _subjectCredentials;
    mapping(address => bool) private _approvedIssuers;

    string private _contractURI;

    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed issuer,
        string subjectHash,
        string credentialType,
        uint256 issuedAt,
        uint256 expiresAt
    );

    event CredentialRevoked(
        uint256 indexed tokenId,
        address indexed revoker,
        string reason
    );

    event CredentialExpired(uint256 indexed tokenId);

    constructor() ERC721("Adult Creator Passport", "ACP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(REVOKER_ROLE, msg.sender);
        _contractURI = "https://api.reputation-passport.io/metadata/contract";
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return interfaceId == type(IERC5192).interfaceId
            || super.supportsInterface(interfaceId);
    }

    function safeMint(
        address to,
        string memory subjectHash,
        string memory credentialType,
        string memory uri,
        uint256 expiresAt
    )
        external
        onlyRole(MINTER_ROLE)
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _lockedTokens[tokenId] = true;
        _credentialTypes[tokenId] = credentialType;
        _subjectHashes[tokenId] = subjectHash;
        _issuedAt[tokenId] = block.timestamp;
        _expiresAt[tokenId] = expiresAt;
        _subjectCredentials[subjectHash].push(tokenId);

        emit Locked(tokenId);
        emit CredentialIssued(
            tokenId,
            msg.sender,
            subjectHash,
            credentialType,
            block.timestamp,
            expiresAt
        );

        return tokenId;
    }

    function revoke(uint256 tokenId, string memory reason)
        external
        onlyRole(REVOKER_ROLE)
        nonReentrant
    {
        require(_exists(tokenId), "Token does not exist");
        require(_lockedTokens[tokenId], "Token is not locked");

        _burn(tokenId);
        _lockedTokens[tokenId] = false;

        emit Unlocked(tokenId);
        emit CredentialRevoked(tokenId, msg.sender, reason);
    }

    function burn(uint256 tokenId) external nonReentrant {
        require(
            ownerOf(tokenId) == msg.sender || hasRole(REVOKER_ROLE, msg.sender),
            "Not owner or revoker"
        );
        _burn(tokenId);
        _lockedTokens[tokenId] = false;
        emit Unlocked(tokenId);
    }

    function locked(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _lockedTokens[tokenId];
    }

    function getCredentialInfo(uint256 tokenId)
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
        require(_exists(tokenId), "Token does not exist");
        return (
            _subjectHashes[tokenId],
            _credentialTypes[tokenId],
            _issuedAt[tokenId],
            _expiresAt[tokenId],
            _lockedTokens[tokenId],
            ownerOf(tokenId)
        );
    }

    function getCredentialsBySubject(string memory subjectHash)
        external
        view
        returns (uint256[] memory)
    {
        return _subjectCredentials[subjectHash];
    }

    function isExpired(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _expiresAt[tokenId] > 0 && block.timestamp > _expiresAt[tokenId];
    }

    function setContractURI(string memory uri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _contractURI = uri;
    }

    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override {
        super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            require(!_lockedTokens[tokenId], "Soulbound: token is locked");
        }
    }

    function _exists(uint256 tokenId) private view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
