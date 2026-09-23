import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const projectsDir = path.join(distDir, 'projects')
const outputDir = path.join(rootDir, 'public', 'files', 'case-studies')

const HOST = '127.0.0.1'
const PORT = 4179
const BASE_URL = `http://${HOST}:${PORT}`

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()

  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.pdf': 'application/pdf',
  }

  return types[ext] ?? 'application/octet-stream'
}

async function resolveRequestPath(urlPath) {
  let decoded = decodeURIComponent(urlPath.split('?')[0])
  if (!decoded.startsWith('/')) decoded = `/${decoded}`

  let candidate = path.join(distDir, decoded)

  try {
    const stat = await fs.stat(candidate)

    if (stat.isDirectory()) {
      candidate = path.join(candidate, 'index.html')
    }
  } catch {
    if (!path.extname(candidate)) {
      candidate = path.join(candidate, 'index.html')
    }
  }

  const normalized = path.normalize(candidate)

  if (!normalized.startsWith(path.normalize(distDir))) {
    throw new Error('Invalid request path')
  }

  return normalized
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        const filePath = await resolveRequestPath(req.url ?? '/')
        const data = await fs.readFile(filePath)

        res.writeHead(200, {
          'Content-Type': contentType(filePath),
          'Cache-Control': 'no-store',
        })
        res.end(data)
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('Not found')
      }
    })

    server.once('error', reject)

    server.listen(PORT, HOST, () => {
      resolve(server)
    })
  })
}

async function discoverPrintRoutes() {
  const entries = await fs.readdir(projectsDir, { withFileTypes: true })
  const routes = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const slug = entry.name
    const printIndex = path.join(projectsDir, slug, 'print', 'index.html')

    try {
      await fs.access(printIndex)
      routes.push({
        slug,
        route: `/projects/${slug}/print/`,
      })
    } catch {
      // Project has no generated print route; skip it.
    }
  }

  return routes.sort((a, b) => a.slug.localeCompare(b.slug))
}

function safeFilename(value) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

async function waitForLocalImages(page) {
  try {
    await page.waitForFunction(
      () => Array.from(document.images).every((img) => img.complete),
      { timeout: 15000 }
    )
  } catch {
    console.warn('  Warning: some images did not finish loading before the timeout.')
  }
}

async function main() {
  await fs.access(distDir)
  await fs.mkdir(outputDir, { recursive: true })

  const routes = await discoverPrintRoutes()

  if (routes.length === 0) {
    throw new Error(
      'No project print routes were found in dist. Run "npm.cmd run build" first.'
    )
  }

  console.log(`Found ${routes.length} project print route(s).`)

  const server = await startStaticServer()
  const browser = await chromium.launch()

  let generated = 0
  let failed = 0

  try {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(60000)

    for (const { slug, route } of routes) {
      const url = `${BASE_URL}${route}`

      console.log(`Rendering ${slug}...`)

      try {
        // Do not wait for "networkidle": embedded third-party content such as
        // Tableau can keep network activity alive indefinitely.
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        })

        await page.locator('.document-header h1').waitFor({
          state: 'visible',
          timeout: 15000,
        })

        await waitForLocalImages(page)

        // Brief settling period for fonts/layout after local assets finish.
        await page.waitForTimeout(500)

        await page.emulateMedia({ media: 'print' })

        const title = (
          await page.locator('.document-header h1').innerText()
        ).trim()

        const filename =
          `J-Dylan-Beckham-${safeFilename(title)}-Case-Study.pdf`

        const outputPath = path.join(outputDir, filename)

        await page.pdf({
          path: outputPath,
          printBackground: true,
          preferCSSPageSize: true,
          tagged: true,
          outline: true,
        })

        generated += 1
        console.log(`  -> ${path.relative(rootDir, outputPath)}`)
      } catch (error) {
        failed += 1
        console.error(`  FAILED: ${slug}`)
        console.error(`  ${error.message}`)
      }
    }
  } finally {
    await browser.close()
    await new Promise((resolve) => server.close(resolve))
  }

  console.log('')
  console.log(`Generated: ${generated}`)
  console.log(`Failed: ${failed}`)

  if (failed > 0) {
    process.exitCode = 1
  } else {
    console.log('Case-study PDF generation complete.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
