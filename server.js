process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createServer } = require('https')
const fs = require('fs');
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '192.168.0.150'
const port = process.env.NODE_ENV == "production" ? process.env.PORT : 3000
const app = next({ dev, hostname, port })

const httpsOptions = {
	key: fs.readFileSync('./certificates/localhost-key.pem'),
	cert: fs.readFileSync('./certificates/localhost.pem'),
};
const handle = app.getRequestHandler()

app.prepare().then(() => {
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