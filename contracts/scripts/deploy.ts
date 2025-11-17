import hre from "hardhat";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

async function main() {
  const ethers = (hre as any).ethers;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "CELO");

  // VictoryVault uses native CELO for staking, no token address needed
  console.log("Staking Token: Native CELO");

  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  if (feeRecipient === ethers.ZeroAddress) {
    throw new Error("FEE_RECIPIENT cannot be zero address");
  }
  
  const feeBps = Number(process.env.PLATFORM_FEE_BPS || 200);
  if (feeBps > 1000) {
    throw new Error("PLATFORM_FEE_BPS cannot exceed 1000 (10%)");
  }
  
  console.log("Fee Recipient:", feeRecipient);
  console.log("Platform Fee (bps):", feeBps, `(${(feeBps / 100).toFixed(2)}%)`);

  console.log("\nDeploying VictoryVault...");
  const Factory = await ethers.getContractFactory("VictoryVault");
  const contract = await Factory.deploy(feeRecipient, feeBps);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("\n✅ VictoryVault deployed successfully!");
  console.log("Contract Address:", address);
  console.log("\nNetwork:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("\nSave this address for your frontend .env:");
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


