use anchor_lang::prelude::*;

use crate::errors::ProxaError;
use crate::state::MarketStatus;

pub fn handler(ctx: Context<crate::VoidMarket>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    require!(
        market.status == MarketStatus::Open,
        ProxaError::MarketNotOpen
    );

    let now = Clock::get()?.unix_timestamp;
    require!(
        now >= market.resolve_deadline_ts,
        ProxaError::ResolveDeadlineNotReached
    );

    market.status = MarketStatus::Voided;
    Ok(())
}
