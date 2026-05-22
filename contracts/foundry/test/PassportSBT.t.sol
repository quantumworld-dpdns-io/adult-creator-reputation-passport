// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Test.sol";
import "../hardhat/contracts/PassportSBT.sol";

contract PassportSBTTest is Test {
    PassportSBT passport;
    address issuer = address(0x1);
    address user = address(0x2);
    address revoker = address(0x3);

    function setUp() public {
        passport = new PassportSBT();
        passport.grantRole(passport.MINTER_ROLE(), issuer);
        passport.grantRole(passport.REVOKER_ROLE(), revoker);
    }

    function testMintSBT() public {
        vm.prank(issuer);
        passport.safeMint(user, "hash123", "identity", "https://uri.com/0", 0);
        assertEq(passport.ownerOf(0), user);
        assertTrue(passport.locked(0));
    }

    function testCannotTransferLocked() public {
        vm.prank(issuer);
        passport.safeMint(user, "hash1", "test", "uri", 0);
        vm.prank(user);
        vm.expectRevert("Soulbound: token is locked");
        passport.transferFrom(user, address(0x4), 0);
    }

    function testRevoke() public {
        vm.prank(issuer);
        passport.safeMint(user, "hash1", "test", "uri", 0);
        vm.prank(revoker);
        passport.revoke(0, "Violation");
        vm.expectRevert();
        passport.ownerOf(0);
    }

    function testBurn() public {
        vm.prank(issuer);
        passport.safeMint(user, "hash1", "test", "uri", 0);
        vm.prank(user);
        passport.burn(0);
        vm.expectRevert();
        passport.ownerOf(0);
    }

    function testFuzz_Mint(uint256 tokenId) public {
        vm.assume(tokenId < 1000);
        for (uint256 i = 0; i < tokenId; i++) {
            vm.prank(issuer);
            passport.safeMint(user, vm.toString(i), "test", "uri", 0);
        }
        assertEq(passport.ownerOf(tokenId - 1), user);
    }

    function testInvariant_LockedAfterMint() public {
        vm.prank(issuer);
        passport.safeMint(user, "invariant", "test", "uri", 0);
        assertTrue(passport.locked(0));
    }
}
