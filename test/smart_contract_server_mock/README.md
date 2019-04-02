# Smart Contract Server Mock

`smart_contract_server_base64.txt` is a base64 encoded smart contract server mock. It can be used for testing the docker execution engine in place of base64 encoded Plutus contract bytecode.

This is a mocked interface, and it's final design is still unknown. The current interface is a best guess.

## Regenerating the Mock

1. Update `src/main.rs` such that the exposed HTTP endpoints match a valid Plutus contract interface
2. rustup target add x86_64-unknown-linux-gnu 
3. Compile binary: `cargo build --release --target x86_64-unknown-linux-gnu`
4a. For local use, `docker build -t samjeston/smart_contract_server_mock
4b. Sam needs to push the updated mock for CI usage until its in a shared location