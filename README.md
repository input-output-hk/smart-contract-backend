# Smart Contract Backend

## Development

### Docker Compose
1. Uncomment the volumes for the service you are working on in `docker-compose.yml`
2. docker-compose up
3. Run a TypeScript file watcher for live reloading of development changes

Swagger API documentation for docker execution engine available at `locahosthost:9000/docs`

### Testing
Unit tests are placed inline within the `src` directory. Integration tests are located in the `test` directory for each service.

Run the test suit with `npm test`

A running Docker daemon is required for the tests to run.

### Services
#### API
##### Static Server
Manages the initialization of new contracts, transaction submission and registers pubsub handlers

##### Contract Server
Dynamically booted GraphQL instances with schemas passed from the smart contract bundle.

#### Docker Execution
A Docker-based execution engine compatible with off-chain Plutus x86 bytecode. The engine uses containers for isolated execution and routes incoming requests via the contract's HTTP interface.

#### Bundles
Manages decoding, decompressing, writing and removal of bundles from the file system,

#### Execution Controller
A service that is smart contract execution aware. This service does not do the execution directly, but is responsible for passing contract calls to the technology specific execution engine.

#### Storage
Generic storage interface for the list of contract servers, and available ports for new contract servers.

Storage is currently in-memory, but could easily be moved to sqlite or similar.

#### FS
Promisified file system helpers
