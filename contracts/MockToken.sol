// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28; // Minimum compiler version — 0.8.28

/// @title MockToken — a minimal ERC20 token for testing purposes
/// @notice Mimics standard ERC20 behaviour without any third-party libraries
contract MockToken {
    string public name = "Mock USD";   // Full human-readable name of the token
    string public symbol = "mUSD";    // Short ticker symbol
    uint8 public decimals = 18;       // Number of decimal places (same as ETH)

    uint256 public totalSupply; // Total number of tokens that exist

    // Mapping: owner address -> token balance
    mapping(address => uint256) public balanceOf;

    // Mapping: owner address -> (spender address -> approved amount)
    // Lets an owner authorise another address to spend tokens on their behalf
    mapping(address => mapping(address => uint256)) public allowance;

    // Emitted on every token transfer
    // from == address(0) indicates a mint (new tokens created)
    event Transfer(address indexed from, address indexed to, uint256 amount);

    // Emitted when an owner approves a spender to use their tokens
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    /// @notice Called once at deployment; mints the entire supply to the deployer
    /// @param initialSupply Total token supply to create
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply;               // Record the total supply
        balanceOf[msg.sender] = initialSupply;     // Credit deployer with all tokens

        emit Transfer(address(0), msg.sender, initialSupply); // Log the mint event
    }

    /// @notice Transfer tokens from the caller to another address
    /// @param to Recipient address
    /// @param amount Number of tokens to send
    function transfer(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Invalid receiver");               // Cannot send to the zero address
        require(balanceOf[msg.sender] >= amount, "Insufficient balance"); // Caller must have enough tokens

        balanceOf[msg.sender] -= amount; // Deduct from sender
        balanceOf[to] += amount;         // Credit recipient

        emit Transfer(msg.sender, to, amount); // Log the transfer

        return true; // ERC20 standard requires returning bool
    }

    /// @notice Approve a spender to transfer up to `amount` tokens on the caller's behalf
    /// @param spender Address being granted the allowance
    /// @param amount Maximum number of tokens the spender may transfer
    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "Invalid spender"); // Cannot approve the zero address

        allowance[msg.sender][spender] = amount; // Set the spending limit

        emit Approval(msg.sender, spender, amount); // Log the approval

        return true; // ERC20 standard requires returning bool
    }

    /// @notice Transfer tokens on behalf of another address (requires prior approve)
    /// @param from Address to deduct tokens from
    /// @param to Recipient address
    /// @param amount Number of tokens to transfer
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(from != address(0), "Invalid sender");                         // from cannot be the zero address
        require(to != address(0), "Invalid receiver");                         // to cannot be the zero address
        require(balanceOf[from] >= amount, "Insufficient balance");            // from must have enough tokens
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance"); // caller must be approved for at least amount

        allowance[from][msg.sender] -= amount; // Consume the allowance

        balanceOf[from] -= amount; // Deduct from source address
        balanceOf[to] += amount;   // Credit recipient

        emit Transfer(from, to, amount); // Log the transfer

        return true; // ERC20 standard requires returning bool
    }
}