import hre from "hardhat";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

async function main() {
  const ethers = (hre as any).ethers;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  const usdcAddress = process.env.USDC_ADDRESS || ethers.ZeroAddress;
  if (usdcAddress === ethers.ZeroAddress) {
    throw new Error("USDC_ADDRESS environment variable is required for mainnet deployment");
  }
  console.log("USDC Token Address:", usdcAddress);

  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  const feeBps = Number(process.env.PLATFORM_FEE_BPS || 200);
  console.log("Fee Recipient:", feeRecipient);
  console.log("Platform Fee (bps):", feeBps);

  console.log("Deploying PredictionMarket...");
  const Factory = await ethers.getContractFactory("PredictionMarket");
  const contract = await Factory.deploy(usdcAddress, feeRecipient, feeBps);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("✅ PredictionMarket deployed at:", address);
  console.log("\nSave this address for your frontend .env:");
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


