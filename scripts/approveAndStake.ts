import { ethers } from "hardhat";
import addresses from "../addresses.json";

const AMOUNT = ethers.utils.parseEther("100");

async function main() {
  const [user] = await ethers.getSigners();
  console.log("Using EOA:", user.address);

  const token = await ethers.getContractAt(
    [
      "function approve(address,uint256) external returns (bool)",
      "function balanceOf(address) view returns (uint256)"
    ],
    addresses.token
  );

  const staking = await ethers.getContractAt(
    [
      "function stake(uint256)",
      "function stakedBalance(address) view returns (uint256)",
      "function unlockTime(address) view returns (uint256)"
    ],
    addresses.staking
  );

  console.log("Approving...");
  await (await token.approve(addresses.staking, AMOUNT)).wait();

  console.log("Staking...");
  await (await staking.stake(AMOUNT)).wait();

  console.log("✅ Stake complete");
}

main().catch(console.error);
