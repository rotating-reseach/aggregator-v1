use crate::instructions::*;
use crate::state::*;
use anchor_lang::prelude::*;

declare_id!("BPanLhvKwatyLQwSWTbUc3R3VVwsrQWrEeTtzD2DA6TZ");

mod cpi;
mod instructions;
mod state;

#[program]
pub mod aggregator_v1 {
    use super::*;

    // Aggregator Functions
    pub fn initialize_aggregator_group(ctx: Context<InitializeAggregatorGroup>) -> Result<()> {
        instructions::aggregator::handle_initialize_aggregator_group(ctx)
    }

    pub fn initialize_aggregator_token<'info>(
        ctx: Context<'_, '_, '_, 'info, InitializeAggregatorToken<'info>>,
        _token_type: VaultAssetType,
        recent_slot: u64
    ) -> Result<()> {
        instructions::aggregator::handle_initialize_aggregator_token(ctx, _token_type, recent_slot)
    }
}
