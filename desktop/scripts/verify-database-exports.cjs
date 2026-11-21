const fs = require('node:fs');
const path = require('node:path');
const REQUIRED = ['db-exports/primelabmaster/tables-structure', 'db-exports/primelabmaster/seeds'];
function verifyExports(root) {
  return REQUIRED.map(relative => {
    const directory = path.join(root, relative);
    if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) throw new Error(`Required facility structure assets are missing: ${directory}`);
    const files = fs.readdirSync(directory).filter(name => name.endsWith('.sql') && fs.statSync(path.join(directory, name)).isFile());
    if (!files.length || files.some(name => fs.statSync(path.join(directory, name)).size === 0)) throw new Error(`Required SQL assets are missing or empty: ${directory}`);
    const expected = relative.endsWith('tables-structure') ? 288 : 9;
    if (files.length !== expected) throw new Error(`Incomplete facility SQL assets: ${directory}; expected ${expected}, found ${files.length}`);
    if (relative.endsWith('tables-structure') && !['primelabtestmig_roles.sql','primelabtestmig_routines.sql'].every(name=>files.includes(name))) throw new Error(`Required facility structure/routines assets are missing: ${directory}`);
    return {directory: relative, files: files.length};
  });
}
if (require.main === module) {
  try { console.log(JSON.stringify(verifyExports(path.resolve(process.argv[2] || path.join(__dirname, '..'))))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = {verifyExports};
