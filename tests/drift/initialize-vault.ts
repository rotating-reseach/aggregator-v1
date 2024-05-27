import * as anchor from "@coral-xyz/anchor";
import { AdminAggregatorClient } from "../../sdk/src/adminClient";
import { createToken, getLogs } from "../helper";
import { confirmTransaction } from "@solana-developers/helpers";
import { VaultAssetTypeClass } from "../../sdk/src/type";
import { DRIFT_PROGRAM_ID, SOL_MINT, USDC_MINT } from "../constants";
import {
  createUSDCSOL,
  initializeAggregatorGroup,
  initializeAggregatorMapUSDCSOL,
  initializeDriftUSDCSOL,
} from "../before";
import { AdminClient } from "@drift-labs/sdk";

describe("Initialize Drift Aggregator Vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const admin = anchor.Wallet.local();
  const adminClient = new AdminAggregatorClient({
    provider: provider,
    wallet: admin,
    opts: { skipPreflight: true },
  });
  const driftClient = new AdminClient({
    connection: provider.connection,
    wallet: admin,
    opts: { skipPreflight: true },
  });

  before(async () => {
    await createUSDCSOL();
    const [initDriftTxSig] = await driftClient.initialize(USDC_MINT, false);
    console.log("   Initialize Drift:", initDriftTxSig);
    await confirmTransaction(provider.connection, initDriftTxSig);

    await driftClient.subscribe();
    await initializeAggregatorGroup();
    await initializeAggregatorMapUSDCSOL();
    await initializeDriftUSDCSOL(driftClient);
  });

  after(async () => {
    await driftClient.unsubscribe();
  });

  it("Initialize Drift SOL/USDC Aggregator Vault", async () => {
    const tx = await adminClient.initializeDriftVault(
      VaultAssetTypeClass.SPOT_BORROW,
      USDC_MINT,
      SOL_MINT
    );

    console.log("   Initialize Drift SOL/USDC Aggregator Vault:", tx);
    getLogs(tx);
  });
});
