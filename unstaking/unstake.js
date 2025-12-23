import dotenv from "dotenv";
dotenv.config();


import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

/* ------------------ SAFETY CHECKS ------------------ */
if (!process.env.PRIVATE_KEY) {
  throw new Error("❌ PRIVATE_KEY not loaded. Check .env file.");
}

/* ------------------ PATH SETUP ------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------ LOAD ADDRESSES ------------------ */
const addressesPath = path.join(__dirname, "..", "addresses.json");

if (!fs.existsSync(addressesPath)) {
  throw new Error("❌ addresses.json not found in project root.");
}

const addresses = JSON.parse(
  fs.readFileSync(addressesPath, "utf8")
);

/* ------------------ PROVIDER & SIGNER ------------------ */
const RPC = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const provider = new ethers.providers.JsonRpcProvider(RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

/* ------------------ STAKING CONTRACT (READ ONLY) ------------------ */
const staking = new ethers.Contract(
  addresses.staking,
  ["function unlockTime(address) view returns (uint256)"],
  provider
);

/* ------------------ MAIN LOGIC ------------------ */
async function main() {
  const eoa = await signer.getAddress();

  console.log("EOA:", eoa);
  console.log("Staking contract:", addresses.staking);
  console.log("WalletLogic:", addresses.walletLogic);
  console.log("⏳ Waiting for lock expiry...");

  while (true) {
    const unlock = await staking.unlockTime(eoa);
    const block = await provider.getBlock("latest");

     console.log(
    "Block:", block.number,
    "| Block TS:", block.timestamp,
    "| Unlock TS:", unlock.toNumber(),
    "| expired:", block.timestamp >= unlock.toNumber()
  );
  
    if (unlock.gt(0) && block.timestamp >= unlock.toNumber()) {
      console.log("🔓 Lock expired at timestamp:", block.timestamp);

      // Encode WalletLogic.executeUnstake(staking)
      const iface = new ethers.utils.Interface([
        "function executeUnstake(address)"
      ]);

      const callData = iface.encodeFunctionData(
        "executeUnstake",
        [addresses.staking]
      );

      // EIP-7702 delegation payload
      const delegation = ethers.utils.concat([
        "0xef0100",
        ethers.utils.arrayify(addresses.walletLogic)
      ]);

      const tx = await signer.sendTransaction({
        to: eoa,
        data: ethers.utils.concat([delegation, callData]),
        gasLimit: 300000
      });

      console.log("🚀 Unstake TX sent:", tx.hash);
      await tx.wait();

      console.log("✅ Unstaked via EIP-7702 (first valid block)");
      break;
    }

    await new Promise(r => setTimeout(r, 1000));
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
