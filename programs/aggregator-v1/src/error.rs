use anchor_lang::error_code;

pub type AggregatorResult<T = ()> = std::result::Result<T, ErrorCode>;

#[error_code]
pub enum ErrorCode {
    InvalidLendingProgramId,
}
