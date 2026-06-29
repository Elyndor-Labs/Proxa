use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod events;
pub mod state;

pub use constants::*;
pub use error::*;
pub use events::*;
pub use state::*;

declare_id!("FoavbfR6ePcmcvQsHcRSCuizHVTey9CKC48LvDEG8e2D");
declare_program!(txoracle);

#[program]
pub mod proxa {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>, _fee_bps: u16) -> Result<()> {
        Ok(())
    }

    pub fn create_market(_ctx: Context<CreateMarket>, _args: CreateMarketArgs) -> Result<()> {
        Ok(())
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
pub struct CreateMarketArgs {
    pub fixture_id: i64,
    pub stat_key: u32,
    pub num_buckets: u8,
    pub bets_close_ts: i64,
    pub resolve_after_ts: i64,
    pub resolve_deadline_ts: i64,
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
pub struct Initialize<'info> {
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateMarket<'info> {
    pub authority: Signer<'info>,
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
