import { PublicKey } from "@solana/web3.js";
import { FaucetClient } from "@tkkinn/token-faucet-sdk";

export const USDC_MINT = new FaucetClient({
    wallet: null,
    provider: null,
}).findTokenMintAddress("USDC");

export const DRIFT_PROGRAM_ID = new PublicKey("dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH");