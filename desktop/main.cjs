"use strict";

const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");
const path = require("node:path");

const BACKEND_PORT = 2300;
const LOOPBACK = "127.0.0.1";
const STARTUP_TIMEOUT_MS = 90_000;
const services = new Map();

let mainWindow;
let logStream;
let shuttingDown = false;
let servicesReady = false;
let applicationOrigin;
const applicationPorts = new Set();
let desktopConfig;

app.setName("Prime Laboratory System");

function runtimeRoot() {
	return app.isPackaged
		? path.join(process.resourcesPath, "runtime")
		: path.join(__dirname, "..", ".desktop-runtime");
}

function writeLog(message) {
	const line = `${new Date().toISOString()} ${message}\n`;
	if (logStream) {
		logStream.write(line);
	}
	if (!app.isPackaged) {
		process.stdout.write(line);
	}
}

function loadBackendEnvironment() {
	const configDirectory = path.join(app.getPath("userData"), "config");
	const userConfigPath = path.join(configDirectory, "backend.env");
	const packagedConfigPath = path.join(runtimeRoot(), "config", "backend.env");

	fs.mkdirSync(configDirectory, { recursive: true });
	if (!fs.existsSync(userConfigPath)) {
		fs.copyFileSync(packagedConfigPath, userConfigPath);
	}

	const content = fs.readFileSync(userConfigPath, "utf8");
	if (content.includes("CHANGE_ME")) {
		throw new Error(
			`Desktop database configuration is incomplete. Configure ${userConfigPath} and restart PLS.`,
		);
	}

	const { parse } = require(path.join(runtimeRoot(), "backend", "vendor", "dotenv"));
	return {
		...parse(content),
		NODE_ENV: "production",
		HOST: LOOPBACK,
		PRODUCTION_PORT: String(BACKEND_PORT),
		PORT: String(BACKEND_PORT),
	};
}

function loadDesktopConfig() {
	const configDirectory = path.join(app.getPath("userData"), "config");
	const userConfigPath = path.join(configDirectory, "desktop.env");
	const packagedConfigPath = path.join(runtimeRoot(), "config", "desktop.env");

	fs.mkdirSync(configDirectory, { recursive: true });
	if (!fs.existsSync(userConfigPath)) {
		fs.copyFileSync(packagedConfigPath, userConfigPath);
	}

	const { parse } = require(path.join(runtimeRoot(), "backend", "vendor", "dotenv"));
	const config = parse(fs.readFileSync(userConfigPath, "utf8"));
	const mode = config.PLS_DESKTOP_MODE || "standalone";
	if (mode !== "standalone" && mode !== "facility") {
		throw new Error(
			`Invalid PLS_DESKTOP_MODE in ${userConfigPath}. Use standalone or facility.`,
		);
	}

	if (mode === "facility") {
		if (!config.PLS_FACILITY_URL) {
			throw new Error(
				`PLS_FACILITY_URL is required for facility mode. Configure ${userConfigPath} and restart PLS.`,
			);
		}
		const facilityUrl = new URL(config.PLS_FACILITY_URL);
		const allowHttp = config.PLS_FACILITY_ALLOW_HTTP === "true";
		const validProtocol =
			facilityUrl.protocol === "https:" ||
			(allowHttp && facilityUrl.protocol === "http:");
		if (!validProtocol || facilityUrl.username || facilityUrl.password) {
			throw new Error(
				"PLS_FACILITY_URL must use HTTPS, or HTTP when PLS_FACILITY_ALLOW_HTTP=true, without credentials.",
			);
		}
	}

	return { ...config, PLS_DESKTOP_MODE: mode };
}

function canListen(port) {
	return new Promise((resolve) => {
		const server = net.createServer();
		server.once("error", () => resolve(false));
		server.listen(port, LOOPBACK, () => {
			server.close(() => resolve(true));
		});
	});
}

async function findFrontendPort() {
	for (let port = 2377; port < 2477; port += 1) {
		if (await canListen(port)) {
			return port;
		}
	}
	throw new Error("PLS could not find an available local port for its interface.");
}

function waitForHttp(url, serviceName, child) {
	const startedAt = Date.now();

	return new Promise((resolve, reject) => {
		const check = () => {
			if (child.exitCode !== null) {
				reject(
					new Error(`${serviceName} stopped before it became ready (exit code ${child.exitCode}).`),
				);
				return;
			}
			if (Date.now() - startedAt > STARTUP_TIMEOUT_MS) {
				reject(new Error(`${serviceName} did not become ready within 90 seconds.`));
				return;
			}

			const request = http.get(url, { timeout: 2_000 }, (response) => {
				response.resume();
				if (
					response.statusCode &&
					response.statusCode >= 200 &&
					response.statusCode < 500
				) {
					resolve();
					return;
				}
				setTimeout(check, 500);
			});
			request.on("timeout", () => request.destroy());
			request.on("error", () => setTimeout(check, 500));
		};
		check();
	});
}

function startNodeService(name, entryPoint, cwd, env) {
	const child = spawn(
		process.execPath,
		["--require", path.join(__dirname, "vendor-resolver.cjs"), entryPoint],
		{
		cwd,
		env: {
			...process.env,
			...env,
			ELECTRON_RUN_AS_NODE: "1",
		},
		stdio: ["ignore", "pipe", "pipe"],
		windowsHide: true,
		},
	);

	services.set(name, child);
	child.stdout.on("data", (data) => writeLog(`[${name}] ${data.toString().trimEnd()}`));
	child.stderr.on("data", (data) => writeLog(`[${name}:error] ${data.toString().trimEnd()}`));
	child.on("error", (error) => writeLog(`[${name}:spawn] ${error.stack || error.message}`));
	child.on("exit", (code, signal) => {
		writeLog(`[${name}] exited (code=${code}, signal=${signal || "none"})`);
		if (!shuttingDown && servicesReady) {
			showFailure(
				`${name} stopped unexpectedly. Restart Prime Laboratory System. See ${path.join(
					app.getPath("logs"),
					"desktop.log",
				)} for details.`,
			);
		}
	});
	return child;
}

async function startServices() {
	if (desktopConfig.PLS_DESKTOP_MODE === "facility") {
		writeLog(`Facility mode: loading ${desktopConfig.PLS_FACILITY_URL}`);
		await waitForHttpUrl(desktopConfig.PLS_FACILITY_URL, "PLS facility server");
		return desktopConfig.PLS_FACILITY_URL;
	}

	const root = runtimeRoot();
	const backendDirectory = path.join(root, "backend");
	const frontendDirectory = path.join(root, "frontend");
	const backendEntry = path.join(backendDirectory, "dist", "src", "start.js");
	const frontendEntry = path.join(frontendDirectory, "server.js");

	if (!fs.existsSync(backendEntry) || !fs.existsSync(frontendEntry)) {
		throw new Error("The packaged PLS runtime is incomplete. Reinstall the application.");
	}
	if (!(await canListen(BACKEND_PORT))) {
		throw new Error(
			`PLS backend port ${BACKEND_PORT} is already in use. Close the conflicting application and restart PLS.`,
		);
	}

	const backend = startNodeService(
		"backend",
		backendEntry,
		backendDirectory,
		{
			...loadBackendEnvironment(),
			NODE_PATH: path.join(backendDirectory, "vendor"),
			PLS_VENDOR_PATH: path.join(backendDirectory, "vendor"),
		},
	);
	writeLog(`Backend starting at http://${LOOPBACK}:${BACKEND_PORT}`);
	await waitForHttp(
		`http://${LOOPBACK}:${BACKEND_PORT}/api/v1/health`,
		"PLS backend",
		backend,
	);

	const frontendPort = await findFrontendPort();
	const frontend = startNodeService("frontend", frontendEntry, frontendDirectory, {
		NODE_ENV: "production",
		HOSTNAME: LOOPBACK,
		PORT: String(frontendPort),
		NODE_PATH: path.join(frontendDirectory, "vendor"),
		PLS_VENDOR_PATH: path.join(frontendDirectory, "vendor"),
	});
	writeLog(`Frontend starting at http://${LOOPBACK}:${frontendPort}`);
	await waitForHttp(`http://${LOOPBACK}:${frontendPort}/`, "PLS interface", frontend);
	servicesReady = true;
	return `http://${LOOPBACK}:${frontendPort}`;
}

function waitForHttpUrl(url, serviceName) {
	const startedAt = Date.now();
	const requestModule = new URL(url).protocol === "https:" ? https : http;

	return new Promise((resolve, reject) => {
		const check = () => {
			if (Date.now() - startedAt > STARTUP_TIMEOUT_MS) {
				reject(new Error(`${serviceName} did not become ready within 90 seconds.`));
				return;
			}

			const request = requestModule.get(url, { timeout: 5_000 }, (response) => {
				response.resume();
				if (
					response.statusCode &&
					response.statusCode >= 200 &&
					response.statusCode < 500
				) {
					resolve();
					return;
				}
				setTimeout(check, 1_000);
			});
			request.on("timeout", () => request.destroy());
			request.on("error", () => setTimeout(check, 1_000));
		};
		check();
	});
}

function loadingPage(message = "Starting PLS services...") {
	return `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html>
<html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>Prime Laboratory System</title>
<style>body{margin:0;background:#0b3558;color:#fff;font:16px system-ui;display:grid;place-items:center;height:100vh}.card{text-align:center}.spinner{width:40px;height:40px;margin:24px auto;border:4px solid #ffffff55;border-top-color:#fff;border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}</style></head>
<body><div class="card"><h1>Prime Laboratory System</h1><div class="spinner"></div><p>${message}</p></div></body></html>`)}`;
}

function errorPage(message) {
	const safeMessage = String(message)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
	return `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html>
<html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>PLS startup error</title>
<style>body{margin:0;background:#f4f6f8;color:#18212b;font:16px system-ui;display:grid;place-items:center;height:100vh}.card{max-width:680px;padding:40px;background:#fff;border-radius:12px;box-shadow:0 8px 28px #0002}h1{color:#a61b1b}</style></head>
<body><main class="card"><h1>PLS could not start</h1><p>${safeMessage}</p><p>Restart the application or contact your PLS administrator.</p></main></body></html>`)}`;
}

function isApplicationUrl(url) {
	if (!applicationOrigin) {
		return false;
	}

	try {
		const target = new URL(url);
		const application = new URL(applicationOrigin);
		const loopbackHosts = new Set(["127.0.0.1", "localhost", "::1"]);
		return (
			target.origin === application.origin ||
			(target.protocol === "http:" &&
			application.protocol === "http:" &&
			applicationPorts.has(target.port) &&
			(target.hostname === application.hostname ||
				(loopbackHosts.has(target.hostname) &&
					loopbackHosts.has(application.hostname)))
			)
		);
	} catch {
		return false;
	}
}

function configureWebContents(contents) {
	contents.setWindowOpenHandler(({ url }) => {
		if (isApplicationUrl(url)) {
			return {
				action: "allow",
				overrideBrowserWindowOptions: {
					title: "Prime Laboratory System",
					width: 1280,
					height: 820,
					minWidth: 900,
					minHeight: 650,
					backgroundColor: "#0b3558",
					webPreferences: {
						contextIsolation: true,
						nodeIntegration: false,
						sandbox: true,
						preload: path.join(__dirname, "preload.cjs"),
					},
				},
			};
		}
		if (url.startsWith("https://") || url.startsWith("http://")) {
			void shell.openExternal(url);
		}
		return { action: "deny" };
	});
	contents.on("will-navigate", (event, url) => {
		if (applicationOrigin && !isApplicationUrl(url)) {
			event.preventDefault();
			if (url.startsWith("https://") || url.startsWith("http://")) {
				void shell.openExternal(url);
			}
		}
	});
}

function createWindow() {
	mainWindow = new BrowserWindow({
		title: "Prime Laboratory System",
		width: 1440,
		height: 900,
		minWidth: 1024,
		minHeight: 700,
		show: false,
		backgroundColor: "#0b3558",
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			preload: path.join(__dirname, "preload.cjs"),
		},
	});
	mainWindow.setMenuBarVisibility(false);
	mainWindow.once("ready-to-show", () => mainWindow.show());
	void mainWindow.loadURL(loadingPage());
}

function showFailure(error) {
	const message = error instanceof Error ? error.message : String(error);
	writeLog(`[desktop:error] ${error instanceof Error ? error.stack || message : message}`);
	if (mainWindow && !mainWindow.isDestroyed()) {
		void mainWindow.loadURL(errorPage(message));
	}
}

async function stopServices() {
	shuttingDown = true;
	const running = [...services.values()].filter((child) => child.exitCode === null);
	for (const child of running.reverse()) {
		child.kill();
	}
	await Promise.all(
		running.map(
			(child) =>
				new Promise((resolve) => {
					const timeout = setTimeout(() => {
						if (child.exitCode === null) {
							child.kill("SIGKILL");
						}
						resolve();
					}, 5_000);
					child.once("exit", () => {
						clearTimeout(timeout);
						resolve();
					});
				}),
		),
	);
	if (logStream) {
		logStream.end();
	}
}

if (!app.requestSingleInstanceLock()) {
	app.quit();
} else {
	app.on("web-contents-created", (_event, contents) => {
		configureWebContents(contents);
	});

	app.on("second-instance", () => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			}
			mainWindow.focus();
		}
	});

	app.whenReady().then(async () => {
		fs.mkdirSync(app.getPath("logs"), { recursive: true });
		logStream = fs.createWriteStream(path.join(app.getPath("logs"), "desktop.log"), {
			flags: "a",
		});
		writeLog(`Prime Laboratory System ${app.getVersion()} starting`);
		createWindow();
		try {
			desktopConfig = loadDesktopConfig();
			writeLog(`Desktop mode: ${desktopConfig.PLS_DESKTOP_MODE}`);
			if (desktopConfig.PLS_DESKTOP_MODE === "facility") {
				await mainWindow.loadURL(loadingPage("Connecting to the PLS facility server..."));
			}
			const applicationUrl = await startServices();
			const parsedApplicationUrl = new URL(applicationUrl);
			applicationOrigin = parsedApplicationUrl.origin;
			applicationPorts.add(parsedApplicationUrl.port);
			await mainWindow.loadURL(applicationUrl);
		} catch (error) {
			showFailure(error);
			await stopServices();
		}
	});

	app.on("before-quit", (event) => {
		if (!shuttingDown && services.size > 0) {
			event.preventDefault();
			void stopServices().finally(() => app.quit());
		}
	});
	app.on("window-all-closed", () => app.quit());
}
