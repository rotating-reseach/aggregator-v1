import * as anchor from "@coral-xyz/anchor";
import { confirmTransaction } from "@solana-developers/helpers";
import { AdminAggregatorClient } from "../../sdk/src/adminClient";
import { VaultAssetType, VaultAssetTypeClass } from "../../sdk/src/type";
import { createToken, getLogs } from "../helper";
import { DRIFT_PROGRAM_ID, SOL_MINT, USDC_MINT } from "../constants";
import { createUSDCSOL, initializeAggregatorGroup } from "../before";

describe("Initialize Aggregator Token", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const admin = anchor.Wallet.local();
  const adminClient = new AdminAggregatorClient({
    provider: provider,
    wallet: admin,
    opts: { skipPreflight: true },
  });

  before(async () => {
    await createUSDCSOL();
    await initializeAggregatorGroup();
  });

  it("Initialize Aggregator Map for drift USDC deposit", async () => {
    const tx = await adminClient.initializeAggregatorMap(
      VaultAssetTypeClass.DEPOSIT,
      USDC_MINT,
      DRIFT_PROGRAM_ID
    );
    console.log("   Initialize Aggregator Map (Drift USDC deposit):", tx);
    await getLogs(tx);
  });

  it("Initialize Aggregator Map for drift SOL spot borrow", async () => {
    const tx = await adminClient.initializeAggregatorMap(
      VaultAssetTypeClass.SPOT_BORROW,
      SOL_MINT,
      DRIFT_PROGRAM_ID
    );
    console.log("   Initialize Aggregator Map (Drift SOL Spot Borrow):", tx);
    await getLogs(tx);
  });
});
