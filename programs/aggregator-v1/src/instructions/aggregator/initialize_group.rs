use anchor_lang::prelude::*;

use crate::state::AggregatorGroup;

pub fn handle_initialize_aggregator_group(ctx: Context<InitializeAggregatorGroup>) -> Result<()> {
    let mut aggregator_group = ctx.accounts.aggregator_group.load_init()?;
    aggregator_group.authority = *ctx.accounts.authority.key;
    aggregator_group.bump = ctx.bumps.aggregator_group;
    drop(aggregator_group);
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeAggregatorGroup<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<AggregatorGroup>(),
        seeds = [b"aggregator_group".as_ref()],
        bump,
    )]
    pub aggregator_group: AccountLoader<'info, AggregatorGroup>,

    pub system_program: Program<'info, System>,
}
