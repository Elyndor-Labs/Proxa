use anchor_lang::prelude::*;

use crate::errors::ProxaError;

pub fn handler(ctx: Context<crate::UpdateStakeMint>) -> Result<()> {
    require_keys_eq!(
        ctx.accounts.config.authority,
        ctx.accounts.authority.key(),
        ProxaError::Unauthorized
    );
    require_keys_eq!(
        ctx.accounts.treasury.mint,
        ctx.accounts.stake_mint.key(),
        ProxaError::InvalidTreasuryMint
    );

    let config = &mut ctx.accounts.config;
    config.stake_mint = ctx.accounts.stake_mint.key();
    config.treasury = ctx.accounts.treasury.key();
    Ok(())
}
