import * as anchor from "@coral-xyz/anchor";
import { getLogs, v0_pack } from "./helper";
import {
  AddressLookupTableProgram,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { DRIFT_PROGRAM_ID } from "./constants";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

describe("Address Lookup Table", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  let lookupTable1: anchor.web3.PublicKey;

  const admin = anchor.Wallet.local();
  it("Create a new address lookup table", async () => {
    const slot1 = await provider.connection.getSlot();

    const [lookupTableInst1, lookupTableaddress1] =
      anchor.web3.AddressLookupTableProgram.createLookupTable({
        authority: admin.publicKey,
        payer: admin.publicKey,
        recentSlot: slot1,
      });
    lookupTable1 = lookupTableaddress1;
    const extendInstruction1 = AddressLookupTableProgram.extendLookupTable({
      payer: admin.publicKey,
      authority: admin.publicKey,
      lookupTable: lookupTable1,
      addresses: [
        SystemProgram.programId,
        AddressLookupTableProgram.programId,
        DRIFT_PROGRAM_ID,
        SYSVAR_RENT_PUBKEY,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey("BPanLhvKwatyLQwSWTbUc3R3VVwsrQWrEeTtzD2DA6TZ"),
      ],
    });
    const tx1 = await provider.connection.sendTransaction(
      await v0_pack([lookupTableInst1, extendInstruction1]),
      { skipPreflight: true }
    );
    await getLogs(tx1);
    console.log("Address Lookup Table 1: ", lookupTable1.toBase58());
  });
});
