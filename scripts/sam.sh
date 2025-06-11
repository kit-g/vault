ENV=$1
TEMPLATE=$2
CONFIG=$3

PROFILE="personal"

sam build -t "$TEMPLATE"

sam deploy \
 --confirm-changeset \
 --config-env "$ENV" \
 --config-file "$CONFIG" \
 --profile "$PROFILE"
