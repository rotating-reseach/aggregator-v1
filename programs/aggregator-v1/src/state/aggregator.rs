use anchor_lang::prelude::*;

/// This account is used to store the global configuration of the aggregator.
#[account(zero_copy)]
pub struct AggregatorGroup {
    /// The authority of the aggregator group.
    pub authority: Pubkey,
    /// Bump seed for the group.
    pub bump: u8,
}

/// This account is used to store the number of vaults with specific SPL token mint for a protocol.
/// The account use token mint and protocol id as the seed to derive the account key.
#[account(zero_copy)]
pub struct AggregatorMap {
    /// The number of vaults with specific SPL token mint.
    pub vault_num: u8,
    /// Bump seed for the map.
    pub bump: u8,
    /// Address lookup table for the vaults.
    pub vault_lut: Pubkey,
}

/// This account is used to store the configuration of a vault.
#[account(zero_copy)]
pub struct Vault {
    /// The type of the vault.
    pub bump: u8,
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, PartialEq, Eq)]
pub enum VaultAssetType {
    Deposit,
    SpotBorrow,
    PerpLong,
    PerpShort,
}

impl Default for VaultAssetType {
    fn default() -> Self {
        Self::Deposit
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, PartialEq, Eq)]
pub enum VaultType {
    Spot,
    Perp,
}
