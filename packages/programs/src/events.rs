use anchor_lang::prelude::*;

#[event]
pub struct MarketCreated {
    pub market_id: u64,
    pub fixture_id: i64,
    pub stat_key: u32,
    pub num_buckets: u8,
}

#[event]
pub struct BetPlaced {
    pub market_id: u64,
    pub bettor: Pubkey,
    pub bucket: u8,
    pub amount: u64,
}

#[event]
pub struct MarketResolved {
    pub market_id: u64,
    pub winning_value: i32,
    pub winning_bucket: u8,
    pub net_pool: u64,
    pub winning_pool: u64,
}

#[event]
pub struct Claimed {
    pub market_id: u64,
    pub bettor: Pubkey,
    pub payout: u64,
}
