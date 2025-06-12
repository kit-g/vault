#!/bin/bash

export PATH="$PATH:$(go env GOPATH)/bin"
swag init --generalInfo api/cmd/api/main.go --output api/docs
