const { createServer } = require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOST || 'localhost'
const port = process.env.NODE_ENV == "production" ? process.env.PRODUCTION_PORT || 2377 : process.env.DEVELOPMENT_PORT || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const httpsOptions = {
	key: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost-key.pem')),
	cert: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost.pem')),
}

const killPort = (port) => {
	return new Promise((resolve) => {
		exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
			if (err || !stdout) return resolve();
			const lines = stdout.split('\n');
			lines.forEach(line => {
				const parts = line.trim().split(/\s+/);
				if (parts.length >= 5) {
					const pid = parts[4];
					if (pid && pid !== '0') {
						exec(`taskkill /PID ${pid} /F`, (killErr) => {
							if (!killErr) {
								console.log(`Killed process ${pid} using port ${port}`);
							}
						});
					}
				}
			});
			setTimeout(resolve, 2000); // Wait for processes to terminate
		});
	});
};

app.prepare().then(async () => {
	await killPort(port);
	createServer(httpsOptions, async (req, res) => {
		try {
			const parsedUrl = parse(req.url, true)
			const { pathname, query } = parsedUrl
			if (pathname === '/a') {
				await app.render(req, res, '/a', query)
			} else if (pathname === '/b') {
				await app.render(req, res, '/b', query)
			} else {
				await handle(req, res, parsedUrl)
			}
		} catch (err) {
			console.error('Error occurred handling', req.url, err)
			res.statusCode = 500
			res.end('internal server error')
		}
	})
		.once('error', (err) => {
			console.log(err)
			process.exit(1)
		})
		.listen(port, () => {
			console.log(`> Ready on https://${hostname}:${port}`)
		})
})