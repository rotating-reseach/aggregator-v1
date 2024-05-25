import {
  TransactionInstruction,
  Keypair,
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableAccount,
  PublicKey,
  AddressLookupTableProgram,
  AddressLookupTableInstruction,
} from "@solana/web3.js";
import { AggregatorClient } from "./client";
import { VaultAssetType } from "./type";
import { BN } from "@coral-xyz/anchor";
import { getAggregatorMapAddress } from "./address/aggregator";

export class AdminAggregatorClient extends AggregatorClient {
  public async getInitializeAggregatorGroupIx(): Promise<TransactionInstruction> {
    const ix = await this.program.methods
      .initializeAggregatorGroup()
      .accounts({
        authority: this.wallet.publicKey,
      })
      .instruction();
    return ix;
  }

  public async initializeAggregatorGroup(): Promise<string> {
    const ix = await this.getInitializeAggregatorGroupIx();
    const txSig = await this.provider.connection.sendTransaction(
      await this.v0_pack([ix]),
      this.opts
    );
    return txSig;
  }

  public async getInitializeAggregatorMapIx(
    asset_type: VaultAssetType,
    token_mint: PublicKey,
    lending_program: PublicKey
  ): Promise<TransactionInstruction> {
    const [_, vault_lookupTable] = AddressLookupTableProgram.createLookupTable({
      authority: getAggregatorMapAddress(
        asset_type,
        token_mint,
        lending_program,
        this.program.programId
      ),
      payer: this.wallet.publicKey,
      recentSlot: await this.provider.connection.getSlot(),
    });

    let ix: TransactionInstruction;
    if (asset_type == VaultAssetType.DEPOSIT) {
      ix = await this.program.methods
        .initializeAggregatorMap(
          VaultAssetType.DEPOSIT,
          new BN(await this.provider.connection.getSlot())
        )
        .accounts({
          aggregatorMap: getAggregatorMapAddress(
            VaultAssetType.DEPOSIT,
            token_mint,
            lending_program,
            this.program.programId
          ),
          authority: this.wallet.publicKey,
          tokenMint: token_mint,
          vaultLut: vault_lookupTable,
          lendingProgram: lending_program,
        })
        .instruction();
    } else if (asset_type == VaultAssetType.SPOT_BORROW) {
      ix = await this.program.methods
        .initializeAggregatorMap(
          VaultAssetType.SPOT_BORROW,
          new BN(await this.provider.connection.getSlot())
        )
        .accounts({
          aggregatorMap: getAggregatorMapAddress(
            VaultAssetType.SPOT_BORROW,
            token_mint,
            lending_program,
            this.program.programId
          ),
          authority: this.wallet.publicKey,
          tokenMint: token_mint,
          vaultLut: vault_lookupTable,
          lendingProgram: lending_program,
        })
        .instruction();
    } else if (asset_type == VaultAssetType.PERPETIAL_LONG) {
      ix = await this.program.methods
        .initializeAggregatorMap(
          VaultAssetType.PERPETIAL_LONG,
          new BN(await this.provider.connection.getSlot())
        )
        .accounts({
          aggregatorMap: getAggregatorMapAddress(
            VaultAssetType.PERPETIAL_LONG,
            token_mint,
            lending_program,
            this.program.programId
          ),
          authority: this.wallet.publicKey,
          tokenMint: token_mint,
          vaultLut: vault_lookupTable,
          lendingProgram: lending_program,
        })
        .instruction();
    } else if (asset_type == VaultAssetType.PERPETIAL_SHORT) {
      ix = await this.program.methods
        .initializeAggregatorMap(
          VaultAssetType.PERPETIAL_SHORT,
          new BN(await this.provider.connection.getSlot())
        )
        .accounts({
          aggregatorMap: getAggregatorMapAddress(
            VaultAssetType.PERPETIAL_SHORT,
            token_mint,
            lending_program,
            this.program.programId
          ),
          authority: this.wallet.publicKey,
          tokenMint: token_mint,
          vaultLut: vault_lookupTable,
          lendingProgram: lending_program,
        })
        .instruction();
    }
    return ix;
  }

  public async initializeAggregatorMap(
    asset_type: VaultAssetType,
    token_mint: PublicKey,
    lending_program: PublicKey
  ) {
    const ix = await this.getInitializeAggregatorMapIx(
      asset_type,
      token_mint,
      lending_program
    );
    const txSig = await this.provider.connection.sendTransaction(
      await this.v0_pack([ix]),
      this.opts
    );
    return txSig;
  }

  async v0_pack(
    instructions: TransactionInstruction[],
    lookupTablePk?: PublicKey[],
    signer?: Keypair
  ) {
    let lookupTableAccount: AddressLookupTableAccount[] = [];
    if (lookupTablePk) {
      for (let i = 0; i < lookupTablePk.length; i++) {
        const lookupTable = (
          await this.provider.connection.getAddressLookupTable(lookupTablePk[i])
        ).value;
        lookupTableAccount.push(lookupTable);
      }
    }

    const blockhash = await this.provider.connection
      .getLatestBlockhash()
      .then((res) => res.blockhash);

    const messageV0 = new TransactionMessage({
      payerKey: this.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message(lookupTableAccount);

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([this.wallet.payer]);
    if (signer) transaction.sign([signer]);

    return transaction;
  }
}
