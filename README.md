# Smart Contract Backend

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

### Services
#### Server
##### API
The API exposes GraphQL endpoints for the initialization of new contracts, transaction submission and registers pubsub handlers

Initialized contracts are exposed by their own GraphQL instances with schemas passed from the smart contract bundle.

##### Execution Controller

Provides the interface for calls to protocol specific execution engines.

#### Execution Engines
##### Docker
A Docker-based execution engine compatible with off-chain Plutus x86 bytecode. The engine uses containers for isolated execution and routes incoming requests via the contract's HTTP interface.

