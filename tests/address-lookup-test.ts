import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { v0_pack } from "./helper";
import { AddressLookupTableProgram, Keypair, SystemProgram } from "@solana/web3.js";
import { confirmTransaction } from "@solana-developers/helpers";

describe("aggregator-v1", () => {
    // Configure the client to use the local cluster.
    const connection = anchor.AnchorProvider.env().connection;
    anchor.setProvider(anchor.AnchorProvider.env());

    const payer = anchor.Wallet.local();
    const payer2 = Keypair.generate();
    let lookupTable1: anchor.web3.PublicKey;
    let lookupTable2: anchor.web3.PublicKey;

    const target1 = Keypair.generate();
    const target2 = Keypair.generate();

    before(async () => {
        const transfer = SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: payer2.publicKey,
            lamports: 1000000000,
        });
        const tx = await connection.sendTransaction(await v0_pack([transfer]));
        console.log("Your transaction signature", tx);
    });

    it("Is initialized!", async () => {
        // Create Lookup Table
        const slot1 = await connection.getSlot();

        const [lookupTableInst1, lookupTableaddress1] =
            anchor.web3.AddressLookupTableProgram.createLookupTable({
                authority: payer.publicKey,
                payer: payer.publicKey,
                recentSlot: slot1,
            });
        lookupTable1 = lookupTableaddress1;
        console.log("lookup table address:", lookupTable1.toBase58());
        const tx1 = await connection.sendTransaction(await v0_pack([lookupTableInst1]), {skipPreflight: true});
        console.log("Your transaction signature", tx1);

        const slot2 = await connection.getSlot();
        const [lookupTableInst2, lookupTableaddress2] =
            anchor.web3.AddressLookupTableProgram.createLookupTable({
                authority: payer2.publicKey,
                payer: payer2.publicKey,
                recentSlot: slot2,
            });
        lookupTable2 = lookupTableaddress2;
        console.log("lookup table address:", lookupTable2.toBase58());

        const tx2 = await connection.sendTransaction(await v0_pack([lookupTableInst2], payer2), {skipPreflight: true});
        console.log("Your transaction signature", tx2);

        // Add address into lookup table
        const extendInstruction1 = AddressLookupTableProgram.extendLookupTable({
            payer: payer.publicKey,
            authority: payer.publicKey,
            lookupTable: lookupTable1,
            addresses: [
              payer.publicKey,
              SystemProgram.programId,
              target1.publicKey,
            ],
        });
        const extendInstruction2 = AddressLookupTableProgram.extendLookupTable({
            payer: payer2.publicKey,
            authority: payer2.publicKey,
            lookupTable: lookupTable2,
            addresses: [
              payer2.publicKey,
              SystemProgram.programId,
              target2.publicKey,
            ],
        });

        const tx3 = await connection.sendTransaction(await v0_pack([extendInstruction1, extendInstruction2], payer2), {skipPreflight: true});
        console.log("Your transaction signature", tx3);
        await confirmTransaction(connection, tx3);
    });

    it("Transfers!", async () => {
        const transfers1 = SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: target1.publicKey,
            lamports: 1000000,
        });
        const transfers2 = SystemProgram.transfer({
            fromPubkey: payer2.publicKey,
            toPubkey: target2.publicKey,
            lamports: 1000000,
        });

        await sleep(10000);
        
        const lookupTableAccount1 = (
            await connection.getAddressLookupTable(lookupTable1)
          ).value;
        const lookupTableAccount2 = (
            await connection.getAddressLookupTable(lookupTable2)
          ).value;

        const tx = await connection.sendTransaction(await v0_pack([transfers1, transfers2], payer2, [lookupTableAccount1, lookupTableAccount2]), {skipPreflight: true});
        console.log("Your transaction signature", tx);

        const accountInfo = await connection.getParsedAccountInfo(lookupTable1);
        console.log("lookup table account owner:", accountInfo.value.owner.toBase58());
    });
});

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}