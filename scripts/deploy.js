import hardhat from "hardhat"; import fs from "fs"; import path from "path";

const { ethers } = hardhat;

const main = async () => {
  const OrganicCertification = await ethers.getContractFactory("OrganicCertification"); 
  const contract = await OrganicCertification.deploy(); await contract.waitForDeployment();

  const contractAddress = contract.target; console.log("OrganicCertification deployed to:", contractAddress);

  // Read ABI from compiled artifact const artifactPath = path.resolve( "artifacts/contracts/OrganicCertification.sol/OrganicCertification.json" ); const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Prepare data to save const contractData = { address: contractAddress, abi: artifact.abi, };

  // Ensure directory exists const outputDir = path.resolve("backend/utils"); if (!fs.existsSync(outputDir)) { fs.mkdirSync(outputDir, { recursive: true }); }

  // Write to JSON file const outputPath = path.join(outputDir, "OrganicCertification.json"); fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));

  console.log("Contract address and ABI saved to backend/utils/OrganicCertification.json");
};

main().catch((error) => { 
  console.error(error); 
  process.exitCode = 1; 
});