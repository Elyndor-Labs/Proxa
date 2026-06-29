use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TransferChecked};

use crate::errors::ProxaError;
use crate::events::BetPlaced;
use crate::state::MarketStatus;

pub fn handler(ctx: Context<crate::PlaceBet>, bucket: u8, amount: u64) -> Result<()> {
    require!(
        ctx.accounts.market.status == MarketStatus::Open,
        ProxaError::MarketNotOpen
    );
    let now = Clock::get()?.unix_timestamp;
    require!(now < ctx.accounts.market.bets_close_ts, ProxaError::BettingClosed);
    require!(amount > 0, ProxaError::InvalidAmount);
    require!(bucket < ctx.accounts.market.num_buckets, ProxaError::InvalidBucket);

    let position = &mut ctx.accounts.position;
    if position.bettor == Pubkey::default() {
        position.market_id = ctx.accounts.market.market_id;
        position.bettor = ctx.accounts.bettor.key();
        position.bucket = bucket;
        position.amount = 0;
        position.bump = ctx.bumps.position;
    }

    require!(position.bucket == bucket, ProxaError::InvalidBucket);
    require_keys_eq!(
        ctx.accounts.bettor_token_account.mint,
        ctx.accounts.stake_mint.key(),
        ProxaError::InvalidStakeMint
    );
    require_keys_eq!(
        ctx.accounts.bettor_token_account.owner,
        ctx.accounts.bettor.key(),
        ProxaError::Unauthorized
    );
    require_keys_eq!(
        ctx.accounts.stake_mint.key(),
        ctx.accounts.market.stake_mint,
        ProxaError::InvalidStakeMint
    );
    require_keys_eq!(
        ctx.accounts.vault.key(),
        ctx.accounts.market.vault,
        ProxaError::Unauthorized
    );

    let decimals = ctx.accounts.stake_mint.decimals;
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.bettor_token_account.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        mint: ctx.accounts.stake_mint.to_account_info(),
        authority: ctx.accounts.bettor.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    token_interface::transfer_checked(cpi_ctx, amount, decimals)?;

    position.amount = position
        .amount
        .checked_add(amount)
        .ok_or(error!(ProxaError::Overflow))?;

    let market = &mut ctx.accounts.market;
    market.total_pool = market
        .total_pool
        .checked_add(amount)
        .ok_or(error!(ProxaError::Overflow))?;
    let idx = bucket as usize;
    market.bucket_pools[idx] = market.bucket_pools[idx]
        .checked_add(amount)
        .ok_or(error!(ProxaError::Overflow))?;

    emit!(BetPlaced {
        market_id: market.market_id,
        bettor: ctx.accounts.bettor.key(),
        bucket,
        amount,
    });

    Ok(())
}

