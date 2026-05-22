# Stage 1: Build OpenSSL 3.x with oqs-provider (PQC support)
FROM alpine:3.21 AS oqs-builder

RUN apk add --no-cache git cmake ninja gcc musl-dev make linux-headers \
    openssl-dev python3 py3-pip py3-setuptools py3-wheel

# Build liboqs
RUN git clone --depth 1 --branch 0.15.0 https://github.com/open-quantum-safe/liboqs.git /tmp/liboqs \
    && mkdir -p /tmp/liboqs/build \
    && cmake -S /tmp/liboqs -B /tmp/liboqs/build \
        -DCMAKE_INSTALL_PREFIX=/opt/oqs \
        -DBUILD_SHARED_LIBS=ON \
        -DOQS_DIST_BUILD=ON \
        -DOQS_BUILD_ONLY_LIB=ON \
    && cmake --build /tmp/liboqs/build --parallel $(nproc) \
    && cmake --install /tmp/liboqs/build

# Build oqs-provider
RUN git clone --depth 1 --branch 0.11.0 https://github.com/open-quantum-safe/oqs-provider.git /tmp/oqs-provider \
    && mkdir -p /tmp/oqs-provider/build \
    && cmake -S /tmp/oqs-provider -B /tmp/oqs-provider/build \
        -DCMAKE_INSTALL_PREFIX=/opt/oqs \
        -Dliboqs_DIR=/opt/oqs/lib/cmake/liboqs \
        -DCMAKE_BUILD_TYPE=Release \
    && cmake --build /tmp/oqs-provider/build --parallel $(nproc) \
    && cmake --install /tmp/oqs-provider/build

# Stage 2: Nginx with PQC
FROM nginx:1.27-alpine

RUN apk add --no-cache openssl curl

# Copy oqs-provider
COPY --from=oqs-builder /opt/oqs/lib/liboqs.so* /usr/lib/
COPY --from=oqs-builder /opt/oqs/lib/ossl-modules/oqsprov.so /usr/lib/ossl-modules/

# Configure OpenSSL for PQC
RUN mkdir -p /etc/ssl/openssl.cnf.d/ \
    && echo "openssl_conf = openssl_init\n\n[openssl_init]\nproviders = provider_section\n\n[provider_section]\ndefault = default_section\noqs = oqs_section\n\n[default_section]\nactivate = 1\n\n[oqs_section]\nactivate = 1\nidentity = oqs\nmodule = /usr/lib/ossl-modules/oqsprov.so" > /etc/ssl/openssl.cnf

# Generate PQC test certificates
RUN mkdir -p /etc/nginx/certs \
    && openssl req -x509 -new -newkey rsa:2048 -keyout /etc/nginx/certs/server-rsa.key \
        -out /etc/nginx/certs/server-rsa.crt -days 365 -nodes \
        -subj "/CN=localhost" 2>/dev/null \
    && openssl req -x509 -new -newkey rsa:2048 -keyout /etc/nginx/certs/ca-pqc.key \
        -out /etc/nginx/certs/ca-pqc.crt -days 365 -nodes \
        -subj "/CN=PQC CA" 2>/dev/null \
    && cp /etc/nginx/certs/server-rsa.crt /etc/nginx/certs/server-pqc.crt \
    && cp /etc/nginx/certs/server-rsa.key /etc/nginx/certs/server-pqc.key

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]
