use anchor_lang::prelude::*;

#[derive(Debug, Clone)]
pub struct AddressLookupTable;

impl anchor_lang::Id for AddressLookupTable {
    fn id() -> Pubkey {
        solana_program::address_lookup_table::program::ID
    }
}