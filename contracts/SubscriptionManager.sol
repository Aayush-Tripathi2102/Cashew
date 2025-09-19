// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRegistry {
    struct Plan {
        address creator;     // service provider (e.g., YouTube)
        address token;       // stablecoin address (e.g., USDC)
        uint256 amount;      // subscription fee
        uint32 interval;     // billing cycle in seconds
        string metadata;     // optional metadata
        bool active;         // plan active or not
    }

    function getPlan(uint256 planId) external view returns (Plan memory);
}

contract SubscriptionManager {
    struct Subscription {
        uint256 planId;
        uint256 capRemaining;
        uint256 nextBilling;
        bool active;
    }

    IRegistry public registry;

    // user => planId => subscription
    mapping(address => mapping(uint256 => Subscription)) public subscriptions;

    event Subscribed(address indexed user, uint256 planId, uint256 capAmount, uint256 nextBilling);
    event Renewed(address indexed user, uint256 planId, uint256 nextBilling);
    event Cancelled(address indexed user, uint256 planId);

    constructor(address registryAddr) {
        registry = IRegistry(registryAddr);
    }

    /// @notice Subscribe to a plan with a spending cap
    function subscribe(uint256 planId, uint256 capAmount) external {
        IRegistry.Plan memory plan = registry.getPlan(planId);
        require(plan.active, "Plan inactive");
        require(capAmount >= plan.amount, "Cap too small");

        Subscription storage sub = subscriptions[msg.sender][planId];
        require(!sub.active, "Already subscribed");

        // Pull first payment
        IERC20 token = IERC20(plan.token);
        require(token.transferFrom(msg.sender, plan.creator, plan.amount), "Payment failed");

        // Record subscription
        sub.planId = planId;
        sub.capRemaining = capAmount - plan.amount;
        sub.nextBilling = block.timestamp + plan.interval;
        sub.active = true;

        emit Subscribed(msg.sender, planId, capAmount, sub.nextBilling);
    }

    /// @notice Renew subscription (can be called by relayer)
    function renewSubscription(address user, uint256 planId) external {
        Subscription storage sub = subscriptions[user][planId];
        require(sub.active, "No active subscription");
        require(block.timestamp >= sub.nextBilling, "Too early to renew");

        IRegistry.Plan memory plan = registry.getPlan(planId);
        require(plan.active, "Plan inactive");

        require(sub.capRemaining >= plan.amount, "Cap exceeded, cancel subscription");

        // Pull payment
        IERC20 token = IERC20(plan.token);
        require(token.transferFrom(user, plan.creator, plan.amount), "Payment failed");

        // Update subscription
        sub.capRemaining -= plan.amount;
        sub.nextBilling = block.timestamp + plan.interval;

        emit Renewed(user, planId, sub.nextBilling);
    }

    /// @notice Cancel subscription manually
    function cancel(uint256 planId) external {
        Subscription storage sub = subscriptions[msg.sender][planId];
        require(sub.active, "Not subscribed");

        sub.active = false;

        emit Cancelled(msg.sender, planId);
    }

    /// @notice View subscription info
    function getSubscription(address user, uint256 planId) external view returns (Subscription memory) {
        return subscriptions[user][planId];
    }
}
