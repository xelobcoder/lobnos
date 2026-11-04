#!/usr/bin/env bash
set -euo pipefail
: "${PLS_RELEASE_ROOT:?Set the release directory outside the checkout}"
: "${PLS_PM2_APP:?Set the frontend PM2 application name}"
: "${PLS_HEALTH_URL:?Set a loopback health endpoint}"
: "${PLS_DEPLOY_REVISION:?Set the approved commit hash}"
: "${PLS_ENV_FILE:?Set the protected production environment file}"
git cat-file -e "$PLS_DEPLOY_REVISION^{commit}"
revision=$(git rev-parse "$PLS_DEPLOY_REVISION^{commit}")
release="$PLS_RELEASE_ROOT/releases/$revision"
mkdir -p "$PLS_RELEASE_ROOT/releases"
test ! -e "$release"
mkdir "$release"
git archive "$revision" | tar -x -C "$release"
install -m 600 "$PLS_ENV_FILE" "$release/.env"
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
ln -s "$release" "$PLS_RELEASE_ROOT/current.next"
mv -Tf "$PLS_RELEASE_ROOT/current.next" "$PLS_RELEASE_ROOT/current"
pm2 restart "$PLS_PM2_APP" --update-env
if ! curl --fail --silent --retry 5 --retry-connrefused "$PLS_HEALTH_URL"; then
    if [ -n "$previous" ]; then
        ln -s "$previous" "$PLS_RELEASE_ROOT/current.rollback"
        mv -Tf "$PLS_RELEASE_ROOT/current.rollback" "$PLS_RELEASE_ROOT/current"
        pm2 restart "$PLS_PM2_APP" --update-env
    fi
    exit 1
fi
