# Shenqi-Box

最佳实践是：你应该优先使用 InterfaceAccount 来处理所有不属于你自己程序拥有的账户（比如 SPL Token 的 Mint 和 TokenAccount），无论是创建 (init) 它们，还是使用 (mut) 它们。

## 参考

- <https://github.com/solana-developers/program-examples/blob/main/tokens/nft-minter/anchor/programs/nft-minter/src/lib.rs>
- <https://github.com/solana-developers/program-examples/blob/main/tokens/nft-minter/anchor/programs/nft-minter/src/lib.rs>
- <https://medium.com/@elchuo160/create-your-own-on-chain-nfts-on-solana-with-anchor-and-quicknode-a-step-by-step-guide-2024-c108077013e9>
- <https://github.com/solana-developers/program-examples/blob/main/tokens/token-2022/nft-meta-data-pointer/anchor-example/anchor/programs/extension_nft/src/instructions/mint_nft.rs>
- <https://www.anchor-lang.com/docs/references/examples>
- <https://hackernoon.com/how-to-mint-solana-nft-using-anchor-and-metaplex> -<https://medium.com/@elchuo160/create-your-own-on-chain-nfts-on-solana-with-anchor-and-quicknode-a-step-by-step-guide-2024-c108077013e9>
  <https://www.anchor-lang.com/docs/tokens/extensions>
