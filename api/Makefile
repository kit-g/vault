build-VaultApiFunction:
	GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o $(ARTIFACTS_DIR)/bootstrap ./cmd/api/main.go

build-VaultIngestFunction:
	GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o $(ARTIFACTS_DIR)/bootstrap ./cmd/ingest/main.go
