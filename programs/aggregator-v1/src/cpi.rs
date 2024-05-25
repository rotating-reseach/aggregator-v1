use anchor_lang::prelude::*;

use crate::VaultAssetType;

// Address Lookup Table CPI instuction
pub trait CreateLookupTableCPI {
    fn create_lookup_table(&self, asset_type: VaultAssetType, recent_slot: u64) -> Result<()>;
}

pub trait ExtendLookupTableCPI {
    fn extend_lookup_table(
        &self,
        asset_type: VaultAssetType,
        new_address: Vec<Pubkey>,
    ) -> Result<()>;
}

// Drift CPI instruction
