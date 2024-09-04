import { ethers } from "ethers";
import React, { useState, useEffect, createContext } from "react";
import Card01 from "../Card01/card01.jsx";
import Card02 from "../Card02/card02.jsx";
import Card03 from "../Card03/card03.jsx";
import { useContext } from "react";
import { PageContext } from "../../App.jsx";
import styles from './UserPage.module.css';
import { contractAddress, abi } from "../contractConfig.js";

export const DonateContext = createContext();

function UserPage() {

  const {setPageState} = useContext(PageContext);
  
  const [connected, setConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState("0x0000000000000000000000000000000000000000000");
  const [preRequisiteMsg, setPreRequisiteMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [failedMsg, setFailedMsg] = useState("");
  const [receiptMsg, setReceiptMsg] = useState("");
  const [accountBalance, setAccountBalance] = useState("0");
  const [donatedAmount, setDonatedAmount] = useState("0.0");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [donationInput, setDonationInput] = useState("1.0");
  const [totalDonationRaised, setTotalDonationRaised] = useState("0.0");
  const [totalDonors, setTotalDonors] = useState("0");
  const [targetAchieved, setTargetAchieved] = useState(false);


  const Connect = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        setConnected(true);
        setPreRequisiteMsg("");
        console.log("Connected to MetaMask!");

        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        setConnectedAccount(accounts[0]);
        console.log(`Connected Accounts: ${accounts}`);

        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await _provider.getSigner();
        const _contract = new ethers.Contract(contractAddress, abi, _signer);

        setProvider(_provider);
        setSigner(_signer);
        setContract(_contract);
      } catch (error) {
        console.log("Failed to connect to MetaMask!", error);
      }
    }
    else {
      console.error("Please install metamask", error);
      setPreRequisiteMsg("Please install Metamask!");
    }
  };

  const fetchBalance = async () => {
    if (provider && connectedAccount) {
      try {
        const balance = await provider.getBalance(connectedAccount);
        const balanceETH = ethers.formatEther(balance);
        setAccountBalance(balanceETH);
        console.log(`Account Balance: ${balanceETH} ETH`);
      } catch (error) {
        console.log("Failed to fetch balance!", error);
      }
    }
  };

  const fetchDonationAmount = async () => {
    if (contract && signer) {
      try {
        const signerAddress = await signer.getAddress();
        const Amount = await contract.donationAmount(signerAddress);
        const amountETH = ethers.formatEther(Amount);
        console.log(`Total amount donated by the user: ${amountETH} ETH`);
        setDonatedAmount(amountETH);
      } catch (error) {
        console.error("Failed to fetch Donation Amount!", error);
      }
    }
  };

  const fetchTotalAmountRaised = async() => {
    if (contract){
      try{
        const amountRaised = await contract.totalAmountRaised();
        const amountRaisedInETH = ethers.formatEther(amountRaised); 
        setTotalDonationRaised(amountRaisedInETH); 
        console.log(`Total Donation Amount Raised so far: ${amountRaisedInETH} ETH`);
      }
      catch (error){
        console.error ("Failed to load Total Amount Raised!", error);
      }
    }
  };

  const fetchDonors = async() => {
    if (contract){
      try{
        const donors = await contract.noOfDonors();
        const donorsCount = donors.toString(); 
        setTotalDonors(donorsCount);
        console.log(`Total Donors: ${donorsCount}`);
      }
      catch (error){
        console.error ("Failed to fetch total donors", error);
      }
    }
  };

  const fetchTargetStatus = async () => {
    if (contract) {
      try{
        const targetReached = await contract.isTargetAchieved();
        setTargetAchieved(targetReached);
      }
      catch (error){
        console.error("Failed to fetch target status!", error);
      }
    }
  };

  const handleInputChange = (e) => {
    setDonationInput(e.target.value);
  };

  const Donate = async () => {
    //Check if the connection even exists or not...
    if (!contract) {
        setPreRequisiteMsg("Please connect to MetaMask!");
        return;
    }

    // Check if the contract is PAUSED...
    const isPaused = await contract.paused();

    if (isPaused) {
        setSuccessMsg("");
        setReceiptMsg("");
        setFailedMsg("CONTRACT IS PAUSED. YOU CANNOT DONATE ETH");
        return;
    }

    //Check if the fundraising target has been achieved...
    if (targetAchieved) {
        setSuccessMsg("");
        setReceiptMsg("");
        setFailedMsg("Donation Failed: Fundraising Target of 100 ETH has been achieved. No more donations are allowed.");
        return;
    }

    const inputFieldValue = donationInput.trim();
    const newDonationAmount = parseFloat(inputFieldValue);
    const totalAfterDonation = parseFloat(donatedAmount) + newDonationAmount;

    // Check the upper and lower limits...
    if (totalAfterDonation > 10) {
        setSuccessMsg("");
        setReceiptMsg("");
        setFailedMsg("Donation Failed: You cannot donate more than 10 ETH in total!");
        return;
    }

    if (newDonationAmount < 0.1) {
        setSuccessMsg("");
        setReceiptMsg("");
        setFailedMsg("Donation Failed: You cannot donate less than 0.1 ETH!");
        return;
    }

    // Check if the user has sufficient balance...
    if (parseFloat(accountBalance) >= parseFloat(inputFieldValue)) {
        try {
            setIsLoading(true);
            const tx = await contract.donate({ value: ethers.parseEther(inputFieldValue) });
            await tx.wait();

            // Generate receipt
            const txReceipt = await provider.getTransactionReceipt(tx.hash);

            // Update frontend states
            fetchDonationAmount(); 
            fetchBalance(); 
            fetchTotalAmountRaised();
            fetchDonors();

            setFailedMsg("");
            setSuccessMsg("Donation Successful!!");
            setReceiptMsg(
                <span>
                    Transaction Hash: {tx.hash} <br />
                    To: {txReceipt.to} <br />
                    Amount Donated: {inputFieldValue} ETH <br />
                </span>
            );
        } catch (error) {
            setSuccessMsg("");
            setReceiptMsg("");
            setFailedMsg("Donation Failed!!");
            console.error("Donation failed!!", error);
        } finally {
            setIsLoading(false);
        }
    } else {
        setSuccessMsg("");
        setReceiptMsg("");
        setFailedMsg("Insufficient account balance!!");
        console.error("Insufficient account balance!!");
    }
};

const Withdraw = async () => {
  const isPaused = await contract.paused();

  if (isPaused){
    setSuccessMsg("");
    setReceiptMsg("");
    setFailedMsg("CONTRACT IS PAUSED. YOU CANNOT WITHDRAW ETH");
    return;
  }
  if (contract && !targetAchieved) {
    try {
      setIsLoading(true);
      const tx = await contract.withdraw();
      await tx.wait();
      console.log("Withdrawal successful!");

      fetchBalance();
      fetchDonationAmount();
      fetchTotalAmountRaised();
      fetchDonors();

      setFailedMsg("");
      setSuccessMsg(" Withdrawal successful!!");
      setReceiptMsg(
        <span>
        Transaction Hash: ${tx.hash} <br />
        Amount Withdrawal: {donatedAmount} ETH <br />
        </span>
      );
      } 
    catch (error) {
  
  let errorMessage = "Withdrawal Failed!!";
  const hasDonationPeriodExpired = await contract.hasPeriodExpired();

  //(Reason 1: user hasn't donated anything)
  if (donatedAmount == 0){
    errorMessage = "Withdrawal Failed: You haven't donated anything!!"
  }
  // (Reason 2: Withdrawal Period expired)
  else if (hasDonationPeriodExpired) {
    errorMessage = "Withdrawal Failed: Withdraw period expired, you can no longer withdraw funds!!"
  }
  else {
    errorMessage = "WITHDRAWAL FAILED";
    console.error("WITHDRAWAL FAILED", error);
  }

  setSuccessMsg("");
  setReceiptMsg("");
  setFailedMsg(errorMessage);
  }

  finally{
    setIsLoading(false);
  }

  }
  else if (targetAchieved){
    setSuccessMsg("");
    setReceiptMsg("");
    setFailedMsg("Withdrawal Failed: Fundraising Target has been achieved. You can no longer withdraw ETH.")
  } 
  else 
  {
    setPreRequisiteMsg("Please connect to MetaMask!");
  }
};


  useEffect(() => {
    if (connected && provider && signer && contract) {
      fetchBalance();
      fetchDonationAmount();
      fetchTotalAmountRaised();
      fetchDonors();
      fetchTargetStatus();
    }
  }, [connected, connectedAccount, provider, signer, contract]);

  const progressPercentage = (parseFloat(totalDonationRaised) / 100) * 100;

  return (
    <div className= {styles.main}>
      <h1 className= {styles.pHeading}>
        "Help Tripura Recover: Your Donation Matters"
      </h1>
    <div className={styles.Box}>

      <div className={styles.container01}>
        <div className= {styles.dataUpdatesContainer}>
              <p className={styles.DUC}>OUR TARGET: 100 ETH</p>
              <p className={styles.DUC}>TOTAL CONTRIBUTION: {totalDonationRaised} ETH </p>
              <p className={styles.DUC}>YOUR CONTRIBUTION: {donatedAmount} ETH </p>
              <p className={styles.DUC}> {totalDonors} {totalDonors > 1 ? "DONORS" : "DONOR" } </p>
          </div>
          <div className={styles.circularProgress} style={{ '--progress': progressPercentage }}>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
      </div>

      {/* All main buttons  */}
      <div className= {styles.container01}>
        <button className= {styles.button} onClick={Connect}>
          {connected ? "Connected" : "Connect"}
        </button>
        <button className= {styles.button} onClick={Donate}  disabled = {isLoading || targetAchieved}>
         {targetAchieved ? "Target Achieved" : "Donate"}
        </button>
        <button className= {styles.button} onClick={Withdraw} disabled = {isLoading || targetAchieved}>
          Withdraw
        </button>
      </div>

      {/* Input Field */}
      <input className= {styles.styledInput} type="number" min="0.1" max="10" step="0.1" 
      value= {donationInput} onChange={handleInputChange} 
      placeholder="Enter donation amount (in ETH)" />

      {/* Spinner  */}
      {isLoading && <div className= {`${styles.setCenter} ${styles.spinner}`} ></div>}

      {/* Center Notifications */}
      <p className= {styles.setCenter} id= {styles.preRequisiteMsg} > {preRequisiteMsg} </p>
      <p className= {styles.setCenter} id= {styles.successMsg} > {successMsg} </p>
      <p className= {styles.setCenter} id= {styles.failedMsg} > {failedMsg} </p>
      {/* Conditionally render receipt only if there's a message */}
      {receiptMsg && <p className= {`${styles.setCenter} ${styles.receipt}`} >{receiptMsg}</p>}


      <p className= {styles.setCenter} > Address: {connectedAccount} </p>
      <p className= {styles.setCenter} > Balance: {connected ? accountBalance : "0"} ETH </p>

      </div>

      {/* Card Components  */}
      <div className= {styles.container02} >
        <Card01 />
        <Card02 />
        <DonateContext.Provider value={{ donatedAmount, setDonatedAmount }}>
          <Card03 />
        </DonateContext.Provider>
      </div>
      <button className= {`${styles.setCenter} ${styles.backButton}`} onClick={() => setPageState("LoginPage")}> 👈🏻 </button>
    </div>
  );
}

export default UserPage;
