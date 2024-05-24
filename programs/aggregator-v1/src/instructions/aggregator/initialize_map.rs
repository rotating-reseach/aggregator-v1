use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use solana_program::address_lookup_table::instruction::{create_lookup_table_signed, extend_lookup_table};
use crate::{cpi::{CreateLookupTableCPI, ExtendLookupTableCPI}, state::{AggregatorGroup, AggregatorMap, VaultAssetType}, AddressLookupTable};

pub fn handle_initialize_aggregator_map<'info>(
    ctx: Context<'_, '_, '_, 'info, InitializeAggregatorMap<'info>>,
    asset_type: VaultAssetType,
    recent_slot: u64
) -> Result<()> {
    let mut aggregator_map = ctx.accounts.aggregator_map.load_init()?;
    aggregator_map.vault_num = 0;
    aggregator_map.bump = ctx.bumps.aggregator_map;
    aggregator_map.vault_lut = *ctx.accounts.vault_lut.key;
    drop(aggregator_map);
    
    ctx.create_lookup_table(asset_type, recent_slot)?;
    let new_address = vec![
        ctx.accounts.aggregator_map.key(),
        ctx.accounts.token_mint.key(),
        ctx.accounts.lending_program.key(),
    ];
    ctx.extend_lookup_table(asset_type, new_address)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(asset_type: VaultAssetType)]
pub struct InitializeAggregatorMap<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<AggregatorMap>(),
        seeds = [token_mint.key().as_ref(), lending_program.key().as_ref(), &[asset_type as u8]],
        bump,
    )]
    pub aggregator_map: AccountLoader<'info, AggregatorMap>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        seeds = [b"aggregator_group".as_ref()],
        bump = aggregator_group.load()?.bump,
    )]
    pub aggregator_group: AccountLoader<'info, AggregatorGroup>,

    #[account(
        mut,
        constraint = *authority.key == aggregator_group.load()?.authority,
    )]
    pub authority: Signer<'info>,

    #[account(mut)]
    /// CHECK: Check by address lookup table CPI
    pub vault_lut: AccountInfo<'info>,

    #[account(executable)]
    /// CHECK: This program won't execute in this instuction, only used to derive the PDA
    pub lending_program: AccountInfo<'info>,
    pub address_lookup_table_program: Program<'info, AddressLookupTable>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateLookupTableCPI for Context<'_, '_, '_, 'info, InitializeAggregatorMap<'info>> {
    fn create_lookup_table(&self, asset_type: VaultAssetType, recent_slot: u64) -> Result<()> {
        let token_mint_pk = self.accounts.token_mint.key();
        let lending_program_pk = self.accounts.lending_program.key();
        let signer_seeds: &[&[&[u8]]] = &[&[token_mint_pk.as_ref(), lending_program_pk.as_ref(), &[asset_type as u8], &[self.bumps.aggregator_map]]];
        let (cpi_instruction, lut_key) = create_lookup_table_signed(
            self.accounts.aggregator_map.key(),
            self.accounts.authority.key(),
            recent_slot);
        
        require_keys_eq!(self.accounts.vault_lut.key(), lut_key);

        solana_program::program::invoke_signed(
            &cpi_instruction,
            &[
                self.accounts.vault_lut.to_account_info(),
                self.accounts.aggregator_map.to_account_info(),
                self.accounts.authority.to_account_info(),
                self.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;
        Ok(())
    }
}

impl<'info> ExtendLookupTableCPI for Context<'_, '_, '_, 'info, InitializeAggregatorMap<'info>> {
    fn extend_lookup_table(&self, asset_type: VaultAssetType, new_address: Vec<Pubkey>) -> Result<()> {
        let token_mint_pk = self.accounts.token_mint.key();
        let lending_program_pk = self.accounts.lending_program.key();
        let signer_seeds: &[&[&[u8]]] = &[&[token_mint_pk.as_ref(), lending_program_pk.as_ref(),  &[asset_type as u8] , &[self.bumps.aggregator_map]]];
        let cpi_instruction = extend_lookup_table(
            self.accounts.vault_lut.key(),
            self.accounts.aggregator_map.key(),
            Some(self.accounts.authority.key()),
            new_address,
        );

        solana_program::program::invoke_signed(
            &cpi_instruction,
            &[
                self.accounts.vault_lut.to_account_info(),
                self.accounts.aggregator_map.to_account_info(),
                self.accounts.authority.to_account_info(),
                self.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;
        Ok(())
    }
}