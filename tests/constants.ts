import { PublicKey } from "@solana/web3.js";
import { FaucetClient } from "@tkkinn/token-faucet-sdk";

export const USDC_MINT = new FaucetClient({
  wallet: null,
  provider: null,
}).findTokenMintAddress("USDC");

export const SOL_MINT = new FaucetClient({
  wallet: null,
  provider: null,
}).findTokenMintAddress("SOL");

export const USDC_ORACLE = new PublicKey(
  "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD"
);
export const SOL_ORACLE = new PublicKey(
  "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG"
);

export const DRIFT_PROGRAM_ID = new PublicKey(
  "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
);
