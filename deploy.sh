#!/usr/bin/env bash
set -euo pipefail

# The PM2 configuration must name PLS_PM2_APP and use PLS_RELEASE_ROOT/current
# as its working directory. Keep the existing port, arguments and environment.
: "${PLS_RELEASE_ROOT:?Set the release directory outside the checkout}"
: "${PLS_PM2_APP:?Set the frontend PM2 application name}"
: "${PLS_PM2_CONFIG:?Set the PM2 configuration file for this application}"
: "${PLS_HEALTH_URL:?Set a loopback health endpoint}"
: "${PLS_DEPLOY_REVISION:?Set the approved commit hash}"
: "${PLS_ENV_FILE:?Set the protected production environment file}"

case "$PLS_RELEASE_ROOT" in /*) ;; *) echo 'PLS_RELEASE_ROOT must be absolute' >&2; exit 1 ;; esac
case "$PLS_HEALTH_URL" in http://127.0.0.1:*/*|http://localhost:*/*|https://127.0.0.1:*/*|https://localhost:*/*) ;; *) echo 'Use a loopback health URL with an explicit port' >&2; exit 1 ;; esac
test -f "$PLS_ENV_FILE"
test -f "$PLS_PM2_CONFIG"
if [ -e "$PLS_RELEASE_ROOT/current" ] && [ ! -L "$PLS_RELEASE_ROOT/current" ]; then
    echo 'The current release path must be a symbolic link' >&2
    exit 1
fi

revision=$(git rev-parse --verify "$PLS_DEPLOY_REVISION^{commit}")
mkdir -p "$PLS_RELEASE_ROOT/releases"
lock="$PLS_RELEASE_ROOT/.deploy-lock"
if ! mkdir "$lock"; then
    echo 'Another deployment holds the release lock' >&2
    exit 1
fi
trap 'rmdir "$lock"' EXIT
release=$(mktemp -d "$PLS_RELEASE_ROOT/releases/$revision.XXXXXX")
git archive "$revision" | tar -x -C "$release"
install -m 600 "$PLS_ENV_FILE" "$release/.env"
printf '%s\n' "$revision" > "$release/DEPLOYED_REVISION"
(
    cd "$release"
    pnpm install --frozen-lockfile
    pnpm test
    pnpm run typecheck
    pnpm run typecheck:security
    pnpm run lint:security
    pnpm run build
)

previous=$(readlink -f "$PLS_RELEASE_ROOT/current" || true)
rollback() {
    local failure=$?
    trap - ERR
    if [ -n "$previous" ]; then
        ln -s "$previous" "$PLS_RELEASE_ROOT/current.rollback"
        mv -Tf "$PLS_RELEASE_ROOT/current.rollback" "$PLS_RELEASE_ROOT/current"
        pm2 startOrReload "$PLS_PM2_CONFIG" --only "$PLS_PM2_APP" --update-env
    else
        rm -- "$PLS_RELEASE_ROOT/current"
        pm2 stop "$PLS_PM2_APP"
    fi
    echo 'Deployment failed. Review the release and application logs.' >&2
    exit "$failure"
}
ln -s "$release" "$PLS_RELEASE_ROOT/current.next"
mv -Tf "$PLS_RELEASE_ROOT/current.next" "$PLS_RELEASE_ROOT/current"
trap rollback ERR
pm2 startOrReload "$PLS_PM2_CONFIG" --only "$PLS_PM2_APP" --update-env
curl --fail --silent --show-error --retry 5 --retry-connrefused --retry-all-errors --connect-timeout 5 --max-time 20 "$PLS_HEALTH_URL"
trap - ERR
printf 'Deployment verified at %s\n' "$revision"
