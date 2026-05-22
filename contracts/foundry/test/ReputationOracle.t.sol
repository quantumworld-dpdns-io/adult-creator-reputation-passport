// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Test.sol";
import "../hardhat/contracts/ReputationOracle.sol";

contract ReputationOracleTest is Test {
    ReputationOracle oracle;

    function setUp() public {
        oracle = new ReputationOracle();
    }

    function testUpdateReputation() public {
        bytes32 proof = keccak256("proof");
        oracle.updateReputation("subject1", 85, 90, 80, 85, 10, 5, proof);
        ReputationOracle.ReputationData memory rep = oracle.getReputation("subject1");
        assertEq(rep.overallScore, 85);
    }

    function testSlashReputation() public {
        bytes32 proof = keccak256("proof");
        oracle.updateReputation("sub", 100, 100, 100, 100, 0, 0, proof);
        oracle.slashReputation("sub", 30, "violation");
        assertEq(oracle.getReputationScore("sub"), 70);
    }

    function testFuzz_ReputationScores(uint8 score) public {
        vm.assume(score <= 100);
        bytes32 proof = keccak256("proof");
        oracle.updateReputation("fuzz", score, score, score, score, 0, 0, proof);
        assertEq(oracle.getReputationScore("fuzz"), score);
    }
}
