#![allow(unexpected_cfgs, deprecated)]

use anchor_lang::prelude::*;

declare_id!("2ZgjDLphMVoLT48YCk2ZvAsHpdwkqtkhyCWsjR1Gda7x");

#[program]
pub mod shenqi_box {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
