use anchor_lang::prelude::*;

use crate::constants::MAX_BUCKETS;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub authority: Pubkey,
    pub stake_mint: Pubkey,
    pub treasury: Pubkey,
    pub fee_bps: u16,
    pub market_count: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub market_id: u64,
    pub creator: Pubkey,
    pub fixture_id: i64,
    pub stat_key: u32,
    pub num_buckets: u8,
    pub bucket_bounds: [i32; MAX_BUCKETS],
    pub bets_close_ts: i64,
    pub resolve_after_ts: i64,
    pub resolve_deadline_ts: i64,
    pub fee_bps: u16,
    pub stake_mint: Pubkey,
    pub vault: Pubkey,
    pub total_pool: u64,
    pub bucket_pools: [u64; MAX_BUCKETS],
    pub status: MarketStatus,
    pub winning_bucket: u8,
    pub winning_value: i32,
    pub net_pool: u64,
    pub winning_pool: u64,
    pub fee_collected: bool,
    pub bump: u8,
    pub vault_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Position {
    pub market_id: u64,
    pub bettor: Pubkey,
    pub bucket: u8,
    pub amount: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace, PartialEq, Eq)]
pub enum MarketStatus {
    Open,
    Resolved,
    Voided,
}
