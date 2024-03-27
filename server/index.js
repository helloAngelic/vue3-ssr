import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

export async function createServer() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  // Constants
  const isProd = process.env.NODE_ENV === 'production'
  const port = process.env.PORT || 9528
  const base = process.env.BASE || '/'

  // Create http server
  const app = express()

  // Add Vite or respective production middlewares
  let vite
  if (!isProd) {
    vite = await createViteServer({
      base,
      server: { middlewareMode: true },
      appType: 'custom'
    })
    app.use(vite.middlewares)
  } else {
    const compression = (await import('compression')).default
    app.use(compression())
    const sirv = (await import('sirv')).default
    app.use(base, sirv('./dist/client', { extensions: [] }))
  }

  app.use('/printPDF', async (req, res, next) => {
    try {
      const url = req.originalUrl.replace(base, '/')

      let template, render, manifest
      if (!isProd) {
        template = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        // manifest = {}
        render = (await vite.ssrLoadModule('/src/entry-server.js')).render
      } else {
        template = fs.readFileSync(path.resolve(__dirname, '../dist/client/index.html'), 'utf-8')
        // manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../dist/client/.vite/ssr-manifest.json'), 'utf-8'))
        render = (await import('../dist/server/entry-server.js')).render
      }

      const [ssrHtml, preloadLinks] = await render(url)

      const html = template
        .replace(`<!--preload-links-->`, preloadLinks || '')
        .replace(`<!--ssr-outlet-->`, ssrHtml || '')
      res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
    } catch (error) {
      vite && vite.ssrFixStacktrace(error)
      next(error)
    }

  })

  return { app, port }
}

createServer().then(({ app, port }) => {
  app.listen(port, () => {
    console.log(`start server: http://localhost:${port}/printPDF`);
  })
})