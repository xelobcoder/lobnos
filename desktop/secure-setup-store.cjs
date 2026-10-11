"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { SetupError } = require("./setup-config.cjs");

function requireEncryption(storage) {
	if (!storage || !storage.isEncryptionAvailable() ||
		(storage.getSelectedStorageBackend && storage.getSelectedStorageBackend() === "basic_text")) {
		throw new SetupError("OS credential encryption is unavailable. Enable Windows DPAPI / an OS keyring before local setup.");
	}
}
function restrict(target, directory) {
	if (process.platform !== "win32") { fs.chmodSync(target, directory ? 0o700 : 0o600); return; }
	const system = path.join(process.env.SystemRoot || "C:\\Windows", "System32");
	const output = execFileSync(path.join(system, "whoami.exe"), ["/user", "/fo", "csv", "/nh"],
		{ encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
	const sid = output.match(/S-1-5-[0-9-]+/)?.[0];
	if (!sid) throw new Error("Could not resolve current Windows identity.");
	// Replace the DACL; /grant:r alone would leave other explicit grants in place.
	const script = `$ErrorActionPreference='Stop'
$acl = New-Object System.Security.AccessControl.${directory ? "DirectorySecurity" : "FileSecurity"}
$acl.SetAccessRuleProtection($true,$false)
$owner = New-Object System.Security.Principal.SecurityIdentifier('${sid}')
$acl.SetOwner($owner)
foreach ($identity in @('${sid}','S-1-5-18')) {
 $principal = New-Object System.Security.Principal.SecurityIdentifier($identity)
 $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($principal,'FullControl','${directory ? "ContainerInherit,ObjectInherit" : "None"}','None','Allow')
 $acl.AddAccessRule($rule)
}
Set-Acl -LiteralPath '${target.replace(/'/g, "''")}' -AclObject $acl`;
	execFileSync(path.join(system, "WindowsPowerShell", "v1.0", "powershell.exe"),
		["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")],
		{ windowsHide: true, stdio: "pipe" });
}
function writeProtected(file, value, storage, secure = restrict) {
	requireEncryption(storage);
	const directory = path.dirname(file);
	const temporary = `${file}.${process.pid}.tmp`;
	try {
		fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
		secure(directory, true);
		const encrypted = storage.encryptString(JSON.stringify(value));
		fs.writeFileSync(temporary, JSON.stringify({ version: 2, encrypted: encrypted.toString("base64") }),
			{ mode: 0o600, flag: "wx" });
		secure(temporary, false);
		fs.renameSync(temporary, file);
		secure(file, false);
	} catch {
		throw new SetupError("Could not protect local credentials. Check OS encryption and application-data permissions.");
	} finally { try { fs.unlinkSync(temporary); } catch {} }
}
function readProtected(file, storage) {
	requireEncryption(storage);
	if (!fs.existsSync(file)) return null;
	try {
		const value = JSON.parse(fs.readFileSync(file, "utf8"));
		if (value.version !== 2 || typeof value.encrypted !== "string") throw new Error();
		return JSON.parse(storage.decryptString(Buffer.from(value.encrypted, "base64")));
	} catch {
		throw new SetupError("Protected local credentials could not be read by this OS account. Do not replace the existing databases; restore the original profile or contact an administrator.");
	}
}
module.exports = { requireEncryption, restrict, writeProtected, readProtected };
