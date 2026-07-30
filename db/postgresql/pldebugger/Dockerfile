FROM postgres:15.1-alpine AS base

FROM base AS builder
RUN apk add --update make openssl-dev clang g++ krb5-dev llvm
WORKDIR /tmp
COPY pldebugger .
WORKDIR /tmp
ENV USE_PGXS=1
RUN make
RUN make install

FROM base AS dist
COPY --from=builder /usr/local/lib/postgresql/ /usr/local/lib/postgresql/
COPY --from=builder /usr/local/share/postgresql/ /usr/local/share/postgresql/
COPY --from=builder /usr/local/share/doc/postgresql/ /usr/local/share/doc/postgresql/
# COPY debugger-setup.sh /docker-entrypoint-initdb.d/