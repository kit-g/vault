#!/bin/bash

export PATH="$PATH:$(go env GOPATH)/bin"
swag init --generalInfo cmd/main.go --output docs
