import { network } from "hardhat";
import { config } from "./config.js";

async function main() {
    const tokenAddress = config.tokenAddress;
    const bankAddress = config.bankAddress;

    const connection = await network.getOrCreate();
    const { ethers } = connection;

    const [owner] = await ethers.getSigners();

    const token = await ethers.getContractAt("MockToken", tokenAddress);
    const bank = await ethers.getContractAt("TokenBank", bankAddress);

    const amount = ethers.parseUnits("100", 18);

    console.log("User:", owner.address);

    console.log("Token balance before:", ethers.formatUnits(await token.balanceOf(owner.address), 18));
    console.log("Bank deposit before:", ethers.formatUnits(await bank.deposits(owner.address), 18));

    const approveTx = await token.approve(bankAddress, amount);
    await approveTx.wait();

    console.log("Approved bank to spend 100 mUSD");

    const depositTx = await bank.deposit(amount);
    await depositTx.wait();

    console.log("Deposited 100 mUSD");

    console.log("Token balance after deposit:", ethers.formatUnits(await token.balanceOf(owner.address), 18));
    console.log("Bank deposit after deposit:", ethers.formatUnits(await bank.deposits(owner.address), 18));
    console.log("Bank token balance:", ethers.formatUnits(await bank.bankTokenBalance(), 18));

    const withdrawTx = await bank.withdraw(amount);
    await withdrawTx.wait();

    console.log("Withdrawn 100 mUSD");

    console.log("Token balance after withdraw:", ethers.formatUnits(await token.balanceOf(owner.address), 18));
    console.log("Bank deposit after withdraw:", ethers.formatUnits(await bank.deposits(owner.address), 18));
    console.log("Bank token balance:", ethers.formatUnits(await bank.bankTokenBalance(), 18));

    await connection.close();
}

main().catch(console.error);