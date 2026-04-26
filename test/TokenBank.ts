import { expect } from "chai";
import { network } from "hardhat";

describe("TokenBank", function () {
    async function deployFixture() {
        const connection = await network.getOrCreate();
        const { ethers } = connection;

        const [owner] = await ethers.getSigners();

        const initialSupply = ethers.parseUnits("1000000", 18);

        const Token = await ethers.getContractFactory("MockToken");
        const token = await Token.deploy(initialSupply);

        const Bank = await ethers.getContractFactory("TokenBank");
        const bank = await Bank.deploy(await token.getAddress());

        return { token, bank, owner, ethers, connection };
    }

    it("should deposit tokens", async function () {
        const { token, bank, owner, ethers } = await deployFixture();

        const amount = ethers.parseUnits("100", 18);

        await token.approve(await bank.getAddress(), amount);
        await bank.deposit(amount);

        const deposit = await bank.deposits(owner.address);
        expect(deposit).to.equal(amount);
    });

    it("should withdraw tokens", async function () {
        const { token, bank, owner, ethers } = await deployFixture();

        const amount = ethers.parseUnits("100", 18);

        await token.approve(await bank.getAddress(), amount);
        await bank.deposit(amount);

        await bank.withdraw(amount);

        const deposit = await bank.deposits(owner.address);
        expect(deposit).to.equal(0n);
    });

    it("should fail without approval", async function () {
        const { bank, ethers } = await deployFixture();

        const amount = ethers.parseUnits("100", 18);

        await expect(bank.deposit(amount)).to.be.revert(ethers);
    });

    it("should fail if not enough deposit", async function () {
        const { bank, ethers } = await deployFixture();

        const amount = ethers.parseUnits("100", 18);

        await expect(bank.withdraw(amount)).to.be.revert(ethers);
    });
});