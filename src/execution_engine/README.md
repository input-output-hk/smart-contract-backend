# Execution Service

_Run_ smart contracts in isolation using Chromium processes via NodeJS, or _Docker_ containers in a trusted scenario with access to a Docker daemon.

_Interact_ via a HTTP API to call contract endpoints, with the invocation result data passed back in the response.

## Interface

The execution engine interface allows consumers to load, execute and unload smart contracts.

The interface for this behaviour is defined as follows, and is exposed over HTTP:

```
// This type will be refined as integrations with Plutus proceeed
export type SmartContractResponse = any

export interface ExecutionEngine {
  load: ({contractAddress: string, executable: string}) => Promise<boolean>
  execute: ({contractAddress: string, method: string, methodArgs: string}) => Promise<{ data: SmartContractResponse }>
  unload: ({contractAddress: string}) => Promise<boolean>
}
```

The most up to date implementation of this interface in TypeScript can be seen [here](ExecutionEngine.ts)

### Docker Image Target

`executable`: A string reference to the Docker image to load

Each image needs to satisfy the following HTTP interface for each contract endpoint:

`POST /{contractEndpoint}` where method arguments are the body of the payload

### JavaScript Target

`executable`: A string that parses to a JavaScript object, containing contract endpoints

If a Plutus smart contract has two contract endpoint, `foo` & `bar`, both with a JSON argument, the `executable` string is as follows:

```
{
  foo: (fooJsonArgument) => ...,
  bar: (barJsonArgument) => ...,
}
```

If this is not a manageable target for GHCJS, the below approach is a logical alternative to the above:

```
function foo (fooJsonArgument) {
  return ...
}

function bar (barJsonArgument) {
  return ...
}

function init() {
  return { foo, bar }
}
```

The return type of these functions should be a JSON representation of the result, or a Promise that resolves to this same JSON

## Security

Running untrusted code, when there is no risk to the author of the code, is hard. To achieve this as safely as possible, the Principle of Least Privilege is followed.

### Docker Image Target

Docker should be considered a development target, or a target where only trusted contract images are to be run. Docker does not provide any kind of virtualization and as such exposes the system's kernel as a vulnerability. Namespaces and control groups can be used to greatly limit the resources and system of containers orchestrated through the Docker execution engine, however community consensus is that this is not a satisfactory paradigm for untrusted code execution.

### Javascript Target

Untrusted contract code is not run in NodeJS due to the escalated privileges available to a Node process, even when run in a tightly restricted namespace. Instead, we use the Puppeteer API to pass the executable JS blob to Chromium which then runs the endpoint in an isolated fashion. Chromium is a good fit for security and the execution of arbitrary JavaScript because Chromium's "sandbox leverages the OS-provided security to allow code execution that cannot make persistent changes to the computer or access information that is confidential. The architecture and exact assurances that the sandbox provides are dependent on the operating system."

#### Security Tests

- [Memory boundaries between pages](test/security/node_js/page_boundaries.spec.ts)
- [Isolation from NodeJS runtime and API](test/security/node_js/isolation_from_nodejs.spec.ts)
- [Load tests](test/security/node_js/load_test.spec.ts)
- [Network attacks](test/security/node_js/network_attacks.spec.ts)
- [Resource consumption attack](test/security/node_js/resource_consumption_attack.spec.ts)

#### Chromium Security Resources

- Chromium Security Architecture: https://seclab.stanford.edu/websec/chromium/chromium-security-architecture.pdf
- Chromium Sandbox Design (Linux): https://chromium.googlesource.com/chromium/src/+/HEAD/docs/linux_sandboxing.md
- Chromium Sandbox Design (Windows): https://chromium.googlesource.com/chromium/src/+/master/docs/design/sandbox.md
- Chromium Security Brag Sheet: https://www.chromium.org/Home/chromium-security/brag-sheet