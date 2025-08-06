import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MetaplexNft } from "../target/types/metaplex_nft.js";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  findMasterEditionPda,
  findMetadataPda,
  mplTokenMetadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// 网络配置
const NETWORK = process.env.NETWORK || "devnet";
const RPC_URL =
  process.env.RPC_URL ||
  "https://solana-devnet.g.alchemy.com/v2/wetra8HLzo_m-UswS8UJCnwdzS40X2wN";
const EXPLORER_URL = "https://explorer.solana.com";

function getExplorerUrl(network: string): string {
  switch (network) {
    case "localnet":
      return "https://explorer.solana.com";
    case "devnet":
      return "https://explorer.solana.com";
    case "mainnet":
      return "https://explorer.solana.com";
    default:
      return "https://explorer.solana.com";
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🚀 开始测试 ShenQiBox NFT 程序...");
  console.log(`🌐 网络: ${NETWORK.toUpperCase()}`);
  console.log(`🔗 RPC URL: ${RPC_URL}`);
  console.log("");

  try {
    // 配置 provider
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.MetaplexNft as Program<MetaplexNft>;

    const signer = provider.wallet;

    // 使用配置的 RPC URL
    const umi = createUmi(RPC_URL)
      .use(walletAdapterIdentity(signer))
      .use(mplTokenMetadata());

    const mint = anchor.web3.Keypair.generate();

    // Derive the associated token address account for the mint
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      signer.publicKey,
    );

    // derive the metadata account
    let metadataAccount = findMetadataPda(umi, {
      mint: publicKey(mint.publicKey),
    })[0];

    //derive the master edition pda
    let masterEditionAccount = findMasterEditionPda(umi, {
      mint: publicKey(mint.publicKey),
    })[0];

    const metadata = {
      name: "ShenQiBox",
      symbol: "SQB",
      uri: "https://gist.githubusercontent.com/qiaopengjun5162/fd21cf39950b885371279ee3ea591cf9/raw/meta.json",
    };

    console.log("🔍 检查程序状态...");

    // 检查程序是否可用
    try {
      const programInfo = await provider.connection.getAccountInfo(
        program.programId,
      );
      if (programInfo) {
        console.log("✅ 程序已部署并可用");
      } else {
        console.log("❌ 程序未在此网络部署");
        console.log(
          "请先运行: make deploy PROGRAM=metaplex_nft CLUSTER=devnet",
        );
        return;
      }
    } catch (error) {
      console.log("❌ 无法检查程序状态:", error.message);
      return;
    }

    // 检查 Token Metadata Program 是否可用
    try {
      const tokenMetadataProgramKey = new anchor.web3.PublicKey(
        MPL_TOKEN_METADATA_PROGRAM_ID,
      );
      const programInfo = await provider.connection.getAccountInfo(
        tokenMetadataProgramKey,
      );

      if (!programInfo) {
        console.log(`❌ Token Metadata Program 在此网络不可用`);
        return;
      } else {
        console.log("✅ Token Metadata Program 可用");
      }
    } catch (error) {
      console.log("❌ 无法检查 Token Metadata Program:", error.message);
      return;
    }

    console.log("");
    console.log(`🎨 开始 Mint NFT...`);
    console.log(`📝 名称: ${metadata.name}`);
    console.log(`🏷️  符号: ${metadata.symbol}`);
    console.log(`🔗 元数据: ${metadata.uri}`);
    console.log("");

    // 设置更长的确认时间
    const connection = provider.connection;

    const tx = await program.methods
      .mintNft(metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        signer: provider.publicKey,
        mintAccount: mint.publicKey,
        associatedTokenAccount,
        metadataAccount,
        masterEditionAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc();

    console.log("⏳ 等待交易确认...");
    console.log(`🔗 交易签名: ${tx}`);

    // 等待交易确认，最多等待60秒
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 60; // 60秒

    while (!confirmed && attempts < maxAttempts) {
      try {
        // 使用新的 TransactionConfirmationStrategy
        const status = await connection.confirmTransaction(
          {
            signature: tx,
            blockhash: await connection
              .getLatestBlockhash()
              .then((res) => res.blockhash),
            lastValidBlockHeight: await connection
              .getLatestBlockhash()
              .then((res) => res.lastValidBlockHeight),
          },
          "confirmed",
        );
        if (status.value.err === null) {
          confirmed = true;
        }
      } catch (error) {
        // 忽略确认错误，继续重试
      }

      if (!confirmed) {
        attempts++;
        await sleep(1000); // 等待1秒
        if (attempts % 10 === 0) {
          console.log(`⏳ 仍在等待确认... (${attempts}s)`);
        }
      }
    }

    if (confirmed) {
      console.log("");
      console.log("🎉 NFT Mint 成功！");
      console.log("");
      console.log("📋 交易详情:");
      console.log(`🔗 交易链接: ${EXPLORER_URL}/tx/${tx}?cluster=${NETWORK}`);
      console.log(
        `🖼️  NFT 地址: ${EXPLORER_URL}/address/${mint.publicKey}?cluster=${NETWORK}`,
      );
      console.log(`🎯 Mint 公钥: ${mint.publicKey.toString()}`);
      console.log(`💼 Token 账户: ${associatedTokenAccount.toString()}`);
      console.log("");
      console.log("✨ 你可以在钱包中查看这个 NFT 了！");
    } else {
      console.log("");
      console.log("⚠️  交易可能已成功，但确认超时");
      console.log(
        `🔗 请手动检查交易: ${EXPLORER_URL}/tx/${tx}?cluster=${NETWORK}`,
      );
      console.log(
        `🖼️  NFT 地址: ${EXPLORER_URL}/address/${mint.publicKey}?cluster=${NETWORK}`,
      );
    }
  } catch (error) {
    console.log("");
    console.log("❌ NFT Mint 失败:");
    console.log(`   错误: ${error.message}`);
    console.log("");
    console.log("💡 可能的解决方案:");
    console.log("   1. 检查网络连接");
    console.log("   2. 确保钱包有足够的 SOL");
    console.log("   3. 检查程序是否正确部署");
    console.log("   4. 尝试重新运行测试");

    throw error;
  }
}

// 运行测试
main().catch((error) => {
  console.error("测试失败:", error);
  process.exit(1);
});
