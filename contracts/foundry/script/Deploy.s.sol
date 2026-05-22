// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Script.sol";
import "../hardhat/contracts/PassportSBT.sol";
import "../hardhat/contracts/ReputationOracle.sol";
import "../hardhat/contracts/EndorsementRegistry.sol";
import "../hardhat/contracts/DisputeResolutionDAO.sol";
import "../hardhat/contracts/AttestationRegistry.sol";
import "../hardhat/contracts/PassportFacade.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        PassportSBT passport = new PassportSBT();
        ReputationOracle reputation = new ReputationOracle();
        EndorsementRegistry endorsements = new EndorsementRegistry();
        DisputeResolutionDAO disputes = new DisputeResolutionDAO();
        AttestationRegistry attestations = new AttestationRegistry();

        PassportFacade facade = new PassportFacade(
            address(passport),
            address(reputation),
            address(endorsements),
            address(disputes),
            address(attestations)
        );

        passport.grantRole(passport.MINTER_ROLE(), address(facade));
        passport.grantRole(passport.ISSUER_ROLE(), address(facade));

        vm.stopBroadcast();

        console.log("PassportSBT:", address(passport));
        console.log("ReputationOracle:", address(reputation));
        console.log("EndorsementRegistry:", address(endorsements));
        console.log("DisputeResolutionDAO:", address(disputes));
        console.log("AttestationRegistry:", address(attestations));
        console.log("PassportFacade:", address(facade));
    }
}
