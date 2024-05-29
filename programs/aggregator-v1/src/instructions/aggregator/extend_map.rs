use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use solana_program::address_lookup_table::instruction::extend_lookup_table;

use crate::{
    check_lending_program, cpi::ExtendLookupTableCPI, AddressLookupTable, AggregatorGroup,
    AggregatorMap, VaultAssetType,
};

/// Extends the lookup table for the aggregator map.
/// New address use remaining accounts to pass in this function
pub fn handle_extend_map<'info>(
    ctx: Context<'_, '_, '_, 'info, ExtendMap<'info>>,
    asset_type: VaultAssetType,
) -> Result<()> {
    let new_address: Vec<Pubkey> = ctx
        .remaining_accounts
        .iter()
        .map(|account| account.key())
        .collect();
    ctx.extend_lookup_table(asset_type, new_address)?;
    Ok(())
}

#[derive(Accounts)]
pub struct ExtendMap<'info> {
    #[account(
        mut,
        constraint = *authority.key == aggregator_group.load()?.authority,
    )]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"aggregator_group".as_ref()],
        bump = aggregator_group.load()?.bump,
    )]
    pub aggregator_group: AccountLoader<'info, AggregatorGroup>,
    pub aggregator_map: AccountLoader<'info, AggregatorMap>,
    pub token_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint = aggregator_map.load()?.vault_lut == address_lookup_table.key(),
    )]
    /// CHECK: Check by constraint
    pub address_lookup_table: AccountInfo<'info>,
    #[account(
        executable,
        constraint = check_lending_program(*lending_program.key)?,
    )]
    /// CHECK: Check by constraint
    pub lending_program: AccountInfo<'info>,
    pub address_lookup_table_program: Program<'info, AddressLookupTable>,
    pub system_program: Program<'info, System>,
}

impl<'info> ExtendLookupTableCPI for Context<'_, '_, '_, 'info, ExtendMap<'info>> {
    fn extend_lookup_table(
        &self,
        asset_type: VaultAssetType,
        new_address: Vec<Pubkey>,
    ) -> Result<()> {
        let lending_program_pk = self.accounts.lending_program.key();
        let token_mint_pk = self.accounts.token_mint.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            token_mint_pk.as_ref(),
            lending_program_pk.as_ref(),
            &[asset_type as u8],
            &[self.accounts.aggregator_map.load()?.bump],
        ]];
        let cpi_instruction = extend_lookup_table(
            self.accounts.address_lookup_table.key(),
            self.accounts.aggregator_map.key(),
            Some(self.accounts.authority.key()),
            new_address,
        );

        solana_program::program::invoke_signed(
            &cpi_instruction,
            &[
                self.accounts.address_lookup_table.to_account_info(),
                self.accounts.aggregator_map.to_account_info(),
                self.accounts.authority.to_account_info(),
                self.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;

        Ok(())
    }
}
