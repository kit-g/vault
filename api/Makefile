build-VaultApiFunction:
	GOOS=linux GOARCH=amd64 go build \
		-ldflags="-s -w \
			-X 'vault/internal/httpx.Commit=$(shell git rev-parse HEAD)' \
			-X 'vault/internal/httpx.DeployedAt=$(shell date -u +%Y-%m-%dT%H:%M:%SZ)'" \
		-o $(ARTIFACTS_DIR)/bootstrap ./cmd/api/main.go

build-VaultIngestFunction:
	GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o $(ARTIFACTS_DIR)/bootstrap ./cmd/ingest/main.go
