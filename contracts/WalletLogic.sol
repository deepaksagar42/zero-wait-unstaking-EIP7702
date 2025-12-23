// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISimpleStaking {
    function unstake() external;
    function unlockTime(address user) external view returns (uint256);
}

contract WalletLogic {
    function executeUnstake(address staking) external {
        // optional safety check
        require(
            block.timestamp >= ISimpleStaking(staking).unlockTime(address(this)),
            "still locked"
        );

        // call unstake atomically
        ISimpleStaking(staking).unstake();
    }
}
