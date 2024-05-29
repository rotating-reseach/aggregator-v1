use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use drift::{cpi::accounts::{InitializeUser, InitializeUserStats}, program::Drift};
use solana_program::program_pack::Sealed;

use crate::{cpi::DriftInitializeUserCPI, AggregatorGroup, AggregatorMap, Vault, VaultAssetType, VaultType};

pub fn handle_initialize_drift_vault<'info>(
    ctx: Context<'_, '_, '_, 'info, InitializeDriftVault<'info>>,
    base_asset_type: VaultAssetType,
) -> Result<()> {
    let mut quote_aggregator_map = ctx.accounts.quote_aggregator_map.load_mut()?;
    quote_aggregator_map.vault_num += 1;
    drop(quote_aggregator_map);

    let mut base_aggregator_map = ctx.accounts.base_aggregator_map.load_mut()?;
    base_aggregator_map.vault_num += 1;
    drop(base_aggregator_map);

    let mut vault = ctx.accounts.vault.load_init()?;
    vault.bump = ctx.bumps.vault;
    drop(vault);

    ctx.drift_initialize_user_stats(base_asset_type)?;
    ctx.drift_initialize_user(base_asset_type)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(_base_asset_type: VaultAssetType)]
pub struct InitializeDriftVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<Vault>(),
        seeds = [quote_mint.key().as_ref(), base_mint.key().as_ref(), drift_program.key().as_ref(), &[if _base_asset_type == VaultAssetType::SpotBorrow { VaultType::Spot } else { VaultType::Perp } as u8]],
        bump,
    )]
    pub vault: AccountLoader<'info, Vault>,

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

    #[account(
        mut,
        seeds = [quote_mint.key().as_ref(), drift_program.key().as_ref(), &[VaultAssetType::Deposit as u8]],
        bump = quote_aggregator_map.load()?.bump,
    )]
    pub quote_aggregator_map: AccountLoader<'info, AggregatorMap>,

    #[account(
        mut,
        seeds = [base_mint.key().as_ref(), drift_program.key().as_ref(), &[_base_asset_type as u8]],
        bump = base_aggregator_map.load()?.bump,
    )]
    pub base_aggregator_map: AccountLoader<'info, AggregatorMap>,

    pub quote_mint: Box<Account<'info, Mint>>,
    pub base_mint: Box<Account<'info, Mint>>,

    /// CHECK: checked in drift cpi
    #[account(mut)]
    pub drift_user_stats: AccountInfo<'info>,
    /// CHECK: checked in drift cpi
    #[account(mut)]
    pub drift_user: AccountInfo<'info>,
    /// CHECK: checked in drift cpi
    #[account(mut)]
    pub drift_state: AccountInfo<'info>,

    pub drift_program: Program<'info, Drift>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

impl<'info> DriftInitializeUserCPI for Context<'_, '_, '_, 'info, InitializeDriftVault<'info>> {
    fn drift_initialize_user(&self, base_asset_type: VaultAssetType) -> Result<()> {
        let name: [u8; 32] = [0; 32];
        let quote_mint_pk = self.accounts.quote_mint.key();
        let base_mint_pk = self.accounts.base_mint.key();
        let drift_program_pk = self.accounts.drift_program.key();
        let seeds = &[
            quote_mint_pk.as_ref(),
            base_mint_pk.as_ref(),
            drift_program_pk.as_ref(),
            &[if base_asset_type == VaultAssetType::SpotBorrow { VaultType::Spot } else { VaultType::Perp } as u8],
            &[self.bumps.vault]
        ];
        let signers = &[&seeds[..]];

        let cpi_program = self.accounts.drift_program.to_account_info().clone();
        let cpi_accounts = InitializeUser {
            user_stats: self.accounts.drift_user_stats.clone(),
            user: self.accounts.drift_user.clone(),
            state: self.accounts.drift_state.clone(),
            authority: self.accounts.vault.to_account_info().clone(),
            payer: self.accounts.authority.to_account_info().clone(),
            rent: self.accounts.rent.to_account_info().clone(),
            system_program: self.accounts.system_program.to_account_info().clone(),
        };
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signers);
        let sub_account_id = 0_u16;
        drift::cpi::initialize_user(cpi_ctx, sub_account_id, name)?;

        Ok(())
    }

    fn drift_initialize_user_stats(&self, base_asset_type: VaultAssetType) -> Result<()> {
        let quote_mint_pk = self.accounts.quote_mint.key();
        let base_mint_pk = self.accounts.base_mint.key();
        let drift_program_pk = self.accounts.drift_program.key();
        let seeds = &[
            quote_mint_pk.as_ref(),
            base_mint_pk.as_ref(),
            drift_program_pk.as_ref(),
            &[if base_asset_type == VaultAssetType::SpotBorrow { VaultType::Spot } else { VaultType::Perp } as u8],
            &[self.bumps.vault]
        ];
        let signers = &[&seeds[..]];

        let cpi_program = self.accounts.drift_program.to_account_info().clone();
        let cpi_accounts = InitializeUserStats {
            user_stats: self.accounts.drift_user_stats.clone(),
            state: self.accounts.drift_state.clone(),
            authority: self.accounts.vault.to_account_info().clone(),
            payer: self.accounts.authority.to_account_info().clone(),
            rent: self.accounts.rent.to_account_info().clone(),
            system_program: self.accounts.system_program.to_account_info().clone(),
        };
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signers);
        drift::cpi::initialize_user_stats(cpi_ctx)?;

        Ok(())
    }
}