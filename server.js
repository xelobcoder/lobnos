const http = require('http')
const { createServer } = http
const next = require('next')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const dotenv = require('dotenv')

dotenv.config()

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOST || 'localhost'
const port = process.env.NODE_ENV == "production" ? process.env.PRODUCTION_PORT || 2377 : process.env.DEVELOPMENT_PORT || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()



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
			setTimeout(resolve, 2000);
		});
	});
};

app.prepare().then(async () => {
	await killPort(port);
	createServer(async (req, res) => {
		try {
			const baseUrl = req.headers.host ? `http://${req.headers.host}` : `http://${hostname}:${port}`
			const url = new URL(req.url, baseUrl)
			console.log(process.env.PRODUCTION_BASEURL, process.env.DEVELOPMENT_BASEURL);
			const pathname = url.pathname
			const query = {}
			for (let [key, value] of url.searchParams) {
				if (query[key]) {
					if (Array.isArray(query[key])) {
						query[key].push(value)
					} else {
						query[key] = [query[key], value]
					}
				} else {
					query[key] = value
				}
			}
			const parsedUrl = {
				pathname,
				query,
				href: url.href,
				path: url.pathname + url.search
			}
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
			console.log(`> Ready on http://${hostname}:${port}`)
		})
})