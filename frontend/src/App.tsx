import { useState } from "react";
import { ethers } from "ethers";

const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS;
const bankAddress = import.meta.env.VITE_BANK_ADDRESS;

const bankAbi = [
  "function deposit(uint256 amount)",
  "function deposits(address user) view returns (uint256)",
  "function bankTokenBalance() view returns (uint256)",
  "function withdraw(uint256 amount)",
];

const tokenAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("100");
  const [bankDeposit, setBankDeposit] = useState<string>("0");
  const [status, setStatus] = useState<string>("");

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const userAddress = accounts[0];

    const token = new ethers.Contract(tokenAddress, tokenAbi, signer);

    const symbol = await token.symbol();
    const balance = await token.balanceOf(userAddress);

    setAccount(userAddress);
    setTokenSymbol(symbol);
    setTokenBalance(ethers.formatUnits(balance, 18));
    console.log("Frontend account:", userAddress);
  }

  const deposit = async ()=> {
    if (!window.ethereum || !account) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const token = new ethers.Contract(tokenAddress, tokenAbi, signer);
    const bank = new ethers.Contract(bankAddress, bankAbi, signer);

    const amount = ethers.parseUnits(depositAmount, 18);

    setStatus("Approving...");
    const approveTx = await token.approve(bankAddress, amount);
    await approveTx.wait();

    setStatus("Depositing...");
    const depositTx = await bank.deposit(amount);
    await depositTx.wait();

    const newTokenBalance = await token.balanceOf(account);
    const newBankDeposit = await bank.deposits(account);

    setTokenBalance(ethers.formatUnits(newTokenBalance, 18));
    setBankDeposit(ethers.formatUnits(newBankDeposit, 18));

    setStatus("Deposit complete");
  }

  async function withdraw() {
    if (!window.ethereum || !account) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const token = new ethers.Contract(tokenAddress, tokenAbi, signer);
    const bank = new ethers.Contract(bankAddress, bankAbi, signer);

    const amount = ethers.parseUnits(depositAmount, 18);

    setStatus("Withdrawing...");
    const withdrawTx = await bank.withdraw(amount);
    await withdrawTx.wait();

    const newTokenBalance = await token.balanceOf(account);
    const newBankDeposit = await bank.deposits(account);

    setTokenBalance(ethers.formatUnits(newTokenBalance, 18));
    setBankDeposit(ethers.formatUnits(newBankDeposit, 18));

    setStatus("Withdraw complete");
  }

  return (
      <div style={{ padding: 20 }}>
        <h2>Token Bank</h2>

        {!account ? (
            <button onClick={connectWallet}>Connect MetaMask</button>
        ) : (
            <>
              <p>Connected: {account}</p>
              <p>
                Balance: {tokenBalance} {tokenSymbol}
              </p>
              <div>
                <p>Bank deposit: {bankDeposit} {tokenSymbol}</p>

                <input
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Amount"
                />

                <button onClick={deposit}>Deposit</button>

                <button onClick={withdraw}>Withdraw</button>

                <p>{status}</p>
              </div>
            </>
        )}
      </div>
  );
}

export default App;