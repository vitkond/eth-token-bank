import "dotenv/config";
import { network } from "hardhat";

async function main() {
    const connection = await network.getOrCreate();
    const { ethers } = connection;

    const tokenAddress = process.env.TOKEN_ADDRESS!;
    const token = await ethers.getContractAt("MockToken", tokenAddress);

    const [owner] = await ethers.getSigners();

    console.log("Hardhat owner:", owner.address);
    console.log("Token address:", tokenAddress);

    const balance = await token.balanceOf(owner.address);
    console.log("Owner balance:", ethers.formatUnits(balance, 18));

    await connection.close();
}

main().catch(console.error);