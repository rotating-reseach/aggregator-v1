import { PublicKey } from "@drift-labs/sdk";
import {
  VaultAssetType,
  VaultAssetTypeClass,
  VaultAssetTypeEnum,
  VaultTypeEnum,
} from "../type";

export function getDriftAggregatorVaultNonce(
  quoteMint: PublicKey,
  baseMint: PublicKey,
  baseAsseType: VaultAssetType,
  driftProgramId: PublicKey,
  aggregatorProgramId: PublicKey
): [PublicKey, number] {
  switch (baseAsseType) {
    case VaultAssetTypeClass.SPOT_BORROW:
      return PublicKey.findProgramAddressSync(
        [
          quoteMint.toBuffer(),
          baseMint.toBuffer(),
          driftProgramId.toBuffer(),
          Buffer.from([VaultTypeEnum.SPOT]),
        ],
        aggregatorProgramId
      );
    case VaultAssetTypeClass.PERPETUAL_LONG:
      return PublicKey.findProgramAddressSync(
        [
          quoteMint.toBuffer(),
          baseMint.toBuffer(),
          driftProgramId.toBuffer(),
          Buffer.from([VaultTypeEnum.PERPETUAL]),
        ],
        aggregatorProgramId
      );
    case VaultAssetTypeClass.PERPETUAL_SHORT:
      return PublicKey.findProgramAddressSync(
        [
          quoteMint.toBuffer(),
          baseMint.toBuffer(),
          driftProgramId.toBuffer(),
          Buffer.from([VaultTypeEnum.PERPETUAL]),
        ],
        aggregatorProgramId
      );
  }
}

export function getDriftAggregatorVault(
  quoteMint: PublicKey,
  baseMint: PublicKey,
  baseAsseType: VaultAssetType,
  driftProgramId: PublicKey,
  aggregatorProgramId: PublicKey
): PublicKey {
  return getDriftAggregatorVaultNonce(
    quoteMint,
    baseMint,
    baseAsseType,
    driftProgramId,
    aggregatorProgramId
  )[0];
}
