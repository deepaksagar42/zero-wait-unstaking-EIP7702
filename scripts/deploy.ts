import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Token = await ethers.getContractFactory("TestToken");
  const token = await Token.deploy();
  await token.deployed();

  const Staking = await ethers.getContractFactory("SimpleStaking");
  const staking = await Staking.deploy(token.address);
  await staking.deployed();

  const Wallet = await ethers.getContractFactory("WalletLogic");
  const wallet = await Wallet.deploy();
  await wallet.deployed();

  const addresses = {
    deployer: deployer.address,
    token: token.address,
    staking: staking.address,
    walletLogic: wallet.address,
    network: "bscTestnet"
  };

  fs.writeFileSync(
    "addresses.json",
    JSON.stringify(addresses, null, 2)
  );

  console.log("📦 Addresses saved to addresses.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
