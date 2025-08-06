# Makefile 使用说明

这个 Makefile 为你的 Anchor 项目提供了完整的开发工作流程自动化。

## 快速开始

### 1. 项目初始化

```bash
make setup
```

这会检查必要的工具（Solana CLI、Anchor CLI）并安装依赖。

### 2. 构建项目

```bash
make build
```

构建所有程序（metaplex_nft 和 shenqi-box）。

### 3. 运行测试

```bash
make test
```

在本地网络上运行所有测试。

## 常用命令

### 构建相关

- `make build` - 构建所有程序
- `make build-one PROGRAM=shenqi-box` - 构建特定程序
- `make clean` - 清理构建文件并重新安装依赖
- `make clean-build` - 仅清理构建文件

### 测试相关

- `make test` - 运行所有测试（使用 anchor test）
- `make test-program PROGRAM=metaplex_nft CLUSTER=localnet` - 测试特定程序
- `make test-metaplex-nft CLUSTER=devnet` - 专门的 NFT 测试脚本

### 部署相关

- `make deploy PROGRAM=shenqi-box CLUSTER=devnet` - 部署特定程序
- `make upgrade PROGRAM=shenqi-box PROGRAM_ID=<program_id>` - 升级程序
- `make idl-init PROGRAM=shenqi-box PROGRAM_ID=<program_id>` - 初始化 IDL
- `make idl-upgrade PROGRAM=shenqi-box PROGRAM_ID=<program_id>` - 升级 IDL

### 开发工具

- `make start-localnet` - 启动本地验证器
- `make stop-localnet` - 停止本地验证器
- `make reset-localnet` - 重置本地验证器（停止并重启）
- `make logs` - 查看本地验证器日志

### 代码质量

- `make fmt` - 格式化 Rust 代码
- `make fmt-check` - 检查代码格式
- `make lint` - 运行所有代码检查
- `make lint-fix` - 自动修复代码问题

### 实用工具

- `make check-balance` - 检查钱包余额
- `make check-cluster` - 显示当前集群配置
- `make size` - 检查程序二进制文件大小
- `make coverage` - 生成测试覆盖率报告

## 环境变量

你可以在 `.env` 文件中设置以下变量：

```bash
# RPC URLs
DEVNET_RPC_URL="https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY"
MAINNET_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"

# 钱包路径
WALLET=~/.config/solana/id.json

# 计算单元价格
COMPUTE_UNIT_PRICE=100000
```

## 集群选择

默认使用 devnet，可以通过 CLUSTER 参数指定：

```bash
make deploy PROGRAM=shenqi-box CLUSTER=localnet
make deploy PROGRAM=shenqi-box CLUSTER=devnet
make deploy PROGRAM=shenqi-box CLUSTER=mainnet-beta
```

## 项目结构

```bash
shenqi-box/
├── programs/
│   ├── metaplex_nft/     # NFT 相关程序
│   └── shenqi-box/       # 主程序
├── tests/                 # 测试文件
├── scripts/               # 脚本文件
│   └── test-metaplex-nft.ts  # NFT 测试脚本
├── migrations/            # 部署脚本
└── Makefile              # 这个文件
```

## 使用示例

### 本地开发

```bash
# 启动本地验证器
make start-localnet

# 测试特定程序
make test-program PROGRAM=metaplex_nft CLUSTER=localnet

# 重置本地验证器
make reset-localnet
```

### Devnet 部署

```bash
# 部署到 devnet
make deploy PROGRAM=metaplex_nft CLUSTER=devnet

# 测试已部署的程序
make test-program PROGRAM=metaplex_nft CLUSTER=devnet SKIP_DEPLOY=true

# 使用专门的 NFT 测试脚本
make test-metaplex-nft CLUSTER=devnet
```

### 代码质量检查

```bash
# 格式化代码
make fmt

# 运行代码检查
make lint

# 生成覆盖率报告
make coverage
```

## 故障排除

### 常见问题

1. **"Solana CLI not found"**

   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **"Anchor CLI not found"**

   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   ```

3. **构建失败**

   ```bash
   make clean
   make build
   ```

4. **测试失败**

   ```bash
   make start-localnet
   make test
   ```

5. **本地测试连接问题**

   ```bash
   # 确保本地验证器运行
   make start-localnet

   # 等待几秒钟让验证器启动
   sleep 5

   # 然后运行测试
   make test-program PROGRAM=metaplex_nft CLUSTER=localnet
   ```

6. **NFT 测试图片不显示**
   - 检查 `meta.json` 中的图片 URL 是否可访问
   - 确保 GitHub Gist 或图片链接是公开的
   - 可能需要等待几分钟让图片缓存更新

### 获取帮助

```bash
make help
```

显示所有可用命令的详细说明。

## 高级用法

### 跳过部署的测试

```bash
# 测试已部署的程序，不重新部署
make test-program PROGRAM=metaplex_nft CLUSTER=devnet SKIP_DEPLOY=true
```

### 自定义 RPC URL

```bash
# 使用自定义 RPC URL
RPC_URL="https://your-custom-rpc.com" make deploy PROGRAM=metaplex_nft CLUSTER=devnet
```

### 程序升级

```bash
# 升级已部署的程序
make upgrade PROGRAM=metaplex_nft PROGRAM_ID=HNyPqG6w1NQTx4gEB4eHGFJNDMQQJibc8LQwJqJ5awoo CLUSTER=devnet
```

### IDL 管理

```bash
# 初始化 IDL
make idl-init PROGRAM=metaplex_nft PROGRAM_ID=HNyPqG6w1NQTx4gEB4eHGFJNDMQQJibc8LQwJqJ5awoo CLUSTER=devnet

# 升级 IDL
make idl-upgrade PROGRAM=metaplex_nft PROGRAM_ID=HNyPqG6w1NQTx4gEB4eHGFJNDMQQJibc8LQwJqJ5awoo CLUSTER=devnet

# 归档 IDL
make archive-idl PROGRAM=metaplex_nft
```
