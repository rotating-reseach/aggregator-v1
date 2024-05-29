use anchor_lang::{require, Result};
use solana_program::pubkey::Pubkey;

use crate::{constants::DRIFT_ID, error::ErrorCode};

pub enum LendingProgram {
    Drift,
}

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

pub fn match_lending_program(program_id: Pubkey) -> Result<LendingProgram> {
    let lending_program = match program_id {
        DRIFT_ID => LendingProgram::Drift,
        _ => return Err(ErrorCode::InvalidLendingProgramId.into()),
    };

    Ok(lending_program)
}
