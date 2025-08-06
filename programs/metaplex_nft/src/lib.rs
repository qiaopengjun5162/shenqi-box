#![allow(unexpected_cfgs, deprecated)]

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
        CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata,
    },
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};
// use mpl_token_metadata::accounts::{MasterEdition, Metadata as MetadataAccount};

declare_id!("HNyPqG6w1NQTx4gEB4eHGFJNDMQQJibc8LQwJqJ5awoo");

#[program]
pub mod metaplex_nft {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint_account.to_account_info(), // mint：指向 NFT 的 mint 账户，用于铸造 NFT。
            to: ctx.accounts.associated_token_account.to_account_info(), // to：接收铸造 NFT 的目标账户
            authority: ctx.accounts.signer.to_account_info(), // authority：授权铸造的签名者。该账户必须有权限调用代币程序以执行代币铸造操作。
        };
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);

        mint_to(cpi_context, 1)?;

        let cpi_context = CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.mint_account.to_account_info(),
                mint_authority: ctx.accounts.signer.to_account_info(),
                update_authority: ctx.accounts.signer.to_account_info(),
                payer: ctx.accounts.signer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );

        let data_v2 = DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0, // 卖家费用基点。这个值表示二级市场交易时卖家需要支付的费用。通常以基点为单位，0 表示不收取任何费用。
            creators: None,
            collection: None,
            uses: None,
        };

        create_metadata_accounts_v3(cpi_context, data_v2, false, true, None)?;

        let cpi_context = CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.edition_account.to_account_info(),
                mint: ctx.accounts.mint_account.to_account_info(),
                update_authority: ctx.accounts.signer.to_account_info(),
                mint_authority: ctx.accounts.signer.to_account_info(),
                payer: ctx.accounts.signer.to_account_info(),
                metadata: ctx.accounts.metadata_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );

        create_master_edition_v3(cpi_context, None)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    // #[account(mut, signer)]
    // pub signer: AccountInfo<'info>,
    #[account(mut)]
    pub signer: Signer<'info>,

    // #[account(init, payer = signer,mint::decimals = 0,mint::authority = signer.key(),mint::freeze_authority = signer.key(),)]
    // pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer.key(),
        mint::freeze_authority = signer.key(),
    )]
    pub mint_account: InterfaceAccount<'info, Mint>,

    // #[account(init_if_needed, payer = signer, associated_token::mint = mint, associated_token::authority = signer)]
    // pub associated_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint_account,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub associated_token_account: InterfaceAccount<'info, TokenAccount>,

    /// CHECK - address
    // #[account(mut, address = MetadataAccount::find_pda(&mint.key()).0)]
    // pub metadata_account: AccountInfo<'info>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK - address
    // #[account(mut, address = MasterEdition::find_pda(&mint.key()).0)]
    // pub master_edition_account: AccountInfo<'info>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref(), b"edition"],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub edition_account: UncheckedAccount<'info>,

    // pub token_program: Program<'info, Token>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
