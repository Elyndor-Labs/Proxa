use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TransferChecked};

use crate::errors::ProxaError;
use crate::events::Claimed;
use crate::state::MarketStatus;

pub fn handler(ctx: Context<crate::Claim>) -> Result<()> {
    let market = &ctx.accounts.market;
    let position = &ctx.accounts.position;

    let payout = match market.status {
        MarketStatus::Voided => position.amount,
        MarketStatus::Resolved => {
            if position.bucket == market.winning_bucket {
                if market.winning_pool == 0 {
                    0
                } else {
                    (position.amount as u128)
                        .checked_mul(market.net_pool as u128)
                        .ok_or(error!(ProxaError::InvalidAmount))?
                        .checked_div(market.winning_pool as u128)
                        .ok_or(error!(ProxaError::InvalidAmount))? as u64
                }
            } else {
                0
            }
        }
        MarketStatus::Open => return err!(ProxaError::NotResolved),
    };

    if payout > 0 {
        let market_id = market.market_id.to_le_bytes();
        let seeds = &[crate::MARKET_SEED, market_id.as_ref(), &[market.bump]];
        let signer = &[&seeds[..]];

        let decimals = ctx.accounts.stake_mint.decimals;
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.bettor_token_account.to_account_info(),
            mint: ctx.accounts.stake_mint.to_account_info(),
            authority: ctx.accounts.market.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token_interface::transfer_checked(cpi_ctx, payout, decimals)?;
    }

    emit!(Claimed {
        market_id: market.market_id,
        bettor: ctx.accounts.bettor.key(),
        payout,
    });

    Ok(())
}
