const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parse } = require('dotenv');
const { parseDatabaseEnvironment } = require('./database-environment.cjs');

test('database password hashes survive desktop configuration and child-process environment', () => {
  for (const key of ['DB_PASSWORD', 'PRODUCTION_DB_PASSWORD', 'SYSTEM_CONFIG_DB_PASSWORD', 'BACKUP_RESTORE_DB_PASSWORD']) {
    for (const password of ['qa##db', '##qa', 'qa##', 'qa#db=with$dollars']) {
      const env = parseDatabaseEnvironment(`${key}=${password}\nPORT=2300 # comment\n`, parse);
      assert.equal(env[key], password);
      const child = require('node:child_process').spawnSync(process.execPath, ['-e', `process.exit(process.env.${key} === process.env.EXPECTED ? 0 : 1)`], {env:{...process.env, ...env, EXPECTED:password}});
      assert.equal(child.status, 0);
      assert.equal(env.PORT, '2300');
    }
  }
});

test('quoted passwords and other dotenv fields keep their existing semantics', () => {
  const text = 'DB_PASSWORD=" qa##db "\nSYSTEM_CONFIG_DB_PASSWORD=\'qa##db\'\nEMAIL_PASSWORD=mail # comment\n# DB_PASSWORD=ignored\n';
  const env = parseDatabaseEnvironment(text, parse);
  assert.equal(env.DB_PASSWORD, ' qa##db ');
  assert.equal(env.SYSTEM_CONFIG_DB_PASSWORD, 'qa##db');
  assert.equal(env.EMAIL_PASSWORD, 'mail');
});
