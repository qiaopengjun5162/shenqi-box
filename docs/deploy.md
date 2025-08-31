# Metaplex NFT

## 实操

```bash
shenqi-box on  master [?] via 🦀 1.88.0 on 🐳 v28.2.2 (orbstack) took 11.6s
➜ make deploy PROGRAM=metaplex_nft CLUSTER=devnet
Verifying program configurations...
✓ Program metaplex_nft found
✓ Program shenqi-box found
All programs verified.
Building all programs: metaplex_nft shenqi-box...
    Finished `release` profile [optimized] target(s) in 0.39s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.39s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/metaplex_nft-0247b4c2bcc257db)
    Finished `release` profile [optimized] target(s) in 0.12s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.12s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/shenqi_box-d4eb7a1fecd4c1d5)
Deploying program [metaplex_nft] with priority fee to cluster: devnet...
Using RPC URL: https://solana-devnet.g.alchemy.com/v2/wetra8HLzo_m-UswS8UJCnwdzS40X2wN
Priority fee: 100000 micro-lamports
# 使用 --program-name 指定程序，并带上优先费
Deploying cluster: https://solana-devnet.g.alchemy.com/v2/wetra8HLzo_m-UswS8UJCnwdzS40X2wN
Upgrade authority: /Users/qiaopengjun/.config/solana/id.json
Deploying program "metaplex_nft"...
Program path: /Users/qiaopengjun/Code/Solana/shenqi-box/target/deploy/metaplex_nft.so...
Program Id: HNyPqG6w1NQTx4gEB4eHGFJNDMQQJibc8LQwJqJ5awoo

Signature: 2ED8MutKysJ64qSAxBdJvmwZbceESSmSDKwgnhWCWE2ewzA2EZEunqrWWapVSidemD9cSz9pC4pX5fa5nggNENvN

Deploy success

shenqi-box on  master [?] via 🦀 1.88.0 on 🐳 v28.2.2 (orbstack) took 26.2s
➜ make idl-init PROGRAM=metaplex_nft PROGRAM_ID=HNyPqG6w1NQTx4gEB4eHGFJNDMQQJibc8LQwJqJ5awoo
Initializing IDL for program [metaplex_nft] with ID [HNyPqG6w1NQTx4gEB4eHGFJNDMQQJibc8LQwJqJ5awoo] on cluster: devnet...
Idl data length: 640 bytes
Step 0/640
Step 600/640
Idl account created: E1TDHJgpQkgGWNESu82cPXTsWFa5G78Z2kC5PcQH2su6

shenqi-box on  master [?] via 🦀 1.88.0 on 🐳 v28.2.2 (orbstack) took 13.3s
➜ make archive-idl PROGRAM=metaplex_nft
Verifying program configurations...
✓ Program metaplex_nft found
✓ Program shenqi-box found
All programs verified.
Building all programs: metaplex_nft shenqi-box...
    Finished `release` profile [optimized] target(s) in 0.47s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.49s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/metaplex_nft-0247b4c2bcc257db)
    Finished `release` profile [optimized] target(s) in 0.12s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.16s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/shenqi_box-d4eb7a1fecd4c1d5)
Archiving IDL for [metaplex_nft]...
IDL for metaplex_nft successfully archived to idls/metaplex_nft/metaplex_nft-2025-08-06-094040.json

shenqi-box on  master [?] via 🦀 1.88.0 on 🐳 v28.2.2 (orbstack) took 2.7s
➜ diff target/idl/metaplex_nft.json idls/metaplex_nft/metaplex_nft-2025-08-06-094040.json


shenqi-box on  master [?] via 🦀 1.88.0 on 🐳 v28.2.2 (orbstack) took 58.7s
➜ solana confirm -v 5XhaYu7cGMG2QN5n84pWbpWwYpeNL28gbG97Zo3E8NaZpgnpa5pF7EJiKsncxwWbbbqJ6gKBXQKsor8rXpMMSzxi --url https://solana-devnet.g.alchemy.com/v2/wetra8HLzo_m-UswS8UJCnwdzS40X2wN


➜ make build-one PROGRAM=token_2022_nft
Verifying program configurations...
✓ Program metaplex_nft found
✓ Program shenqi-box found
All programs verified.
Building single program: [token_2022_nft]...
    Finished `release` profile [optimized] target(s) in 0.38s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.36s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/token_2022_nft-9156bfe6ddb95686)

shenqi-box on  main [!?] via 🐪 v5.34.1 via 🦀 1.89.0
➜ make deploy PROGRAM=token_2022_nft CLUSTER=devnet
Verifying program configurations...
✓ Program metaplex_nft found
✓ Program shenqi-box found
All programs verified.
Building all programs: metaplex_nft shenqi-box...
    Finished `release` profile [optimized] target(s) in 0.12s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.11s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/metaplex_nft-5ba33297d72a8233)
    Finished `release` profile [optimized] target(s) in 0.12s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.12s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/shenqi_box-fecd67cfbab366ae)
    Finished `release` profile [optimized] target(s) in 0.13s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.12s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/token_2022_nft-9156bfe6ddb95686)
Deploying program [token_2022_nft] with priority fee to cluster: devnet...
Using RPC URL: https://solana-devnet.g.alchemy.com/v2/wvX_VlsvVsKAfbkS5P7xu
Priority fee: 100000 micro-lamports
Deploying cluster: https://solana-devnet.g.alchemy.com/v2/wvX_VlsvVsKAfbkS5P7xu
Upgrade authority: /Users/qiaopengjun/.config/solana/id.json
Deploying program "token_2022_nft"...
Program path: /Users/qiaopengjun/Code/Solana/shenqi-box/target/deploy/token_2022_nft.so...
Program Id: 2PLQsLqv33ZAtLh4WA7BCnnXTNsrZEY3QBxhVDx8JZTe

Signature: 3MqNZkpR1tAXZMWA9gS384QzLo2VTDSBcJYuamz2A435L6DUrXD87ww41gaRcCd2JEwK7H4gxyzv2NThUVXcNiaE

Deploy success

shenqi-box on  main [!?] via 🐪 v5.34.1 via 🦀 1.89.0 took 31.9s
➜ make idl-init PROGRAM=token_2022_nft PROGRAM_ID=2PLQsLqv33ZAtLh4WA7BCnnXTNsrZEY3QBxhVDx8JZTe
Initializing IDL for program [token_2022_nft] with ID [2PLQsLqv33ZAtLh4WA7BCnnXTNsrZEY3QBxhVDx8JZTe] on cluster: devnet...
Idl data length: 707 bytes
Step 0/707
Step 600/707
Idl account created: 5q14536WDws2jPcBT2udoF7kojRSmpnz1H1rLQcgkfr8

shenqi-box on  main [!?] via 🐪 v5.34.1 via 🦀 1.89.0 took 14.0s
➜ make archive-idl PROGRAM=token_2022_nft
Verifying program configurations...
✓ Program metaplex_nft found
✓ Program shenqi-box found
All programs verified.
Building all programs: metaplex_nft shenqi-box...
    Finished `release` profile [optimized] target(s) in 0.48s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.40s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/metaplex_nft-5ba33297d72a8233)
    Finished `release` profile [optimized] target(s) in 0.12s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.12s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/shenqi_box-fecd67cfbab366ae)
    Finished `release` profile [optimized] target(s) in 0.13s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.12s
     Running unittests src/lib.rs (/Users/qiaopengjun/Code/Solana/shenqi-box/target/debug/deps/token_2022_nft-9156bfe6ddb95686)
Archiving IDL for [token_2022_nft]...
IDL for token_2022_nft successfully archived to idls/token_2022_nft/token_2022_nft-2025-08-31-000623.json

```

## 参考

- <https://explorer.solana.com/address/iDomECVn6E99WcRzUwsnDoXiDUDTsByBHP9yZqpRtGd?cluster=devnet>
- <https://explorer.solana.com/address/iDomECVn6E99WcRzUwsnDoXiDUDTsByBHP9yZqpRtGd?cluster=devnet>
- <https://explorer.solana.com/address/8a3utMPg14fUEgPAy6GCpbaKxe2jnmtjMiAmvVGgdMz4?cluster=devnet>
- <https://solscan.io/token/BuSiPDmWhvkWQrEgmRXkpNqi7oxDUnAiegHH33X4J7BF?cluster=devnet>
