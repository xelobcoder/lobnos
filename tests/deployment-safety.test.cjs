const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const bash = process.env.PLS_TEST_BASH || (process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash');
const shellPath = value => value.replaceAll('\\', '/').replace(/^([A-Za-z]):/, (_, drive) => '/' + drive.toLowerCase());

// Exercise the actual deployment script with fake external commands. All writes
// stay in a temporary fixture, and PM2, package installation and HTTP are mocked.
function deployment(failure) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'pls-deploy-test-'));
    const release = path.join(directory, 'releases', 'fixture.fresh');
    fs.mkdirSync(release, {recursive: true});
    fs.writeFileSync(path.join(directory, 'fixture.env'), 'TEST_ONLY=true');
    fs.writeFileSync(path.join(directory, 'pm2.cjs'), 'module.exports = {}');
    const prelude = `
        export PLS_RELEASE_ROOT="$2"
        export PLS_PM2_APP=fixture-app
        export PLS_PM2_CONFIG="$2/pm2.cjs"
        export PLS_HEALTH_URL=http://127.0.0.1:2377/health
        export PLS_DEPLOY_REVISION=fixture
        export PLS_ENV_FILE="$2/fixture.env"
        export PLS_TEST_FAILURE="$3"
        export PLS_TEST_LOG="$2/commands.log"
        calls=0
        git() { if [ "$1" = rev-parse ]; then printf 'fixture'; fi; }
        tar() { cat >/dev/null; }
        install() { printf 'install\\n' >> "$PLS_TEST_LOG"; }
        mktemp() { printf '%s/releases/fixture.fresh' "$PLS_RELEASE_ROOT"; }
        readlink() { printf '%s/releases/previous' "$PLS_RELEASE_ROOT"; }
        ln() { printf 'link %s %s\\n' "$2" "$3" >> "$PLS_TEST_LOG"; }
        mv() { printf 'move %s %s\\n' "$2" "$3" >> "$PLS_TEST_LOG"; }
        pnpm() {
            printf 'pnpm %s\\n' "$*" >> "$PLS_TEST_LOG"
            if [ "$PLS_TEST_FAILURE" = build ] && [ "$*" = 'run build' ]; then return 1; fi
        }
        pm2() {
            calls=$((calls+1))
            printf 'pm2 %s\\n' "$*" >> "$PLS_TEST_LOG"
            if [ "$PLS_TEST_FAILURE" = restart ] && [ "$calls" = 1 ]; then return 1; fi
        }
        curl() {
            printf 'health\\n' >> "$PLS_TEST_LOG"
            if [ "$PLS_TEST_FAILURE" = health ]; then return 1; fi
        }
        source "$1"
    `;
    try {
        const result = spawnSync(bash, ['-c', prelude, 'deployment-test', shellPath(path.join(root, 'deploy.sh')), shellPath(directory), failure], {encoding: 'utf8', timeout: 30000});
        assert.ifError(result.error);
        const log = fs.existsSync(path.join(directory, 'commands.log')) ? fs.readFileSync(path.join(directory, 'commands.log'), 'utf8') : '';
        assert.equal(fs.existsSync(path.join(directory, '.deploy-lock')), false, result.stderr);
        return {status: result.status, log, stderr: result.stderr};
    } finally {
        fs.rmSync(directory, {recursive: true, force: true});
    }
}

test('deployment shell syntax is valid', () => {
    const result = spawnSync(bash, ['-n', path.join(root, 'deploy.sh')], {encoding: 'utf8'});
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
});

test('deployment completes all gates before activating the named app', () => {
    const result = deployment('none');
    assert.equal(result.status, 0, result.stderr);
    for (const command of ['install --frozen-lockfile', 'test', 'run typecheck', 'run typecheck:security', 'run lint:security', 'run build']) assert.ok(result.log.includes('pnpm ' + command));
    assert.ok(result.log.indexOf('pnpm run build') < result.log.indexOf('current.next'));
    assert.equal((result.log.match(/pm2 /g) || []).length, 1);
    assert.match(result.log, /--only fixture-app --update-env/);
    assert.match(result.log, /health/);
});

test('failed build leaves the active app alone and releases the deployment lock', () => {
    const result = deployment('build');
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.log, /pm2 |current.next|health/);
});

for (const failure of ['restart', 'health']) test(failure + ' failure restores the previous release and reloads only the named app', () => {
    const result = deployment(failure);
    assert.notEqual(result.status, 0);
    assert.match(result.log, /releases\/previous.*current.rollback/);
    assert.equal((result.log.match(/pm2 /g) || []).length, 2);
    assert.doesNotMatch(result.log, /restart all|--only (?!fixture-app)/);
});

test('CI keeps read-only permissions and runs the full verification gates', () => {
    const workflow = fs.readFileSync(path.join(root, '.github/workflows/checks.yml'), 'utf8');
    assert.match(workflow, /contents: read/);
    for (const command of ['pnpm install --frozen-lockfile', 'pnpm run typecheck', 'pnpm run typecheck:security', 'pnpm run lint:security', 'pnpm test', 'pnpm run build']) assert.ok(workflow.includes(command));
});
