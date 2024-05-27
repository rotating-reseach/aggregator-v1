use anchor_lang::prelude::*;

#[account(zero_copy)]
pub struct User {
    pub bump: u8,
}