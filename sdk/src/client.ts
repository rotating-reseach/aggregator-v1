import { AnchorProvider, Program } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AggregatorV1 } from "./types/aggregator_v1";
import { ConfirmOptions, PublicKey } from "@solana/web3.js";
import { AggregatorClientConfig } from "./config";
import idl from "./idl/aggregator_v1.json";
import { VaultAssetType } from "./type";

export class AggregatorClient {
    provider: AnchorProvider;
    wallet: NodeWallet;
    public program: Program<AggregatorV1>;
    opts?: ConfirmOptions;

    public constructor(config: AggregatorClientConfig) {
        this.provider = config.provider;
        this.wallet = config.wallet;
        if (!config.program) {
			const a = JSON.stringify(idl)
			const token_faucet_idl = JSON.parse(a)
			this.program = new Program(token_faucet_idl);
		} else {
			this.program = config.program;
		}
        this.opts = config.opts;
    }

    public getAggregatorGroupAddress(): PublicKey {
        return PublicKey.findProgramAddressSync([Buffer.from("aggregator_group")], this.program.programId)[0];
    }

    public getaggregatorMapAddress(asset_type: VaultAssetType, token_mint: PublicKey, lending_program: PublicKey): PublicKey {
        if (asset_type == VaultAssetType.DEPOSIT) {
            return PublicKey.findProgramAddressSync( [token_mint.toBuffer(), lending_program.toBuffer(), Buffer.from([0])], this.program.programId)[0];
        } else if (asset_type == VaultAssetType.SPOT_BORROW) {
            return PublicKey.findProgramAddressSync( [token_mint.toBuffer(), lending_program.toBuffer(), Buffer.from([1])], this.program.programId)[0];
        } else if (asset_type == VaultAssetType.PERPETIAL_LONG) {
            return PublicKey.findProgramAddressSync( [token_mint.toBuffer(), lending_program.toBuffer(), Buffer.from([2])], this.program.programId)[0];
        } else if (asset_type == VaultAssetType.PERPETIAL_SHORT) {
            return PublicKey.findProgramAddressSync( [token_mint.toBuffer(), lending_program.toBuffer(), Buffer.from([3])], this.program.programId)[0];
        }
    }

    public async getVaultLookupTableAddress(asset_type: VaultAssetType, token_mint: PublicKey, lending_program: PublicKey): Promise<PublicKey> {
        return (await this.program.account.aggregatorMap.fetch(this.getaggregatorMapAddress(asset_type, token_mint, lending_program))).vaultLut;
    }

    
    
}