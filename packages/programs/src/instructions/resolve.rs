use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::get_return_data;

use crate::constants::{MS_PER_DAY, TXLINE_DAILY_SCORES_SEED};
use crate::errors::ProxaError;
use crate::events::MarketResolved;
use crate::state::MarketStatus;
use crate::txoracle::{self, types::Comparison};

pub fn handler(ctx: Context<crate::Resolve>, args: crate::ResolveArgs) -> Result<()> {
    let market = &mut ctx.accounts.market;
    require!(
        market.status == MarketStatus::Open,
        ProxaError::MarketNotOpen
    );

    let now = Clock::get()?.unix_timestamp;
    require!(now >= market.resolve_after_ts, ProxaError::ResolveTooEarly);

    require!(
        args.stat_a.stat_to_prove.key == market.stat_key,
        ProxaError::StatKeyMismatch
    );
    require!(
        args.fixture_summary.fixture_id == market.fixture_id,
        ProxaError::FixtureMismatch
    );

    let epoch_day = (args.ts / MS_PER_DAY) as u16;
    let (expected_roots, _) = Pubkey::find_program_address(
        &[TXLINE_DAILY_SCORES_SEED, &epoch_day.to_le_bytes()],
        &txoracle::ID,
    );
    let roots = &ctx.accounts.daily_scores_merkle_roots;
    require_keys_eq!(
        roots.key(),
        expected_roots,
        ProxaError::InvalidDailyScoresRoots
    );
    require!(
        roots.owner == &txoracle::ID,
        ProxaError::InvalidDailyScoresOwner
    );

    let value = args.stat_a.stat_to_prove.value;
    let predicate = txoracle::types::TraderPredicate {
        threshold: value,
        comparison: Comparison::EqualTo,
    };

    let cpi_accounts = txoracle::cpi::accounts::ValidateStat {
        daily_scores_merkle_roots: roots.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(
        ctx.accounts.txoracle_program.to_account_info(),
        cpi_accounts,
    );
    txoracle::cpi::validate_stat(
        cpi_ctx,
        args.ts,
        args.fixture_summary,
        args.fixture_proof,
        args.main_tree_proof,
        predicate,
        args.stat_a,
        None,
        None,
    )?;

    let validated = read_validate_stat_return()?;
    require!(validated, ProxaError::ProofRejected);

    require!(value >= 0, ProxaError::NegativeWinningValue);

    let num_buckets = market.num_buckets;
    let overflow = num_buckets.saturating_sub(1);
    let winning_bucket = if value >= overflow as i32 {
        overflow
    } else {
        value as u8
    };

    let fee = (market.total_pool as u128)
        .checked_mul(market.fee_bps as u128)
        .ok_or(error!(ProxaError::InvalidAmount))?
        .checked_div(10_000)
        .ok_or(error!(ProxaError::InvalidAmount))? as u64;
    let net_pool = market
        .total_pool
        .checked_sub(fee)
        .ok_or(error!(ProxaError::InvalidAmount))?;
    let winning_pool = market.bucket_pools[winning_bucket as usize];

    market.winning_bucket = winning_bucket;
    market.net_pool = net_pool;
    market.winning_pool = winning_pool;

    if winning_pool == 0 {
        market.status = MarketStatus::Voided;
    } else {
        market.status = MarketStatus::Resolved;
        market.winning_value = value;
    }

    emit!(MarketResolved {
        market_id: market.market_id,
        winning_value: value,
        winning_bucket,
        net_pool,
        winning_pool,
    });

    Ok(())
}

fn read_validate_stat_return() -> Result<bool> {
    let (program_id, data) = get_return_data().ok_or(error!(ProxaError::ProofRejected))?;
    require_keys_eq!(program_id, txoracle::ID, ProxaError::ProofRejected);

    let mut slice: &[u8] = if data.len() > 8 { &data[8..] } else { &data[..] };
    bool::deserialize(&mut slice).map_err(|_| error!(ProxaError::ProofRejected))
}
