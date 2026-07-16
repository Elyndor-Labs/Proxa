use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token_interface::{self, TransferChecked};

use crate::constants::POSITION_SEED;
use crate::errors::ProxaError;
use crate::events::BetPlaced;
use crate::state::Position;

pub fn handler(
    ctx: Context<crate::PlaceBet>,
    bucket: u8,
    amount: u64,
    _relayer_fee: u64,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(now < ctx.accounts.market.bets_close_ts, ProxaError::BettingClosed);
    require!(
        ctx.accounts.market.winning_bucket == u8::MAX,
        ProxaError::MarketNotOpen
    );
    require!(amount > 0, ProxaError::InvalidAmount);
    require!(bucket < ctx.accounts.market.num_buckets, ProxaError::InvalidBucket);

    let position = &mut ctx.accounts.position;
    if position.bettor == Pubkey::default() {
        position.set_inner(Position {
            market_id: ctx.accounts.market.market_id,
            bettor: ctx.accounts.bettor.key(),
            bucket,
            amount: 0,
            bump: ctx.bumps.position,
        });
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
        ctx.accounts.stake_mint.key(),
        ctx.accounts.config.stake_mint,
        ProxaError::InvalidStakeMint
    );
    require_keys_eq!(
        ctx.accounts.vault.key(),
        ctx.accounts.market.vault,
        ProxaError::Unauthorized
    );

    let decimals = ctx.accounts.stake_mint.decimals;
    let stake_transfer = TransferChecked {
        from: ctx.accounts.bettor_token_account.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        mint: ctx.accounts.stake_mint.to_account_info(),
        authority: ctx.accounts.bettor.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), stake_transfer);
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

pub fn handler_sponsored(
    ctx: Context<crate::SponsoredPlaceBet>,
    bucket: u8,
    amount: u64,
    relayer_fee: u64,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(now < ctx.accounts.market.bets_close_ts, ProxaError::BettingClosed);
    require!(
        ctx.accounts.market.winning_bucket == u8::MAX,
        ProxaError::MarketNotOpen
    );
    require!(amount > 0, ProxaError::InvalidAmount);
    require!(bucket < ctx.accounts.market.num_buckets, ProxaError::InvalidBucket);

    let position_info = ctx.accounts.position.to_account_info();
    let position_bump = ctx.bumps.position;
    let position_space = 8 + Position::INIT_SPACE;
    let mut position = if position_info.data_is_empty() {
        let rent = Rent::get()?.minimum_balance(position_space);
        let market_key = ctx.accounts.market.key();
        let bettor_key = ctx.accounts.bettor.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            POSITION_SEED,
            market_key.as_ref(),
            bettor_key.as_ref(),
            &[bucket],
            &[position_bump],
        ]];
        let cpi_accounts = system_program::CreateAccount {
            from: ctx.accounts.payer.to_account_info(),
            to: position_info.clone(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        system_program::create_account(cpi_ctx, rent, position_space as u64, ctx.program_id)?;

        Position {
            market_id: ctx.accounts.market.market_id,
            bettor: ctx.accounts.bettor.key(),
            bucket,
            amount: 0,
            bump: position_bump,
        }
    } else {
        let data = position_info.try_borrow_data()?;
        Position::try_deserialize(&mut &data[..])?
    };

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
        ctx.accounts.stake_mint.key(),
        ctx.accounts.config.stake_mint,
        ProxaError::InvalidStakeMint
    );
    require_keys_eq!(
        ctx.accounts.vault.key(),
        ctx.accounts.market.vault,
        ProxaError::Unauthorized
    );
    require_keys_eq!(
        ctx.accounts.treasury.key(),
        ctx.accounts.config.treasury,
        ProxaError::Unauthorized
    );
    require_keys_eq!(
        ctx.accounts.treasury.mint,
        ctx.accounts.stake_mint.key(),
        ProxaError::InvalidTreasuryMint
    );

    let decimals = ctx.accounts.stake_mint.decimals;
    let stake_transfer = TransferChecked {
        from: ctx.accounts.bettor_token_account.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        mint: ctx.accounts.stake_mint.to_account_info(),
        authority: ctx.accounts.bettor.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), stake_transfer);
    token_interface::transfer_checked(cpi_ctx, amount, decimals)?;

    if relayer_fee > 0 {
        let fee_transfer = TransferChecked {
            from: ctx.accounts.bettor_token_account.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            mint: ctx.accounts.stake_mint.to_account_info(),
            authority: ctx.accounts.bettor.to_account_info(),
        };
        let fee_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), fee_transfer);
        token_interface::transfer_checked(fee_ctx, relayer_fee, decimals)?;
    }

    position.amount = position
        .amount
        .checked_add(amount)
        .ok_or(error!(ProxaError::Overflow))?;
    {
        let mut data = position_info.try_borrow_mut_data()?;
        position.try_serialize(&mut &mut data[..])?;
    }

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
