# Smart Contract Backend

## Development

### Testing
Unit tests are placed inline within the `src` directory. Integration tests are located in the `test` directory for each service.

Run the test suit with `npm test`

### Services
#### API
##### Static Server
Manages the initialization of new contracts, transaction submission and registers pubsub handlers

##### Contract Server
Dynamically booted GraphQL instances with schemas passed from the smart contract bundle.

#### Bundles
Manages decoding, decompressing, writing and removal of bundles from the file system,

#### Execution Controller
A service that is smart contract execution aware. This service does not do the execution directly, but is responsible for passing contract calls to the technology specific execution engine.

#### Storage
Generic storage interface for the list of contract servers, and available ports for new contract servers.

Storage is currently in-memory, but could easily be moved to sqlite or similar.

#### FS
Promisified file system helpers