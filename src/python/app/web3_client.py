"""
Web3 smart contract client for Adult Creator Reputation Passport.

Provides Python-based interaction with PassportSBT, ReputationOracle,
EndorsementRegistry, DisputeResolutionDAO, and AttestationRegistry contracts.
"""

import os
import json
from typing import Optional, Any
from dataclasses import dataclass
from enum import IntEnum

from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account import Account
from eth_typing import Address, HexStr


class DisputeStatus(IntEnum):
    FILED = 0
    EVIDENCE = 1
    DELIBERATION = 2
    RESOLVED = 3
    DISMISSED = 4


class Resolution(IntEnum):
    NONE = 0
    UPHOLD = 1
    REJECT = 2
    PARTIAL = 3


@dataclass
class ReputationData:
    overall_score: int
    reliability_score: int
    professionalism_score: int
    community_trust_score: int
    total_endorsements: int
    total_reviews: int
    last_updated: int
    proof_hash: bytes

    @classmethod
    def from_contract(cls, data: tuple) -> "ReputationData":
        return cls(
            overall_score=data[0],
            reliability_score=data[1],
            professionalism_score=data[2],
            community_trust_score=data[3],
            total_endorsements=data[4],
            total_reviews=data[5],
            last_updated=data[6],
            proof_hash=data[7],
        )


@dataclass
class CredentialInfo:
    subject_hash: str
    credential_type: str
    issued_at: int
    expires_at: int
    is_locked: bool
    owner: str

    @classmethod
    def from_contract(cls, data: tuple) -> "CredentialInfo":
        return cls(
            subject_hash=data[0],
            credential_type=data[1],
            issued_at=data[2],
            expires_at=data[3],
            is_locked=data[4],
            owner=data[5],
        )


class PassportClient:
    def __init__(
        self,
        rpc_url: str,
        private_key: Optional[str] = None,
        facade_address: Optional[str] = None,
        passport_address: Optional[str] = None,
        reputation_address: Optional[str] = None,
        endorsement_address: Optional[str] = None,
        dispute_address: Optional[str] = None,
        attestation_address: Optional[str] = None,
        chain_id: Optional[int] = None,
    ):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)

        if private_key:
            self.account = Account.from_key(private_key)
            self.address = self.account.address
        else:
            self.account = None
            self.address = None

        self.chain_id = chain_id or self.w3.eth.chain_id

        self.facade = self._load_contract("PassportFacade", facade_address) if facade_address else None
        self.passport = self._load_contract("PassportSBT", passport_address) if passport_address else None
        self.reputation = self._load_contract("ReputationOracle", reputation_address) if reputation_address else None
        self.endorsement = self._load_contract("EndorsementRegistry", endorsement_address) if endorsement_address else None
        self.dispute = self._load_contract("DisputeResolutionDAO", dispute_address) if dispute_address else None
        self.attestation = self._load_contract("AttestationRegistry", attestation_address) if attestation_address else None

    def _load_contract(self, name: str, address: str) -> Any:
        abi_path = os.path.join(
            os.path.dirname(__file__),
            "..", "..", "..", "..",
            "contracts", "hardhat", "artifacts",
            "hardhat", "contracts", f"{name}.sol",
            f"{name}.json",
        )
        with open(abi_path) as f:
            artifact = json.load(f)
        return self.w3.eth.contract(address=Web3.to_checksum_address(address), abi=artifact["abi"])

    def _build_tx(self, contract: Any, func_name: str, *args, **kwargs) -> dict:
        if not self.account:
            raise ValueError("Private key required for transactions")
        func = getattr(contract.functions, func_name)(*args)
        tx = func.build_transaction({
            "from": self.address,
            "nonce": self.w3.eth.get_transaction_count(self.address),
            "chainId": self.chain_id,
            **kwargs,
        })
        return tx

    def _send_tx(self, tx: dict) -> str:
        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return receipt.transaction_hash.hex()

    def issue_passport(
        self,
        to: str,
        subject_hash: str,
        credential_type: str,
        uri: str,
        expires_at: int,
    ) -> str:
        tx = self._build_tx(self.facade, "issuePassport", to, subject_hash, credential_type, uri, expires_at)
        return self._send_tx(tx)

    def get_passport_info(self, token_id: int) -> CredentialInfo:
        result = self.facade.functions.getPassportInfo(token_id).call()
        return CredentialInfo.from_contract(result)

    def get_reputation(self, subject_hash: str) -> ReputationData:
        result = self.reputation.functions.getReputation(subject_hash).call()
        return ReputationData.from_contract(result)

    def update_reputation(
        self,
        subject_hash: str,
        overall_score: int,
        reliability_score: int,
        professionalism_score: int,
        community_trust_score: int,
        total_endorsements: int,
        total_reviews: int,
        proof_hash: bytes,
    ) -> str:
        tx = self._build_tx(
            self.reputation, "updateReputation",
            subject_hash, overall_score, reliability_score,
            professionalism_score, community_trust_score,
            total_endorsements, total_reviews, proof_hash,
        )
        return self._send_tx(tx)

    def add_endorsement(
        self,
        subject_hash: str,
        weight: int,
        category: str,
        comment: str,
    ) -> str:
        tx = self._build_tx(self.endorsement, "addEndorsement", subject_hash, weight, category, comment)
        return self._send_tx(tx)

    def file_dispute(
        self,
        defendant: str,
        subject_hash: str,
        description: str,
    ) -> str:
        tx = self._build_tx(self.facade, "fileDispute", defendant, subject_hash, description)
        return self._send_tx(tx)

    def submit_evidence(
        self,
        dispute_id: int,
        uri: str,
        description: str,
    ) -> str:
        tx = self._build_tx(self.dispute, "submitEvidence", dispute_id, uri, description)
        return self._send_tx(tx)

    def create_attestation(
        self,
        subject_hash: str,
        schema: str,
        data: bytes,
        expiration_time: int,
    ) -> str:
        tx = self._build_tx(self.attestation, "attest", subject_hash, schema, data, expiration_time)
        return self._send_tx(tx)
