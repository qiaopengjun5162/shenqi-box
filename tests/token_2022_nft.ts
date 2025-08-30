// 引入必要的库
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Token2022Nft } from "../target/types/token_2022_nft";
import {
  getAssociatedTokenAddressSync,
  getMint,
  getAccount,
  getExtensionData,
  ExtensionType,
  TYPE_SIZE,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";
import { unpack } from "@solana/spl-token-metadata";

describe("token_2022_nft", () => {
  // --- 测试环境设置 ---
  // 配置 Anchor 以使用本地集群
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // 从工作区加载编译好的程序
  const program = anchor.workspace.Token2022Nft as Program<Token2022Nft>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  // 为新的 Mint 账户生成一个密钥对
  const mintKeypair = anchor.web3.Keypair.generate();

  // --- PDA 和账户地址派生 ---
  // 获取 nft_authority PDA 的地址
  const [nftAuthorityPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("nft_authority")],
    program.programId,
  );

  // 获取 signer 的关联代币账户 (ATA) 地址
  const associatedTokenAccount = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
  );

  // --- 测试开始 ---
  it("成功铸造一个 Token-2022 NFT!", async () => {
    // (新增) 检查余额并在需要时请求空投，增强测试的健壮性
    const balance = await connection.getBalance(wallet.publicKey);
    // 如果余额低于 0.1 SOL，则请求 1 SOL
    if (balance < 100_000_000) {
      console.log("余额不足，正在请求空投...");
      const airdropSignature = await connection.requestAirdrop(
        wallet.publicKey,
        1_000_000_000,
      );
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature: airdropSignature,
      });
      console.log("空投成功!");
    }

    // 定义 NFT 的元数据
    const testName = "Solana Gold";
    const testSymbol = "GOLD";
    const testUri = "https://example.com/nft.json";

    console.log(`NFT Mint 账户: ${mintKeypair.publicKey.toBase58()}`);
    console.log(`接收者 ATA: ${associatedTokenAccount.toBase58()}`);
    console.log(`NFT Authority PDA: ${nftAuthorityPda.toBase58()}`);

    // --- 1. 调用链上程序的 mint_nft 指令 ---
    const txSignature = await program.methods
      .mintNft(testName, testSymbol, testUri)
      .accounts({
        signer: wallet.publicKey,
        mint: mintKeypair.publicKey,
        tokenAccount: associatedTokenAccount,
        nftAuthority: nftAuthorityPda,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair]) // 因为 mint 是一个新账户，需要它的签名
      .rpc();

    console.log("交易签名:", txSignature);

    // 等待交易确认
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: txSignature,
    });

    // --- 2. 验证链上状态 ---

    // 2a. 获取并验证 Mint 账户的状态
    // 等待一下确保账户已经创建
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mintInfo = await getMint(
      connection,
      mintKeypair.publicKey,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    );

    // 验证 Mint 权限已被移除 (这是 NFT 的关键特征)
    expect(mintInfo.mintAuthority).to.be.null;
    // 验证总供应量为 1
    expect(mintInfo.supply).to.equal(BigInt(1));
    // 验证小数位为 0
    expect(mintInfo.decimals).to.equal(0);

    // 2b. 从 Mint 账户中提取并验证元数据
    const metadataPointer = getExtensionData(
      ExtensionType.MetadataPointer,
      mintInfo.tlvData,
    );

    console.log("Metadata pointer data:", metadataPointer);
    console.log("Metadata pointer length:", metadataPointer.length);

    // 我们的元数据存储在 Mint 账户自身
    // metadataPointer is a Buffer, we need to read the PublicKey from it
    if (metadataPointer && metadataPointer.length >= 32) {
      // 只取前32字节作为公钥
      const publicKeyBytes = metadataPointer.slice(0, 32);
      const metadataAddress = new anchor.web3.PublicKey(publicKeyBytes);
      console.log("Metadata address:", metadataAddress.toBase58());
      console.log("Expected mint address:", mintKeypair.publicKey.toBase58());

      // 检查 metadata pointer 是否指向 NFT Authority
      expect(metadataAddress.toBase58()).to.equal(nftAuthorityPda.toBase58());
    } else {
      console.log("Metadata pointer is not a valid public key");
    }

    // 解析元数据 - 从 mint 账户的 TLV 数据中读取
    console.log("Mint TLV data length:", mintInfo.tlvData.length);

    // 找到元数据在 TLV 数据中的位置
    // 跳过 metadata pointer 扩展，找到 metadata 扩展
    let metadataStart = TYPE_SIZE + LENGTH_SIZE; // 跳过 metadata pointer
    metadataStart += TYPE_SIZE + LENGTH_SIZE + 64; // 跳过 metadata pointer 数据

    console.log("Metadata start position:", metadataStart);
    console.log(
      "Remaining data length:",
      mintInfo.tlvData.length - metadataStart,
    );

    // 解析元数据
    const tokenMetadata = unpack(mintInfo.tlvData.subarray(metadataStart));

    // 验证元数据字段
    expect(tokenMetadata.name).to.equal(testName);
    expect(tokenMetadata.symbol).to.equal(testSymbol);
    expect(tokenMetadata.uri).to.equal(testUri);

    // 验证自定义字段
    const levelField = tokenMetadata.additionalMetadata.find(
      (field) => field[0] === "level",
    );
    expect(levelField).to.not.be.undefined;
    expect(levelField[1]).to.equal("1");

    console.log("✅ Mint 账户和元数据验证成功!");

    // 2c. 获取并验证接收者的 ATA 状态
    const tokenAccountInfo = await getAccount(
      connection,
      associatedTokenAccount,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    );

    // 验证 ATA 中有 1 个代币
    expect(tokenAccountInfo.amount).to.equal(BigInt(1));
    // 验证 ATA 的所有者是我们的测试钱包
    expect(tokenAccountInfo.owner).to.deep.equal(wallet.publicKey);

    console.log("✅ 关联代币账户 (ATA) 验证成功!");
  });
});
