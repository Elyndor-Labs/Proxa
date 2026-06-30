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

    pub fn place_bet(ctx: Context<PlaceBet>, bucket: u8, amount: u64) -> Result<()> {
        crate::instructions::place_bet::handler(ctx, bucket, amount)
    }

    pub fn resolve(ctx: Context<Resolve>, args: ResolveArgs) -> Result<()> {
        crate::instructions::resolve::handler(ctx, args)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        crate::instructions::claim::handler(ctx)
    }

    pub fn collect_fee(ctx: Context<CollectFee>) -> Result<()> {
        crate::instructions::collect_fee::handler(ctx)
    }

    pub fn void_market(ctx: Context<VoidMarket>) -> Result<()> {
        crate::instructions::void_market::handler(ctx)
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
#[instruction(bucket: u8)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,
    #[account(
        mut,
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, state::Market>,
    #[account(
        mut,
        seeds = [VAULT_SEED, &market.market_id.to_le_bytes()],
        bump = market.vault_bump,
        constraint = vault.key() == market.vault @ ProxaError::Unauthorized,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = bettor,
        space = 8 + state::Position::INIT_SPACE,
        seeds = [POSITION_SEED, market.key().as_ref(), bettor.key().as_ref(), &[bucket]],
        bump
    )]
    pub position: Account<'info, state::Position>,
    #[account(
        mut,
        constraint = bettor_token_account.mint == stake_mint.key() @ ProxaError::InvalidStakeMint,
        constraint = bettor_token_account.owner == bettor.key() @ ProxaError::Unauthorized,
    )]
    pub bettor_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(constraint = stake_mint.key() == market.stake_mint @ ProxaError::InvalidStakeMint)]
    pub stake_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Resolve<'info> {
    pub keeper: Signer<'info>,
    #[account(
        mut,
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, state::Market>,
    /// CHECK: PDA and owner verified in handler
    pub daily_scores_merkle_roots: UncheckedAccount<'info>,
    pub txoracle_program: Program<'info, txoracle::program::Txoracle>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,
    #[account(
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, state::Market>,
    #[account(
        mut,
        close = bettor,
        seeds = [POSITION_SEED, market.key().as_ref(), bettor.key().as_ref(), &[position.bucket]],
        bump = position.bump,
        constraint = position.bettor == bettor.key() @ ProxaError::Unauthorized,
        constraint = position.market_id == market.market_id @ ProxaError::Unauthorized,
    )]
    pub position: Account<'info, state::Position>,
    #[account(
        mut,
        seeds = [VAULT_SEED, &market.market_id.to_le_bytes()],
        bump = market.vault_bump,
        constraint = vault.key() == market.vault @ ProxaError::Unauthorized,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        constraint = bettor_token_account.mint == stake_mint.key() @ ProxaError::InvalidStakeMint,
        constraint = bettor_token_account.owner == bettor.key() @ ProxaError::Unauthorized,
    )]
    pub bettor_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(constraint = stake_mint.key() == market.stake_mint @ ProxaError::InvalidStakeMint)]
    pub stake_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct CollectFee<'info> {
    pub caller: Signer<'info>,
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, state::Config>,
    #[account(
        mut,
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, state::Market>,
    #[account(
        mut,
        seeds = [VAULT_SEED, &market.market_id.to_le_bytes()],
        bump = market.vault_bump,
        constraint = vault.key() == market.vault @ ProxaError::Unauthorized,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub treasury: InterfaceAccount<'info, TokenAccount>,
    #[account(
        constraint = stake_mint.key() == market.stake_mint @ ProxaError::InvalidStakeMint,
        constraint = treasury.mint == stake_mint.key() @ ProxaError::InvalidTreasuryMint,
    )]
    pub stake_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct VoidMarket<'info> {
    pub caller: Signer<'info>,
    #[account(
        mut,
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, state::Market>,
}
