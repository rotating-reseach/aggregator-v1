use anchor_lang::{require, Result};
use solana_program::pubkey::Pubkey;

use crate::error::ErrorCode;

pub fn check_lending_program(program_id: Pubkey) -> Result<bool> {
    let lending_program_pk: [Pubkey; 1] = [drift::id()];

    require!(
        lending_program_pk
            .iter()
            .any(|&valid_id| valid_id == program_id),
        ErrorCode::InvalidLendingProgramId
    );

    Ok(true)
}
