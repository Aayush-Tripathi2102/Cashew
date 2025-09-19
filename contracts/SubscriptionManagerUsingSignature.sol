// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IRegistry {
    struct Plan {
        address creator;
        address token;
        uint256 amount;
        uint32 interval;
        bool active;
    }
    function getPlan(uint256 planId) external view returns (Plan memory);
}

contract SubscriptionManager {
    using ECDSA for bytes32;

    struct Subscription {
        address subscriber;
        uint256 planId;
        uint256 cap;         // total approved cap
        uint256 spent;       // total already spent
        uint256 nextBilling; // timestamp for next charge
        bool active;
    }

    mapping(address => mapping(uint256 => Subscription)) public subscriptions;

    IRegistry public registry;
    uint256 public relayerReward; // small flat fee in token per renewal

    // EIP-712
    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant SUBSCRIBE_TYPEHASH =
        keccak256("Subscribe(address subscriber,uint256 planId,uint256 cap,uint256 deadline)");

    constructor(address _registry, string memory name, string memory version) {
        registry = IRegistry(_registry);

        uint256 chainId;
        assembly { chainId := chainid() }

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                chainId,
                address(this)
            )
        );

        relayerReward = 1e16; // example: 0.01 token reward
    }

    event Subscribed(address indexed subscriber, uint256 planId, uint256 cap, uint256 nextBilling);
    event Renewed(address indexed subscriber, uint256 planId, uint256 nextBilling);
    event Cancelled(address indexed subscriber, uint256 planId);

    function subscribe(
        address subscriber,
        uint256 planId,
        uint256 cap,
        uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        require(block.timestamp <= deadline, "Signature expired");
        require(subscriptions[subscriber][planId].active == false, "Already subscribed");

        // Verify EIP-712 signature
        bytes32 structHash = keccak256(abi.encode(SUBSCRIBE_TYPEHASH, subscriber, planId, cap, deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address signer = digest.recover(v, r, s);
        require(signer == subscriber, "Invalid signature");

        IRegistry.Plan memory plan = registry.getPlan(planId);
        require(plan.active, "Inactive plan");

        // Take first payment
        IERC20 token = IERC20(plan.token);
        require(token.transferFrom(subscriber, plan.creator, plan.amount), "Payment failed");

        // Init subscription
        subscriptions[subscriber][planId] = Subscription({
            subscriber: subscriber,
            planId: planId,
            cap: cap,
            spent: plan.amount,
            nextBilling: block.timestamp + plan.interval,
            active: true
        });

        emit Subscribed(subscriber, planId, cap, block.timestamp + plan.interval);
    }

    function renewSubscription(uint256 planId, address subscriber) external {
        Subscription storage sub = subscriptions[subscriber][planId];
        require(sub.active, "Not active");
        require(block.timestamp >= sub.nextBilling, "Too early");

        IRegistry.Plan memory plan = registry.getPlan(planId);
        require(plan.active, "Inactive plan");

        uint256 newSpent = sub.spent + plan.amount;
        require(newSpent <= sub.cap, "Cap exceeded");

        IERC20 token = IERC20(plan.token);
        // transfer subscription fee
        require(token.transferFrom(subscriber, plan.creator, plan.amount), "Payment failed");
        // transfer relayer reward
        require(token.transferFrom(subscriber, msg.sender, relayerReward), "Relayer reward failed");

        sub.spent = newSpent;
        sub.nextBilling = block.timestamp + plan.interval;

        emit Renewed(subscriber, planId, sub.nextBilling);
    }

    function cancelSubscription(uint256 planId) external {
        Subscription storage sub = subscriptions[msg.sender][planId];
        require(sub.active, "Not active");
        sub.active = false;
        emit Cancelled(msg.sender, planId);
    }
}
