// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28; // Minimum compiler version — 0.8.28

/// @title IERC20Like — minimal ERC20 interface
/// @notice Declares only the methods TokenBank needs to interact with the token
interface IERC20Like {
    // Transfer `amount` tokens to address `to`
    function transfer(address to, uint256 amount) external returns (bool);

    // Transfer `amount` tokens from `from` to `to` (requires prior approve from `from`)
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // Returns the token balance of `account`
    function balanceOf(address account) external view returns (uint256);
}

/// @title TokenBank — an ERC20 token vault
/// @notice Allows users to deposit and withdraw tokens
contract TokenBank {
    // Address of the ERC20 token this bank accepts
    // immutable — set once in the constructor, can never be changed afterwards
    IERC20Like public immutable token;

    // Mapping: user address -> how many tokens they have deposited
    mapping(address => uint256) public deposits;

    // Total tokens deposited by all users combined
    uint256 public totalDeposits;

    // Emitted on every successful deposit
    event Deposited(address indexed user, uint256 amount);

    // Emitted on every successful withdrawal
    event Withdrawn(address indexed user, uint256 amount);

    /// @notice Called once at deployment; sets the accepted token
    /// @param tokenAddress Address of the ERC20 token contract
    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token address"); // Reject the zero address
        token = IERC20Like(tokenAddress); // Store a typed reference to the token contract
    }

    /// @notice Deposit tokens into the bank
    /// @param amount Number of tokens to deposit
    /// @dev Caller must call token.approve(bankAddress, amount) before this
    function deposit(uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero"); // Depositing 0 is not allowed

        // Pull tokens from the caller into this contract
        // Only works if the caller has previously called approve
        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed"); // Revert if the token transfer failed

        deposits[msg.sender] += amount; // Record the deposit for the caller
        totalDeposits += amount;        // Update the global deposit counter

        emit Deposited(msg.sender, amount); // Log the deposit event
    }

    /// @notice Withdraw previously deposited tokens
    /// @param amount Number of tokens to withdraw
    function withdraw(uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero");         // Withdrawing 0 is not allowed
        require(deposits[msg.sender] >= amount, "Insufficient deposit"); // Cannot withdraw more than deposited

        deposits[msg.sender] -= amount; // Reduce caller's recorded deposit
        totalDeposits -= amount;        // Reduce the global deposit counter

        // Send tokens back to the caller
        // Important: state is updated BEFORE the external call to prevent reentrancy attacks
        bool success = token.transfer(msg.sender, amount);
        require(success, "Transfer failed"); // Revert if the token transfer failed

        emit Withdrawn(msg.sender, amount); // Log the withdrawal event
    }

    /// @notice Returns the actual token balance held by this contract
    /// @return Number of tokens physically sitting in the contract
    function bankTokenBalance() public view returns (uint256) {
        return token.balanceOf(address(this)); // Ask the token contract for this contract's balance
    }
}