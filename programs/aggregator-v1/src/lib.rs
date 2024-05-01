use anchor_lang::prelude::*;

declare_id!("BPanLhvKwatyLQwSWTbUc3R3VVwsrQWrEeTtzD2DA6TZ");

#[program]
pub mod aggregator_v1 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
