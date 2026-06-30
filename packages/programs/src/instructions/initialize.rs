use anchor_lang::prelude::*;

use crate::constants::MAX_FEE_BPS;
use crate::errors::ProxaError;

pub fn handler(ctx: Context<crate::Initialize>, fee_bps: u16) -> Result<()> {
    require!(fee_bps <= MAX_FEE_BPS, ProxaError::InvalidFeeBps);
    require_keys_eq!(
        ctx.accounts.treasury.mint,
        ctx.accounts.stake_mint.key(),
        ProxaError::InvalidTreasuryMint
    );

    let config = &mut ctx.accounts.config;
    config.authority = ctx.accounts.authority.key();
    config.stake_mint = ctx.accounts.stake_mint.key();
    config.treasury = ctx.accounts.treasury.key();
    config.fee_bps = fee_bps;
    config.market_count = 0;
    config.bump = ctx.bumps.config;
    Ok(())
}
