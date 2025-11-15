import { expect } from "chai";
import { ethers } from "hardhat";

describe("PredictionMarket", function () {
  it("deploys", async function () {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("contracts/test/MockERC20.sol:MockERC20");
    const token = await Token.deploy("USDC", "USDC", 6);
    await token.waitForDeployment();

    const PM = await ethers.getContractFactory("PredictionMarket");
    const pm = await PM.deploy(await token.getAddress(), owner.address, 200);
    await pm.waitForDeployment();

    expect(await pm.feeRecipient()).to.eq(owner.address);
  });
});


