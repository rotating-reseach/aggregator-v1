import { PublicKey } from "@solana/web3.js";
import {
  VaultAssetType,
  VaultAssetTypeClass,
  VaultAssetTypeEnum,
} from "../type";

export function getAggregatorGroupAddressNonce(
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("aggregator_group")],
    programId
  );
}

export function getAggregatorGroupAddress(programId: PublicKey): PublicKey {
  return getAggregatorGroupAddressNonce(programId)[0];
}

export function getAggregatorMapAddressNonce(
  assetType: VaultAssetType,
  tokenMint: PublicKey,
  lendingProgram: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  let assetTypeEnum: VaultAssetTypeEnum;

  switch (assetType) {
    case VaultAssetTypeClass.DEPOSIT:
      assetTypeEnum = VaultAssetTypeEnum.DEPOSIT;
      break;
    case VaultAssetTypeClass.SPOT_BORROW:
      assetTypeEnum = VaultAssetTypeEnum.SPOT_BORROW;
      break;
    case VaultAssetTypeClass.PERPETUAL_LONG:
      assetTypeEnum = VaultAssetTypeEnum.PERPETUAL_LONG;
      break;
    case VaultAssetTypeClass.PERPETUAL_SHORT:
      assetTypeEnum = VaultAssetTypeEnum.PERPETUAL_SHORT;
      break;
    default:
      throw new Error("Invalid asset type");
  }

  return PublicKey.findProgramAddressSync(
    [
      tokenMint.toBuffer(),
      lendingProgram.toBuffer(),
      Buffer.from([assetTypeEnum]),
    ],
    programId
  );
}
export function getAggregatorMapAddress(
  asset_type: VaultAssetType,
  token_mint: PublicKey,
  lending_program: PublicKey,
  programId: PublicKey
): PublicKey {
  return getAggregatorMapAddressNonce(
    asset_type,
    token_mint,
    lending_program,
    programId
  )[0];
}

export const AGGREGATOR_PROGRAM_LOOKUP_TABLE = new PublicKey(
  "JDwdqVPbZ3VKPyVLN8FTE4LYJ2xbKUFMqF5XxjHTKzQL"
);
