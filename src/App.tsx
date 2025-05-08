import React, { useState,useEffect } from "react";
import { ethers, ContractTransactionResponse, parseEther, formatEther, JsonRpcProvider } from "ethers";
import { Delance } from "./contracts/Delance";
import DelanceArtifact from "./contracts/Delance.json";

import RequestForm from "./components/RequestForm";
import RequestsList from "./components/RequestsList";
import ApproveRequest from "./components/ApproveRequest";

function App() {
  const [contract, setContract] = useState<Delance | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  // Dynamic addresses and role
  const [employerAddress, setEmployerAddress] = useState<string>("");
  const [freelancerAddress, setFreelancerAddress] = useState<string>("");
  const [role, setRole] = useState<"viewer" | "employer" | "freelancer">("viewer");

  const connectWallet = async () => {
    try {
      const _provider = new JsonRpcProvider('http://127.0.0.1:7545');
      const _accounts = await _provider.listAccounts();
      const addresses = await Promise.all(_accounts.map(signer => signer.getAddress()));
  
      if (_accounts.length === 0) {
        alert("No accounts available in the local node.");
        return;
      }
  
      setAccounts(addresses);
      setProvider(_provider);
      setAccount(addresses[0]); // default
      setEmployerAddress(addresses[0]);
      setFreelancerAddress(addresses[1]);
    } catch (err) {
      console.error("Wallet connection failed", err);
      alert("Failed to connect wallet");
    }
  };
  const updateContractForRole = async (address: string) => {
    if (!provider) return;

    try {
      const signer = await provider.getSigner(address);
      const _contract = new ethers.Contract(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        DelanceArtifact.abi,
        signer
      ) as unknown as Delance;

      const [_balance, _requests] = await Promise.all([
        _contract.getContractBalance(),
        _contract.getAllRequests(),
      ]);

      setContract(_contract);
      setContractBalance(formatEther(_balance));
      setRequests(_requests);
      setAccount(address);
    } catch (err) {
      console.error("Error updating contract for role", err);
    }
  };
  const refreshData = async () => {
    if (!contract) return;
    try {
      const [_balance, _requests] = await Promise.all([
        contract.getContractBalance(),
        contract.getAllRequests(),
      ]);
      setContractBalance(formatEther(_balance));
      setRequests(_requests);
    } catch (err) {
      console.error("Error refreshing data", err);
    }
  };

  const createRequest = async (title: string, amount: string) => {
    try {
      setLoading(true);
      const balance = await contract!.getContractBalance();
      if (parseEther(amount) > balance) {
        alert(`Requested amount exceeds contract balance. Remaining: ${formatEther(balance)} ETH`);
        setLoading(false);
        return;
      }
      const tx: ContractTransactionResponse = await contract!.createRequest(title, parseEther(amount));
      await tx.wait();
      await refreshData();
    } catch (err: any) {
      console.error("Error creating request", err);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (index: number) => {
    try {
      setLoading(true);
      const tx: ContractTransactionResponse = await contract!.approveRequest(index);
      await tx.wait();
      await refreshData();
    } catch (err) {
      console.error("Error approving request", err);
    } finally {
      setLoading(false);
    }
  };

  const setFreelancerOnChain = async () => {
    try {
      if (role !== "employer") {
        alert("Only employer can set freelancer on-chain.");
        return;
      }
      const tx: ContractTransactionResponse = await contract!.setFreelancer(freelancerAddress);
      await tx.wait();
      alert("Freelancer set successfully on-chain!");
    } catch (err) {
      console.error("Error setting freelancer on-chain", err);
      alert("Failed to set freelancer.");
    }
  };
  useEffect(() => {
    if (!provider) return;
  
    if (role === "employer" && employerAddress) {
      updateContractForRole(employerAddress);
    } else if (role === "freelancer" && freelancerAddress) {
      updateContractForRole(freelancerAddress);
    } else if (role === "viewer" && accounts.length > 0) {
      updateContractForRole(accounts[0]); // default
    }
  }, [role, employerAddress, freelancerAddress]);
  return (
    <div className="container py-5">
      <div className="card shadow-lg rounded-4 p-4 bg-light">
        <h1 className="mb-4 text-center text-primary">Delance Platform</h1>

        {!account ? (
          <div className="text-center">
            <button className="btn btn-primary btn-lg" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <h5>Connected Account</h5>
              <code className="d-block mb-2">{account}</code>

              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Employer Address</label>
                  <input
                    className="form-control"
                    type="text"
                    value={employerAddress}
                    onChange={(e) => setEmployerAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Freelancer Address</label>
                  <input
                    className="form-control"
                    type="text"
                    value={freelancerAddress}
                    onChange={(e) => setFreelancerAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="form-label">Select Role</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "viewer" | "employer" | "freelancer")}
                >
                  <option value="viewer">Viewer</option>
                  <option value="employer">Employer</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>
            </div>

            <div className="alert alert-info d-flex justify-content-between align-items-center mt-4">
              <span>
                <strong>Contract Balance:</strong> {contractBalance} ETH
              </span>
              <button className="btn btn-outline-primary btn-sm" onClick={refreshData}>
                Refresh Balance
              </button>
            </div>

            {role === "employer" && (
              <div className="mb-4 text-center">
                <button className="btn btn-warning" onClick={setFreelancerOnChain}>
                  Set Freelancer On-Chain
                </button>
              </div>
            )}

            {role === "freelancer" && (
              <div className="mb-4">
                <RequestForm createRequest={createRequest} loading={loading} />
              </div>
            )}

            <div className="mb-4">
              <RequestsList requests={requests} />
            </div>

            {role === "employer" && (
              <div className="mb-4">
                <ApproveRequest
                  requests={requests}
                  approveRequest={approveRequest}
                  loading={loading}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
