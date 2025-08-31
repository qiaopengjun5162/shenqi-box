import {
  createSolanaRpcFromTransport,
  createDefaultRpcTransport,
  getAddressFromPublicKey,
  createKeyPairFromBytes,
  type KeyPairSigner,
} from "@solana/kit";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import { TOKEN2022_NFT_PROGRAM_ADDRESS } from "../clients/ts/token_2022_nft/programs/token2022Nft.js";
import { assert } from "console";

// --- 1. 配置管理 ---

dotenv.config();

const homeDir = process.env.HOME;
if (!homeDir) {
  throw new Error("HOME environment variable is not set.");
}

const CONFIG = {
  cluster: process.env.CLUSTER_NAME || "devnet",
  rpcUrl: process.env.DEVNET_RPC_URL || "https://api.devnet.solana.com",
  walletPath:
    process.env.ANCHOR_WALLET || path.join(homeDir, ".config/solana/id.json"),
};

// ---  主执行函数 ---

async function main() {
  console.log("🚀 [最终测试] 正在初始化客户端并加载钱包...");

  try {
    const transport = createDefaultRpcTransport({
      url: CONFIG.rpcUrl,
    });
    const rpc = createSolanaRpcFromTransport(transport);

    if (!fs.existsSync(CONFIG.walletPath)) {
      throw new Error(`钱包文件未找到，路径: ${CONFIG.walletPath}`);
    }

    const keypairFile = fs.readFileSync(CONFIG.walletPath);
    const keypairBytes = new Uint8Array(JSON.parse(keypairFile.toString()));

    // Create a CryptoKeyPair from the bytes.
    const { privateKey, publicKey } =
      await createKeyPairFromBytes(keypairBytes);
    const walletAddress = await getAddressFromPublicKey(publicKey);
    console.log(`🔑 钱包地址: ${walletAddress}`);

    const slot = await rpc.getSlot().send();

    console.log("\n✅ 基础框架搭建成功!");
    console.log(`   - RPC 端点: ${CONFIG.rpcUrl}`);
    console.log(`   - 最新区块: ${slot}`);
    console.log(`   - 程序地址: ${TOKEN2022_NFT_PROGRAM_ADDRESS}`);
    console.log(`   - 已加载钱包 (签名者): ${walletAddress}`);
  } catch (error) {
    console.error("\n❌ 在初始化过程中发生错误:", error);
  }
}

main();
