use anchor_lang::prelude::*;

use crate::User;

pub fn handle_initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
    let mut user = ctx.accounts.user.load_init()?;
    user.bump = ctx.bumps.user;
    drop(user);
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<User>(),
        seeds = [authority.key().as_ref()],
        bump
    )]
    pub user: AccountLoader<'info, User>,

    pub system_program: Program<'info, System>
}