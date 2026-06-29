use anchor_lang::prelude::*;

use crate::constants::MAX_BUCKETS;
use crate::errors::ProxaError;
use crate::events::MarketCreated;
use crate::state::{MarketStatus};

pub fn handler(ctx: Context<crate::CreateMarket>, args: crate::CreateMarketArgs) -> Result<()> {
    let config = &mut ctx.accounts.config;
    require_keys_eq!(
        config.authority,
        ctx.accounts.authority.key(),
        ProxaError::Unauthorized
    );
    require!(args.stat_key != 0, ProxaError::InvalidStatKey);
    require!(
        args.num_buckets >= 2 && (args.num_buckets as usize) <= MAX_BUCKETS,
        ProxaError::InvalidBucketCount
    );
    require!(
        args.bets_close_ts <= args.resolve_after_ts
            && args.resolve_after_ts <= args.resolve_deadline_ts,
        ProxaError::InvalidResolveWindow
    );
    require_keys_eq!(
        ctx.accounts.stake_mint.key(),
        config.stake_mint,
        ProxaError::InvalidStakeMint
    );

    let market_id = config.market_count;
    let market = &mut ctx.accounts.market;
    market.market_id = market_id;
    market.creator = ctx.accounts.authority.key();
    market.fixture_id = args.fixture_id;
    market.stat_key = args.stat_key;
    market.num_buckets = args.num_buckets;
    market.bets_close_ts = args.bets_close_ts;
    market.resolve_after_ts = args.resolve_after_ts;
    market.resolve_deadline_ts = args.resolve_deadline_ts;
    market.fee_bps = config.fee_bps;
    market.stake_mint = config.stake_mint;
    market.vault = ctx.accounts.vault.key();
    market.total_pool = 0;
    market.bucket_pools = [0; MAX_BUCKETS];
    market.status = MarketStatus::Open;
    market.winning_bucket = u8::MAX;
    market.winning_value = 0;
    market.net_pool = 0;
    market.winning_pool = 0;
    market.fee_collected = false;
    market.bump = ctx.bumps.market;
    market.vault_bump = ctx.bumps.vault;

    config.market_count = config
        .market_count
        .checked_add(1)
        .ok_or(error!(ProxaError::InvalidAmount))?;

    emit!(MarketCreated {
        market_id,
        fixture_id: args.fixture_id,
        stat_key: args.stat_key,
        num_buckets: args.num_buckets,
    });
    Ok(())
}
