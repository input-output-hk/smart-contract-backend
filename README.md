# Smart Contract Backend

## Development

### Testing
Unit tests are placed inline within the `src` directory. Integration tests are located in the `test` directory for each service.

Run the test suit with `npm test`

### Services
#### Bundles
Manages decoding, decompressing, writing and removal of bundles from the file system,

#### API
##### Static Server
Manages the initialization of new contracts, transaction submission and registers pubsub handlers

##### Contract Server
Dynamically booted GraphQL instances with schemas passed from the smart contract bundle.

#### Storage
Generic storage interface for the list of contract servers, and available ports for new contract servers.

Storage is currently in-memory, but could easily be moved to sqlite or similar.

#### FS
Promisified file system helpers