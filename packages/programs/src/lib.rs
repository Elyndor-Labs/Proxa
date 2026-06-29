use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

pub mod constants;
pub mod events;
pub mod errors;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use events::*;
pub use errors::*;
pub use state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateMarketArgs {
    pub fixture_id: i64,
    pub stat_key: u32,
    pub num_buckets: u8,
    pub bets_close_ts: i64,
    pub resolve_after_ts: i64,
    pub resolve_deadline_ts: i64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + state::Config::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, state::Config>,
    pub stake_mint: InterfaceAccount<'info, Mint>,
    pub treasury: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, state::Config>,
    #[account(
        init,
        payer = authority,
        space = 8 + state::Market::INIT_SPACE,
        seeds = [MARKET_SEED, &config.market_count.to_le_bytes()],
        bump
    )]
    pub market: Account<'info, state::Market>,
    #[account(
        init,
        payer = authority,
        seeds = [VAULT_SEED, &config.market_count.to_le_bytes()],
        bump,
        token::mint = stake_mint,
        token::authority = market,
        token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub stake_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

declare_id!("6LAR9TGXRnsLVtc4MibivdgNgqWGpiXMsR64p21VCRDZ");
declare_program!(txoracle);

#[program]
pub mod proxa {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        fee_bps: u16,
    ) -> Result<()> {
        crate::instructions::initialize::handler(ctx, fee_bps)
    }

    pub fn create_market(
        ctx: Context<CreateMarket>,
        args: CreateMarketArgs,
    ) -> Result<()> {
        crate::instructions::create_market::handler(ctx, args)
    }

    pub fn place_bet(_ctx: Context<PlaceBet>, _bucket: u8, _amount: u64) -> Result<()> {
        Ok(())
    }

    pub fn resolve(_ctx: Context<Resolve>, _args: ResolveArgs) -> Result<()> {
        Ok(())
    }

    pub fn claim(_ctx: Context<Claim>) -> Result<()> {
        Ok(())
    }

    pub fn collect_fee(_ctx: Context<CollectFee>) -> Result<()> {
        Ok(())
    }

    pub fn void_market(_ctx: Context<VoidMarket>) -> Result<()> {
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ResolveArgs {
    pub ts: i64,
    pub fixture_summary: txoracle::types::ScoresBatchSummary,
    pub fixture_proof: Vec<txoracle::types::ProofNode>,
    pub main_tree_proof: Vec<txoracle::types::ProofNode>,
    pub stat_a: txoracle::types::StatTerm,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    pub bettor: Signer<'info>,
}

#[derive(Accounts)]
pub struct Resolve<'info> {
    pub keeper: Signer<'info>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    pub bettor: Signer<'info>,
}

#[derive(Accounts)]
pub struct CollectFee<'info> {
    pub caller: Signer<'info>,
}

#[derive(Accounts)]
pub struct VoidMarket<'info> {
    pub caller: Signer<'info>,
}
