import styles from "./AdminPage.module.css";
import {ethers} from "ethers";
import { useState, useContext, useEffect } from "react";
import { PageContext } from "../../App.jsx";
import { contractAddress, abi } from "../contractConfig.js";

function AdminPage() {

    const {setPageState} = useContext(PageContext);

    const [connected, setConnected] = useState(false);
    const [account, setAccount] = useState("0x0000000000000000000000000000000000000000");
    const [accountBalance, setAccountBalance] = useState("0.0");
    const [isOwner, setIsOwner] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [failedMsg, setFailedMsg] = useState("");
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
	const [donors, setDonors] = useState([]);
	const [amounts, setAmounts] = useState([]);


    const Connect = async() => {
        if (typeof window.ethereum !== "undefined"){
            //user has ethereum object
            try{
                const _provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await _provider.send("eth_requestAccounts", []);
                const _account = accounts[0];
                const _signer = await _provider.getSigner();
                const _contract = new ethers.Contract(contractAddress, abi, _signer);
                const isOwner = await _contract.isOwner();
                
                // If the user is OWNER
                if (isOwner){
                    setAccount(_account);
                    setIsOwner(isOwner);
                    setConnected(true);
                    setFailedMsg("");
                    console.log("Connected: Welcome Owner!");
                    setSuccessMsg("CONNECTION SUCCESSFUL: WELCOME ADMIN");

                    //After the user verification, set the signer, provider and contract
                    setProvider(_provider);
                    setSigner(_signer);
                    setContract(_contract);
                }
                else {
                setAccount("0x0000000000000000000000000000000000000000");
                setAccountBalance("0.0");
                setIsOwner(false);
                setConnected(false);
                setSuccessMsg("");
                console.error("You are not the owner!");
                setFailedMsg("CONNECTION FAILED: YOU ARE NOT THE OWNER");
                }
            }
            catch (error){
                console.error("Problem connecting to metamask!", error);
                setFailedMsg("PROBLEM CONNECTING TO METAMASK");
                setSuccessMsg("");
            }
        }
        else {
            console.error("Please install metamask!", error);
            setFailedMsg("PLEASE INSTALL METAMASK");
            setSuccessMsg("");
            }
    }

    const fetchBalance = async() => {
        if (connected){
            try{ 
                const balance = await provider.getBalance(account);
                const balanceETH = ethers.formatEther(balance);
                setAccountBalance(balanceETH);
                console.log(`Account Balance: ${balanceETH} ETH`);
                }
            catch (error) {
                console.error("Failed to fetch Account Balance (in ETH)!", error);
            }
        }
    }

    const pauseContract = async() => {
        if (connected && isOwner)
            {
            try{
				//Check if the contract is paused...
				const isPaused = await contract.paused();

				if( isPaused ){
					setFailedMsg("");
					setSuccessMsg("CONTRACT IS ALREADY PAUSED");
				}
				else {
					console.log(`Calling pauseContract~`);
					//Call the pause function from the contract
					const tx = await contract.pause();
					await tx.wait(); // Wait for the transaction to complete
					
					setFailedMsg("");
					setSuccessMsg("CONTRACT PAUSED SUCCESSFULLY");
				}
            }
            catch (error) 
            {
                console.error("ERROR PAUSING CONTRACT", error);
                setFailedMsg("ERROR PAUSING CONTRACT");
                setSuccessMsg("");
            }
        }
        else {
            setFailedMsg("Please connect to metamask!");
        }
    }

	const unPauseContract = async() => {
		if (connected && isOwner)
			{
			try{
				const isPaused = await contract.paused();

				if(!isPaused){
					setFailedMsg("");
					setSuccessMsg("CONTRACT IS ALREADY UNPAUSED");
				}

				else {
					console.log(`Calling unpauseContract~`);
					const tx = await contract.unpause();
					await tx.wait(); //Wait for the transaction to complete
					
					setFailedMsg("");
					setSuccessMsg("CONTRACT UNPAUSED SUCCESSFULLY");
				}
			}
			catch (error) 
			{
				console.error("ERROR UNPAUSING CONTRACT", error);
				setFailedMsg("ERROR UNPAUSING CONTRACT");
				setSuccessMsg("");
			}
		}
		else {
			setFailedMsg("Please connect to metamask!");
		}
	}
	
	const totalDonationsRaised = async() => {
		if(connected && isOwner){
			try{
				console.log("Calling total Donations Raised~");
				const amount = await contract.totalAmountRaised();
				const amountETH = ethers.formatEther(amount);

				setFailedMsg("");
				setSuccessMsg(`TOTAL AMOUNT RAISED: ${amountETH} ETH`);
			}
			catch (error) {
				console.error("ERROR FETCHING TOTAL DONATIONS", error);
				setFailedMsg("ERROR FETCHING TOTAL DONATIONS");
				setSuccessMsg("");
			}
		}
		else{
			setFailedMsg("Please connect to metamask!");
		}
	}
	
	const withdrawAllFunds = async() => {
		if(connected && isOwner){
			try{
				//Check if the contract is paused...
				const isPaused = await contract.paused();

				//Also check if the totalAmountRaised is 0, then withdrawal is not possible!
				const amountRaised = await contract.totalAmountRaised();
				const amountRaisedETH = ethers.formatEther(amountRaised);

				if (isPaused){
					setSuccessMsg("");
					setFailedMsg("CONTRACT IS PAUSED. YOU CANNOT USE THIS FUNCTION");
				}

				else if(amountRaisedETH == 0){
					setSuccessMsg("");
					setFailedMsg("WITHDRAWAL FAILED: NOTHING TO WITHDRAW");
				}

				else{
					console.log("Calling Withdraw funds~");
					const tx = await contract.withdrawAllFunds();
					await tx.wait();
					
					setFailedMsg("");
					setSuccessMsg("FUNDS WITHDRAWAL SUCCESSFUL");
					fetchBalance();
				}
			}
			catch (error) {
				console.error("Error withdrawing funds!", error);
				setFailedMsg("Error withdrawing funds");
				setSuccessMsg("");
			}
		}
		else{
			setFailedMsg("Please connect to metamask!");
		}
	}

    const listDonors = async() => {
		if (connected && isOwner){
			const donors = await contract.noOfDonors();
			if ( donors == 0 ) {
				setSuccessMsg("There are no donors...");
				setFailedMsg("");
			}
			else {
				try{
					console.log("Calling List Donors~");
					const [donorList, donorAmounts] = await contract.getAllDonors();
					setDonors(donorList);
					setAmounts(donorAmounts);
					setSuccessMsg("");
					setFailedMsg("");
				}
				catch (error) {
					console.error("Error listing donors!", error);
					setFailedMsg("Error listing donors!");
					setSuccessMsg("");
				}
		}
        }
        else{
            setFailedMsg("Please connect to metamask!");
        }
    }

    useEffect( () => {
        if (connected && isOwner && account && provider && signer && contract ){
            fetchBalance();
        }
    }, [connected, account, provider, signer, contract] );

    return ( 
        <div className= {styles.main} >
            <div className= {styles.box}>
                {/* HEADING */}
                <h1 className= {styles.mainHeading}> ADMIN PANEL </h1>

                {/* CONNECT BUTTON */}
                <button className= {styles.button} id= {styles.connectButton} onClick={ Connect }> 
                    { connected ? "Connected" : "Connect"} </button>

                {/* NOTIFICATION MESSAGES */}
                <p className= {styles.successMsg}>      {successMsg}  </p>
                <p className= {styles.failedMsg}>       {failedMsg} </p>

                {/* UPDATED ADDRESS AND BALANCE IF ADMIN IS CONNECTED  */}
                <p className= {styles.setCenter}>Address: {account} </p>
                <p className= {styles.setCenter}>Balance: {accountBalance} </p>

                {/* ADMIN FUNCTIONS  */}
                    <div className= {styles.container03}>
                        <button className= {styles.button} onClick = {pauseContract}> PAUSE CONTRACT </button>
                        <button className= {styles.button} onClick = {unPauseContract}> UNPAUSE CONTRACT </button>
                        <button className= {styles.button} onClick = {totalDonationsRaised}> TOTAL DONATIONS </button>
                        <button className= {styles.button} onClick = {withdrawAllFunds}> WITHDRAW FUNDS </button>
                        <button className= {styles.button} onClick = {listDonors}> LIST DONORS </button>
                    </div>
	   {/* Donor List Table */}
	   {donors.length > 0 && (
                    <table className={styles.donorTable}>
                        <thead>
                            <tr>
                                <th>Donor Address</th>
                                <th>Donated Amount (ETH)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donors.map((donor, index) => (
                                <tr key={donor}>
                                    <td>{donor}</td>
                                    <td>{ethers.formatEther(amounts[index].toString())}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
                <button className= {`${styles.setCenter} ${styles.backButton}`} 
                onClick={() => setPageState("LoginPage")}> 👈🏻 </button>
        </div>
     );
}

export default AdminPage;