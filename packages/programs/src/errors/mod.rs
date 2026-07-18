use anchor_lang::prelude::*;

#[error_code]
pub enum ProxaError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid fee bps")]
    InvalidFeeBps,
    #[msg("Invalid treasury mint")]
    InvalidTreasuryMint,
    #[msg("Invalid stake mint")]
    InvalidStakeMint,
    #[msg("Invalid stat key")]
    InvalidStatKey,
    #[msg("Invalid bucket count")]
    InvalidBucketCount,
    #[msg("Invalid bucket bounds")]
    InvalidBucketBounds,
    #[msg("Invalid resolve window")]
    InvalidResolveWindow,
    #[msg("Market is not open")]
    MarketNotOpen,
    #[msg("Betting is closed")]
    BettingClosed,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Invalid bucket")]
    InvalidBucket,
    #[msg("Resolve is too early")]
    ResolveTooEarly,
    #[msg("Resolve deadline has not been reached")]
    ResolveDeadlineNotReached,
    #[msg("Market is not resolved")]
    NotResolved,
    #[msg("Fee already collected")]
    FeeAlreadyCollected,
    #[msg("Fixture does not match market")]
    FixtureMismatch,
    #[msg("Stat key does not match market")]
    StatKeyMismatch,
    #[msg("Invalid daily scores roots account")]
    InvalidDailyScoresRoots,
    #[msg("Invalid daily scores roots owner")]
    InvalidDailyScoresOwner,
    #[msg("Proof was rejected")]
    ProofRejected,
    #[msg("Winning value cannot be negative")]
    NegativeWinningValue,
}
