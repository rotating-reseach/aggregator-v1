import * as anchor from "@coral-xyz/anchor";
import { AdminAggregatorClient } from "../../sdk/src/adminClient";
import { getLogs } from "../helper";

describe("Initialize Aggregator User", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const admin = anchor.Wallet.local();
  const adminClient = new AdminAggregatorClient({
    provider: provider,
    wallet: admin,
    opts: { skipPreflight: true },
  });

  it("Initialize Aggregator User", async () => {
    const tx = await adminClient.initializeUser();
    console.log("   Initialize User:", tx);
    getLogs(tx);
  });
});
