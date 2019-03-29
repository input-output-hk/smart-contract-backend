FROM rust:1.33-slim
RUN mkdir /application
WORKDIR /application
COPY . .
RUN rustup update nightly
RUN rustup default nightly
RUN cargo build --release
CMD "/application/target/release/smart_contract_server"