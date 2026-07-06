use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TransferChecked};

use crate::errors::ProxaError;
use crate::state::MarketStatus;

pub fn handler(ctx: Context<crate::CollectFee>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    require!(
        market.status == MarketStatus::Resolved,
        ProxaError::NotResolved
    );
    require!(!market.fee_collected, ProxaError::FeeAlreadyCollected);
    require_keys_eq!(
        ctx.accounts.treasury.key(),
        ctx.accounts.config.treasury,
        ProxaError::Unauthorized
    );
    require_keys_eq!(
        ctx.accounts.stake_mint.key(),
        market.stake_mint,
        ProxaError::InvalidStakeMint
    );
    require_keys_eq!(
        ctx.accounts.vault.key(),
        market.vault,
        ProxaError::Unauthorized
    );
    require_keys_eq!(
        ctx.accounts.treasury.mint,
        ctx.accounts.stake_mint.key(),
        ProxaError::InvalidTreasuryMint
    );

    let fee = market
        .total_pool
        .checked_sub(market.net_pool)
        .ok_or(error!(ProxaError::Overflow))?;

    if fee > 0 {
        let market_id = market.market_id.to_le_bytes();
        let seeds = &[crate::MARKET_SEED, market_id.as_ref(), &[market.bump]];
        let signer = &[&seeds[..]];

        let decimals = ctx.accounts.stake_mint.decimals;
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            mint: ctx.accounts.stake_mint.to_account_info(),
            authority: market.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token_interface::transfer_checked(cpi_ctx, fee, decimals)?;
    }

    market.fee_collected = true;
    Ok(())
}
