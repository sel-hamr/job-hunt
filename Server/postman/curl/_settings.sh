# Shared settings for the curl scripts. Each script loads it; don't run it alone.
#
# BASE_URL   where the server listens. Default: http://127.0.0.1:3001
# MCP_TOKEN  the MCP token. If it is not set, it is read from AUTH_TOKEN in packages/server/.env
#
# Example: MCP_TOKEN=abc... BASE_URL=http://127.0.0.1:3001 bash postman/curl/03-tools-list.sh

SETTINGS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SETTINGS_DIR/../../packages/server/.env"

BASE_URL="${BASE_URL:-http://127.0.0.1:3001}"

if [ -z "${MCP_TOKEN:-}" ] && [ -f "$ENV_FILE" ]; then
  MCP_TOKEN="$(grep -E '^AUTH_TOKEN=' "$ENV_FILE" | tail -n 1 | cut -d= -f2- | tr -d '\r"')"
fi

# Scripts that call /mcp run this first: it stops with a clear message when there is no token.
need_token() {
  if [ -z "${MCP_TOKEN:-}" ]; then
    echo "No MCP token. Set MCP_TOKEN, or AUTH_TOKEN in packages/server/.env" >&2
    exit 1
  fi
}
