import Web3 from "web3";
import contractABI from "../Contracts/contractABI.json" assert { type: "json" };
import dotenv from "dotenv";

dotenv.config();

// Load environment variables
const INFURA_URL = process.env.INFURA_URL; // Your Ethereum RPC URL
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Initialize Web3 provider
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));

// Load smart contract
const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

// Function to send transactions
const sendTransaction = async (method, from) => {
  const encodedABI = method.encodeABI();
  const tx = {
    to: CONTRACT_ADDRESS,
    data: encodedABI,
    gas: 3000000,
  };

  const signed = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  return web3.eth.sendSignedTransaction(signed.rawTransaction);
};

export { web3, contract, sendTransaction };
