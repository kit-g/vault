#!/bin/bash

# runs from the root of the project
export PATH="$PATH:$(go env GOPATH)/bin"
swag2op init \
  --generalInfo api/cmd/api/main.go \
  --output api/docs \
  --openapiOutputDir api/docs


cp api/docs/swagger.json web/src/docs/swagger.json