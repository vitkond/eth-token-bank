import {useState} from "react";
import {ethers} from "ethers";

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
    "function allowance(address owner, address spender) view returns (uint256)",
];

function App() {
    const [account, setAccount] = useState<string | null>(null);
    const [tokenSymbol, setTokenSymbol] = useState<string>("");
    const [tokenBalance, setTokenBalance] = useState<string>("");
    const [depositAmount, setDepositAmount] = useState<string>("100");
    const [bankDeposit, setBankDeposit] = useState<string>("0");
    const [status, setStatus] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function connectWallet() {
        console.log("connectWallet called");
        if (!window.ethereum) {
            alert("Install MetaMask");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);

        await loadAccountData(accounts[0]);
    }

    const refreshData = async (userAddress = account) => {
        if (!userAddress) return;
        await loadAccountData(userAddress);
    }

    async function deposit() {
        if (!window.ethereum || !account || isLoading) return;

        setIsLoading(true);
        setError("");

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const token = new ethers.Contract(tokenAddress, tokenAbi, signer);
            const bank = new ethers.Contract(bankAddress, bankAbi, signer);

            const amount = ethers.parseUnits(depositAmount, 18);

            const currentAllowance = await token.allowance(account, bankAddress);

            if (currentAllowance < amount) {
                setStatus("Approving...");
                const approveTx = await token.approve(bankAddress, ethers.MaxUint256);
                await approveTx.wait();
            }

            setStatus("Depositing...");
            const depositTx = await bank.deposit(amount);
            await depositTx.wait();

            await refreshData(account);
            setStatus("Deposit complete");
        } catch (e: any) {
            console.error(e);
            setError(e?.code === "ACTION_REJECTED" ? "Transaction cancelled" : "Transaction failed");
            setStatus("");
        } finally {
            setIsLoading(false);
        }
    }

    async function withdraw() {
        if (!window.ethereum || !account || isLoading) return;

        setIsLoading(true);
        setError("");

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const bank = new ethers.Contract(bankAddress, bankAbi, signer);

            const amount = ethers.parseUnits(depositAmount, 18);

            setStatus("Withdrawing...");
            const withdrawTx = await bank.withdraw(amount);
            await withdrawTx.wait();

            await refreshData(account);
            setStatus("Withdraw complete");
        } catch (e: any) {
            console.error(e);
            setError(e?.code === "ACTION_REJECTED" ? "Transaction cancelled" : "Transaction failed");
            setStatus("");
        } finally {
            setIsLoading(false);
        }
    }

    async function loadAccountData(userAddress: string) {
        if (!window.ethereum) return;

        const provider = new ethers.BrowserProvider(window.ethereum);

        const token = new ethers.Contract(tokenAddress, tokenAbi, provider);
        const bank = new ethers.Contract(bankAddress, bankAbi, provider);

        const symbol = await token.symbol();
        const balance = await token.balanceOf(userAddress);
        const deposit = await bank.deposits(userAddress);

        setAccount(userAddress);
        setTokenSymbol(symbol);
        setTokenBalance(ethers.formatUnits(balance, 18));
        setBankDeposit(ethers.formatUnits(deposit, 18));
    }

    return (
        <div style={{padding: 20}}>
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

                        <button onClick={deposit} disabled={isLoading || !account}>
                            {isLoading ? "Processing..." : "Deposit"}
                        </button>

                        <button onClick={withdraw} disabled={isLoading || !account}>
                            {isLoading ? "Processing..." : "Withdraw"}
                        </button>
                        
                    </div>
                </>
            )}
            {status && <p>{status}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default App;