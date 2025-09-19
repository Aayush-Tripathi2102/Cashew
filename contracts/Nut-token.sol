// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestToken
 * @dev A simple ERC20 token designed for testing and development environments.
 * It mints a large supply of tokens to the contract deployer upon creation.
 * This contract is not intended for mainnet use.
 */
contract Nut is ERC20 {
    /**
     * @dev Constructor that mints a large supply of tokens to the deployer.
     * @param name The name of the token.
     * @param symbol The symbol of the token.
     * @param initialSupply The amount of tokens to mint to the deployer.
     * We'll use a high number for convenience.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}

