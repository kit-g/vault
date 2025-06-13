# --- Stage 1: Build ---
FROM golang:1.23.1-alpine AS builder

# Set up dependencies
RUN apk add --no-cache git

# Create working directory
WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY .. .

# Build the binary
RUN go build -o vault ./cmd/api/main.go


# --- Stage 2: Run ---
FROM alpine:3.22.0

# Install CA certs
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/vault /vault

# Expose default port
EXPOSE 8080

# Run the app
ENTRYPOINT ["/vault"]
