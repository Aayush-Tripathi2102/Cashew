// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Registry is Ownable {
    constructor() Ownable(msg.sender) {}
    struct Plan {
        address creator;
        address token;      // stable token (USDC/DAI)
        uint256 amount;     // in token smallest unit
        uint32 interval;    // seconds
        string metadata;    // optional
        bool active;
    }

    Plan[] public plans;

    event PlanCreated(
        uint256 indexed planId,
        address indexed creator,
        address token,
        uint256 amount,
        uint32 interval,
        string metadata
    );

    event PlanDeactivated(uint256 indexed planId);

    function createPlan(
        address token,
        uint256 amount,
        uint32 interval,
        string calldata metadata
    )
        external
        returns (uint256)
    {
        require(token != address(0), "token zero");
        require(amount > 0, "amount zero");
        require(interval >= 60, "interval too small");

        plans.push(Plan({
            creator: msg.sender,
            token: token,
            amount: amount,
            interval: interval,
            metadata: metadata,
            active: true
        }));

        uint256 planId = plans.length - 1;
        emit PlanCreated(planId, msg.sender, token, amount, interval, metadata);
        return planId;
    }

    function getPlan(uint256 planId) external view returns (Plan memory) {
        require(planId < plans.length, "no plan");
        return plans[planId];
    }

    function deactivatePlan(uint256 planId) external {
        require(planId < plans.length, "no plan");
        Plan storage plan = plans[planId];
        require(plan.active, "already inactive");
        require(plan.creator == msg.sender || owner() == msg.sender, "not allowed");

        plan.active = false;
        emit PlanDeactivated(planId);
    }
}
