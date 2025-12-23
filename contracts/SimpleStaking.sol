// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract SimpleStaking {
    IERC20 public immutable token;

    uint256 public constant LOCK_DURATION = 3600; // 1 hour

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public unlockTime;

    event Staked(address indexed user, uint256 amount, uint256 unlockTime);
    event Unstaked(address indexed user, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "amount zero");

        token.transferFrom(msg.sender, address(this), amount);

        stakedBalance[msg.sender] += amount;

        // only set unlock time if not already locked
        if (unlockTime[msg.sender] < block.timestamp) {
            unlockTime[msg.sender] = block.timestamp + LOCK_DURATION;
        }

        emit Staked(msg.sender, amount, unlockTime[msg.sender]);
    }

    function unstake() external {
        require(block.timestamp >= unlockTime[msg.sender], "still locked");

        uint256 amount = stakedBalance[msg.sender];
        require(amount > 0, "nothing staked");

        stakedBalance[msg.sender] = 0;
        unlockTime[msg.sender] = 0;

        token.transfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }
}
