// imports
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

// some variables
const cnctBtn = document.querySelector(".connect-btn");
const fundBtn = document.querySelector(".fund-btn");
const inputField = document.querySelector(".eth-input");
const balanceBtn = document.querySelector(".balance-btn");
const withdrawBtn = document.querySelector(".withdraw-btn");
const { ethereum } = window;

// events
document.addEventListener("DOMContentLoaded", () => {
	if (ethereum) {
		cnctBtn.addEventListener("click", () => {
			connectToMM();
		});

		fundBtn.addEventListener("click", () => {
			fund(inputField.value);
		});

		balanceBtn.addEventListener("click", () => {
			getBalance();
		});

		withdrawBtn.addEventListener("click", () => {
			withdrawFund();
		});
	} else {
		// use doesn't have metamask
		console.log("Need Metamask to Interact!");
	}
});

const connectToMM = async () => {
	try {
		// make a connection
		await ethereum.request({ method: "eth_requestAccounts" });
		console.log("Connected!");
	} catch (err) {
		// if not connected for some reason
		console.log(err);
	}
};

const fund = async (ethAmount) => {
	console.log(`Funding with ${ethAmount}`);

	// get signer/user info
	const provider = new ethers.providers.Web3Provider(ethereum);
	const signer = provider.getSigner();

	// connect contract with the address, abi, signer
	const contract = new ethers.Contract(contractAddress, abi, signer);

	try {
		// make transaction
		const transactionResponse = await contract.fund({
			value: ethers.utils.parseEther(ethAmount),
		});

		// wait for transaction to be mined
		await listenForTxMining(transactionResponse, provider);
		console.log("Done!");
	} catch (err) {
		console.log(err);
	}
};

// wait for transaction to finish
const listenForTxMining = (transactionResponse, provider) => {
	console.log(`Mining ${transactionResponse.hash}...`);

	return new Promise((resolve, reject) => {
		provider.once(transactionResponse.hash, (transactionReceipt) => {
			console.log(
				`Completed with ${transactionReceipt.confirmations} Confirmation`
			);
			resolve();
		});
	});
};

const getBalance = async () => {
	const provider = new ethers.providers.Web3Provider(ethereum);
	const balance = await provider.getBalance(contractAddress);

	console.log(`Balance is: ${ethers.utils.formatEther(balance)}`);
};

const withdrawFund = async () => {
	console.log("Withdrawing...");

	// get signer/user info
	const provider = new ethers.providers.Web3Provider(ethereum);
	const signer = provider.getSigner();

	// connect contract with the address, abi, signer
	const contract = new ethers.Contract(contractAddress, abi, signer);

	try {
		const transactionResponse = await contract.withdraw();
		listenForTxMining(transactionResponse, provider);

		console.log("Done!");
	} catch (err) {
		console.log(err);
	}
};
