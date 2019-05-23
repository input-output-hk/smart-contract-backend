# Execution Engine

The Smart Contract Backend Execution Engine provides a pluggable way to execute smart contracts.

An execution engine is configured for each executable target. At the moment these include Docker images and plain JavaScript. Configuration includes the launch of a web server for the executable target.

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

## Security

Running untrusted code, when there is no risk to the author of the code, is hard. To achieve this as safely as possible, the Principle of Least Privilege is followed.

### Docker (Docker Image Target)

Docker should be considered a development target, or a target where only trusted contract images are to be run. Docker does not provide any kind of virtualization and as such exposes the system's kernel as a vulnerability. Namespaces and control groups can be used to greatly limit the resources and system of containers orchestrated through the Docker execution engine, however community consensus is that this is not a satisfactory paradigm for untrusted code execution.

### NodeJS

We don't run untrusted contract code in NodeJS itself due to the privileges available to a Node process. Instead, we use the Puppeteer API to pass the executable JS blob to Chromium which then runs the endpoint in an isolated fashion. Chromium is a good fit for security and the execution of arbitrary JavaScript because Chromium's "sandbox leverages the OS-provided security to allow code execution that cannot make persistent changes to the computer or access information that is confidential. The architecture and exact assurances that the sandbox provides are dependent on the operating system."

#### Security Tests

- [Memory boundaries between pages](node_js/security/page_boundaries.spec.ts)
- [Isolation from NodeJS runtime and API](node_js/security/isolation_from_nodejs.spec.ts)
- [Load tests](node_js/security/load_test.spec.ts)
- [Network attacks](node_js/security/network_attacks.spec.ts)
- [Resource consumption attack](node_js/security/resource_consumption_attack.spec.ts)

#### Chromium Security Resources

- Chromium Security Architecture: https://seclab.stanford.edu/websec/chromium/chromium-security-architecture.pdf
- Chromium Sandbox Design (Linux): https://chromium.googlesource.com/chromium/src/+/HEAD/docs/linux_sandboxing.md
- Chromium Sandbox Design (Windows): https://chromium.googlesource.com/chromium/src/+/master/docs/design/sandbox.md
- Chromium Security Brag Sheet: https://www.chromium.org/Home/chromium-security/brag-sheet