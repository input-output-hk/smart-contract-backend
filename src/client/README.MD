# Client

Connect to the [server](../server/README.md) and subscribe to signing requests. Signing and submitting to the network are external concerns and should be handled by the application. The Apollo Client instance is exposed for DApp developers to utilise existing Apollo tools for interacting with the API.

## Test Coverage
This component is tested as part of the [e2e test suite](../../test/e2e/src/support/world.ts) and [Server integration tests](../server/application/Server.spec.ts). 