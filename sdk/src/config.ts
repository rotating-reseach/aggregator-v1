import { AnchorProvider, Program } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { ConfirmOptions, PublicKey } from "@solana/web3.js";
import { AggregatorV1 } from "./types/aggregator_v1";

export type AggregatorClientConfig = {
  wallet: NodeWallet;
  provider: AnchorProvider;
  program?: Program<AggregatorV1>;
  programId?: PublicKey;
  driftProgramId?: PublicKey;
  opts?: ConfirmOptions;
};
