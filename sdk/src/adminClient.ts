import { TransactionInstruction, Keypair, TransactionMessage, VersionedTransaction, AddressLookupTableAccount, PublicKey, AddressLookupTableProgram, AddressLookupTableInstruction } from "@solana/web3.js";
import { AggregatorClient } from "./client";
import { VaultAssetType } from "./type";
import { BN } from "@coral-xyz/anchor";

export class AdminAggregatorClient extends AggregatorClient {
    public async buildInitializeAggregatorGroupTx(): Promise<TransactionInstruction> {
        const tx = await this.program.methods.initializeAggregatorGroup().accounts({
            authority: this.wallet.publicKey,
        }).instruction();
        return tx;
    }

    public async initializeAggregatorGroup(): Promise<string> {
        const tx = await this.buildInitializeAggregatorGroupTx();
        const txSig = await this.provider.connection.sendTransaction(await this.v0_pack([tx]), this.opts);
        return txSig;
    }

    public async buildinitializeAggregatorMapTx(asset_type: VaultAssetType, token_mint: PublicKey, lending_program: PublicKey): Promise<TransactionInstruction> {
        const [_, vault_lookupTable] =
            AddressLookupTableProgram.createLookupTable({
                authority: this.getaggregatorMapAddress(asset_type, token_mint, lending_program),
                payer: this.wallet.publicKey,
                recentSlot: await this.provider.connection.getSlot(),
            });

        let tx: TransactionInstruction;
        if (asset_type == VaultAssetType.DEPOSIT) {
            tx = await this.program.methods.initializeAggregatorMap(VaultAssetType.DEPOSIT, new BN(await this.provider.connection.getSlot()) ).accounts({
                aggregatorMap: this.getaggregatorMapAddress(VaultAssetType.DEPOSIT, token_mint, lending_program),
                authority: this.wallet.publicKey,
                tokenMint: token_mint,
                vaultLut: vault_lookupTable,
                lendingProgram: lending_program,
               
            }).instruction();
        } else if (asset_type == VaultAssetType.SPOT_BORROW) {
            tx = await this.program.methods.initializeAggregatorMap(VaultAssetType.SPOT_BORROW, new BN(await this.provider.connection.getSlot())).accounts({
                aggregatorMap: this.getaggregatorMapAddress(VaultAssetType.SPOT_BORROW, token_mint, lending_program),
                authority: this.wallet.publicKey,
                tokenMint: token_mint,
                vaultLut: vault_lookupTable,
                lendingProgram: lending_program,
               
            }).instruction();
        } else if (asset_type == VaultAssetType.PERPETIAL_LONG) {
            tx = await this.program.methods.initializeAggregatorMap(VaultAssetType.PERPETIAL_LONG, new BN(await this.provider.connection.getSlot())).accounts({
                aggregatorMap: this.getaggregatorMapAddress(VaultAssetType.PERPETIAL_LONG, token_mint, lending_program),
                authority: this.wallet.publicKey,
                tokenMint: token_mint,
                vaultLut: vault_lookupTable,
                lendingProgram: lending_program,
               
            }).instruction();
        } else if (asset_type == VaultAssetType.PERPETIAL_SHORT) {
            tx = await this.program.methods.initializeAggregatorMap(VaultAssetType.PERPETIAL_SHORT, new BN(await this.provider.connection.getSlot())).accounts({
                aggregatorMap: this.getaggregatorMapAddress(VaultAssetType.PERPETIAL_SHORT, token_mint, lending_program),
                authority: this.wallet.publicKey,
                tokenMint: token_mint,
                vaultLut: vault_lookupTable,
                lendingProgram: lending_program,
               
            }).instruction();
        }
        return tx;
    }

    public async initializeAggregatorMap(asset_type: VaultAssetType, token_mint: PublicKey, lending_program: PublicKey) {
        const tx = await this.buildinitializeAggregatorMapTx(asset_type, token_mint, lending_program);
        const txSig = await this.provider.connection.sendTransaction(await this.v0_pack([tx]), this.opts);
        return txSig;
    }

    async v0_pack(instructions: TransactionInstruction[], lookupTablePk?: PublicKey[], signer?: Keypair) {
        let lookupTableAccount: AddressLookupTableAccount[] = [];
        if (lookupTablePk) {
            for (let i = 0; i < lookupTablePk.length; i++) {
                const lookupTable = (await this.provider.connection.getAddressLookupTable(lookupTablePk[i])).value;
                lookupTableAccount.push(lookupTable);
            }
        }

        const blockhash = await this.provider.connection
            .getLatestBlockhash()
            .then(res => res.blockhash);

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