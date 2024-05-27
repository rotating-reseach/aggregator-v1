use crate::instructions::*;
use crate::state::*;
use anchor_lang::prelude::*;

declare_id!("BPanLhvKwatyLQwSWTbUc3R3VVwsrQWrEeTtzD2DA6TZ");

mod cpi;
mod error;
mod instructions;
mod state;
mod validation;

#[program]
pub mod aggregator_v1 {
    use super::*;

    // Aggregator Functions
    pub fn initialize_aggregator_group(ctx: Context<InitializeAggregatorGroup>) -> Result<()> {
        instructions::aggregator::handle_initialize_aggregator_group(ctx)
    }

    pub fn initialize_aggregator_map<'info>(
        ctx: Context<'_, '_, '_, 'info, InitializeAggregatorMap<'info>>,
        _token_type: VaultAssetType,
        recent_slot: u64,
    ) -> Result<()> {
        instructions::aggregator::handle_initialize_aggregator_map(ctx, _token_type, recent_slot)
    }

    pub fn aggregator_map_extend_lookup_table<'info>(
        ctx: Context<'_, '_, '_, 'info, MapExtendLookupTable<'info>>,
        asset_type: VaultAssetType,
    ) -> Result<()> {
        instructions::aggregator::handle_map_extend_lookup_table(ctx, asset_type)
    }

    // Drift Functions
    pub fn initialize_drift_vault<'info>(
        ctx: Context<'_, '_, '_, 'info, InitializeDriftVault<'info>>,
        base_asset_type: VaultAssetType,
    ) -> Result<()> {
        instructions::drift::handle_initialize_drift_vault(ctx, base_asset_type)
    }
}
