import { PublicKey } from "@solana/web3.js";
import { VaultAssetType } from "../type";

export function getAggregatorGroupAddress(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("aggregator_group")],
    programId
  )[0];
}

export function getAggregatorMapAddress(
  asset_type: VaultAssetType,
  token_mint: PublicKey,
  lending_program: PublicKey,
  programId: PublicKey
): PublicKey {
  if (asset_type == VaultAssetType.DEPOSIT) {
    return PublicKey.findProgramAddressSync(
      [token_mint.toBuffer(), lending_program.toBuffer(), Buffer.from([0])],
      programId
    )[0];
  } else if (asset_type == VaultAssetType.SPOT_BORROW) {
    return PublicKey.findProgramAddressSync(
      [token_mint.toBuffer(), lending_program.toBuffer(), Buffer.from([1])],
      programId
    )[0];
  } else if (asset_type == VaultAssetType.PERPETIAL_LONG) {
    return PublicKey.findProgramAddressSync(
      [token_mint.toBuffer(), lending_program.toBuffer(), Buffer.from([2])],
      programId
    )[0];
  } else if (asset_type == VaultAssetType.PERPETIAL_SHORT) {
    return PublicKey.findProgramAddressSync(
      [token_mint.toBuffer(), lending_program.toBuffer(), Buffer.from([3])],
      programId
    )[0];
  }
}
