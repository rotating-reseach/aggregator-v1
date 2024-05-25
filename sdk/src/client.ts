import { AnchorProvider, Program } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AggregatorV1 } from "./types/aggregator_v1";
import { ConfirmOptions, PublicKey } from "@solana/web3.js";
import { AggregatorClientConfig } from "./config";
import idl from "./idl/aggregator_v1.json";
import { VaultAssetType } from "./type";
import { getAggregatorMapAddress } from "./address/aggregator";

export class AggregatorClient {
  provider: AnchorProvider;
  wallet: NodeWallet;
  public program: Program<AggregatorV1>;
  driftProgramId?: PublicKey;
  opts?: ConfirmOptions;

  public constructor(config: AggregatorClientConfig) {
    this.provider = config.provider;
    this.wallet = config.wallet;
    if (!config.program) {
      const a = JSON.stringify(idl);
      const token_faucet_idl = JSON.parse(a);
      this.program = new Program(token_faucet_idl);
    } else {
      this.program = config.program;
    }
    this.opts = config.opts;
  }

  async getVaultLookupTableAddress(
    asset_type: VaultAssetType,
    token_mint: PublicKey,
    lending_program: PublicKey
  ): Promise<PublicKey> {
    return (
      await this.program.account.aggregatorMap.fetch(
        getAggregatorMapAddress(
          asset_type,
          token_mint,
          lending_program,
          this.program.programId
        )
      )
    ).vaultLut;
  }
}
