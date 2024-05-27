export type VaultAssetType =
  | { deposit: {} }
  | { spotBorrow: {} }
  | { perpLong: {} }
  | { perpShort: {} };

export enum VaultAssetTypeEnum {
  DEPOSIT = 0,
  SPOT_BORROW = 1,
  PERPETUAL_LONG = 2,
  PERPETUAL_SHORT = 3,
}

export class VaultAssetTypeClass {
  static readonly DEPOSIT: VaultAssetType = { deposit: {} };
  static readonly SPOT_BORROW: VaultAssetType = { spotBorrow: {} };
  static readonly PERPETUAL_LONG: VaultAssetType = { perpLong: {} };
  static readonly PERPETUAL_SHORT: VaultAssetType = { perpShort: {} };
}

export enum VaultTypeEnum {
  SPOT = 0,
  PERPETUAL = 1,
}
