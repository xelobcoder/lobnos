"use strict";

function parseDatabaseEnvironment(content, parse) {
  const text = String(content);
  const result = parse(text);
  // Database passwords use the whole unquoted value: # is a password character,
  // never an inline comment. Quoted values retain normal dotenv semantics.
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?((?:DB|PRODUCTION_DB|SYSTEM_CONFIG_DB|BACKUP_RESTORE_DB)_PASSWORD)\s*=\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim();
    if (!/^["'`]/.test(value)) result[match[1]] = value;
  }
  return result;
}

module.exports = { parseDatabaseEnvironment };
