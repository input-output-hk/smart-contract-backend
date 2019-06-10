# Smart Contract Backend

Run off-chain smart contract executables server-side in isolation, accessible via a GraphQL interface. The [server](src/server/README.md) exposes a GraphQL control API for loading contracts and subscribing to signing requests for transactions generated by the contracts. An [execution service](src/execution_service/README.md) isolates potentially untrusted code execution, enabling interaction with the contracts via a [Docker](src/execution_service/infrastructure/execution_engines/DockerExecutionEngine.ts) or [NodeJS](src/execution_service/infrastructure/execution_engines/NodeJsExecutionEngine.ts) engine.

The primary goal for the project is to deliver [a runtime and interaction model for Plutus](docs/Plutus_runtime_and_interaction_model.md), however there is no fixed coupling to any particular Smart Contract language, as demonstrated by implementing [support for Solidity](src/server/infrastructure/engine_clients/solidity/SolidityEngineClient.ts).

 - [Features](features)
 - [More documentation](docs)

## Project State: Alpha
This system is a work in progress, and dependent on external tooling efforts. The Docker-based engine will likely be first to reach stability, but development on both engines is happening in parallel.

## Development

### Docker Compose
1. Uncomment the volumes for the service you are working on in `docker-compose.yml`
2. docker-compose up
3. Run a TypeScript file watcher for live reloading of development changes

Swagger API documentation for docker execution engine available at `/docs`

### Testing
Unit tests are placed inline within the `src` directory. Integration tests are located in the `test` directory for each service.

Run the test suit with `npm test`

A running Docker daemon is required for the tests to run.

Depending on network speed, you may need to run `docker pull samjeston/smart_contract_server_mock` prior to running the test suite to avoid timeouts.
