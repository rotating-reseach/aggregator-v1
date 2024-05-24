import * as anchor from "@coral-xyz/anchor";
import { confirmTransaction } from "@solana-developers/helpers";
import { AdminAggregatorClient } from "../../sdk/src/adminClient";
import { VaultAssetType } from "../../sdk/src/type";
import { createToken, getLogs } from "../helper";
import { AddressLookupTableProgram } from "@solana/web3.js";
import { DRIFT_PROGRAM_ID, USDC_MINT } from "../constants";

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

    before("Initialize Aggregator Group", async () => {
        const tx = await adminClient.initializeAggregatorGroup();
        await confirmTransaction(provider.connection, tx);
        console.log("   Initialize Aggregator Group:", tx);
    });

    before("Create Token", async () => {
        const tx = await createToken("USDC", 6);
        await confirmTransaction(provider.connection, tx);
        console.log("   Create Token:", tx);
    });

    it("Initialize Aggregator Token for drift USDC deposit", async () => {
        const tx = await adminClient.initializeAggregatorMap(VaultAssetType.DEPOSIT, USDC_MINT, DRIFT_PROGRAM_ID);
        console.log("   Initialize Aggregator Token:", tx);
        await getLogs(tx);
    });
});
