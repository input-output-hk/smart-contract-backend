FROM rust:1.33-slim as builder
RUN mkdir /application
WORKDIR /application
COPY . .
RUN rustup update nightly
RUN rustup default nightly
RUN cargo build --release

FROM ubuntu:xenial
COPY --from=builder /application/target/release/smart_contract_server .
COPY --from=builder /application/Rocket.toml .
CMD "/smart_contract_server"