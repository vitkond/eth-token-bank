import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TokenBankModule", (m) => {
    const initialSupply = 1_000_000n * 10n ** 18n;

    const token = m.contract("MockToken", [initialSupply]);

    const bank = m.contract("TokenBank", [token]);

    return { token, bank };
});