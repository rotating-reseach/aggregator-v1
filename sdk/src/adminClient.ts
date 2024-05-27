import {
  TransactionInstruction,
  Keypair,
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableAccount,
  PublicKey,
  AddressLookupTableProgram,
} from "@solana/web3.js";
import { AggregatorClient } from "./client";
import { VaultAssetType, VaultAssetTypeClass } from "./type";
import { BN } from "@coral-xyz/anchor";
import {
  getAggregatorMapAddress,
} from "./address/aggregator";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { getDriftAggregatorVault } from "./address/drift";
import * as drift from "@drift-labs/sdk";

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
    assetType: VaultAssetType,
    tokenMint: PublicKey,
    lendingProgram: PublicKey
  ): Promise<TransactionInstruction> {
    const [_, vaultLut] = AddressLookupTableProgram.createLookupTable({
      authority: getAggregatorMapAddress(
        assetType,
        tokenMint,
        lendingProgram,
        this.program.programId
      ),
      payer: this.wallet.publicKey,
      recentSlot: await this.provider.connection.getSlot(),
    });

    const ix = await this.program.methods
      .initializeAggregatorMap(
        assetType,
        new BN(await this.provider.connection.getSlot())
      )
      .accounts({
        aggregatorMap: getAggregatorMapAddress(
          assetType,
          tokenMint,
          lendingProgram,
          this.program.programId
        ),
        authority: this.wallet.publicKey,
        tokenMint,
        vaultLut,
        lendingProgram,
      })
      .instruction();
    return ix;
  }

  public async initializeAggregatorMap(
    assetType: VaultAssetType,
    tokenMint: PublicKey,
    lendingProgram: PublicKey
  ) {
    const ix = await this.getInitializeAggregatorMapIx(
      assetType,
      tokenMint,
      lendingProgram
    );
    const txSig = await this.provider.connection.sendTransaction(
      await this.v0_pack([ix]),
      this.opts
    );
    return txSig;
  }

  // Drift Functions

  public async getInitializeDrfitVaultIx(
    baseAssetType: VaultAssetType,
    quoteMint: PublicKey,
    baseMint: PublicKey
  ): Promise<TransactionInstruction[]> {
    let ix: TransactionInstruction[] = [];

    const vault = getDriftAggregatorVault(
      quoteMint,
      baseMint,
      baseAssetType,
      this.driftProgramId,
      this.program.programId
    );
    const driftUser = drift.getUserAccountPublicKeySync(
      this.driftProgramId,
      vault
    );
    const driftUserStats = drift.getUserStatsAccountPublicKey(
      this.driftProgramId,
      vault
    );
    const driftState = await drift.getDriftStateAccountPublicKey(
      this.driftProgramId
    );

    const initDriftVaultIx = await this.program.methods
      .initializeDriftVault(baseAssetType)
      .accounts({
        authority: this.wallet.publicKey,
        vault,
        quoteAggregatorMap: getAggregatorMapAddress(
          VaultAssetTypeClass.DEPOSIT,
          quoteMint,
          this.driftProgramId,
          this.program.programId
        ),
        baseAggregatorMap: getAggregatorMapAddress(
          baseAssetType,
          baseMint,
          this.driftProgramId,
          this.program.programId
        ),
        quoteMint,
        baseMint,
        driftUser,
        driftUserStats,
        driftState,
      })
      .instruction();

    const createVaultQuoteATAIx = createAssociatedTokenAccountInstruction(
      this.wallet.publicKey,
      getAssociatedTokenAddressSync(quoteMint, vault, true),
      vault,
      quoteMint
    );

    const createVaultBaseATAIx = createAssociatedTokenAccountInstruction(
      this.wallet.publicKey,
      getAssociatedTokenAddressSync(baseMint, vault, true),
      vault,
      baseMint
    );

    const extendQuoteMapLookupTableIx = await this.program.methods
      .aggregatorMapExtendLookupTable(VaultAssetTypeClass.DEPOSIT)
      .accounts({
        authority: this.wallet.publicKey,
        aggregatorMap: getAggregatorMapAddress(
          VaultAssetTypeClass.DEPOSIT,
          quoteMint,
          this.driftProgramId,
          this.program.programId
        ),
        tokenMint: quoteMint,
        addressLookupTable: await this.getVaultLookupTablePublicKey(
          VaultAssetTypeClass.DEPOSIT,
          quoteMint,
          this.driftProgramId
        ),
        lendingProgram: this.driftProgramId,
      })
      .remainingAccounts([
        { pubkey: vault, isWritable: false, isSigner: false },
        { pubkey: driftUser, isWritable: false, isSigner: false },
        { pubkey: driftUserStats, isWritable: false, isSigner: false },
      ])
      .instruction();

    const extendBaseMapLookupTableIx = await this.program.methods
      .aggregatorMapExtendLookupTable(baseAssetType)
      .accounts({
        authority: this.wallet.publicKey,
        aggregatorMap: getAggregatorMapAddress(
          baseAssetType,
          baseMint,
          this.driftProgramId,
          this.program.programId
        ),
        tokenMint: baseMint,
        addressLookupTable: await this.getVaultLookupTablePublicKey(
          baseAssetType,
          baseMint,
          this.driftProgramId
        ),
        lendingProgram: this.driftProgramId,
      })
      .remainingAccounts([
        { pubkey: vault, isWritable: false, isSigner: false },
        { pubkey: driftUser, isWritable: false, isSigner: false },
        { pubkey: driftUserStats, isWritable: false, isSigner: false },
      ])
      .instruction();

    ix.push(
      initDriftVaultIx,
      createVaultQuoteATAIx,
      createVaultBaseATAIx,
      extendQuoteMapLookupTableIx,
      extendBaseMapLookupTableIx
    );
    return ix;
  }

  public async initializeDriftVault(
    base_asset_type: VaultAssetType,
    quote_mint: PublicKey,
    base_mint: PublicKey
  ): Promise<string> {
    const ix = await this.getInitializeDrfitVaultIx(
      base_asset_type,
      quote_mint,
      base_mint
    );
    const txSig = await this.provider.connection.sendTransaction(
      await this.v0_pack(ix),
      this.opts
    );
    return txSig;
  }
}

