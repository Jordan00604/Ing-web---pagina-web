import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const { chromium } = await import(pathToFileURL(process.env.FW_PLAYWRIGHT_MODULE).href)
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', () => errors.push('Excepción JavaScript'))
  await page.goto('http://127.0.0.1:5173/')
  const real = await page.evaluate(async () => { const r = await fetch('http://localhost:8081/api/productos'); const data = await r.json(); return { status: r.status, count: data.length, id: data[0]?.id } })
  assert.equal(real.status, 200)
  console.log(`PASS navegador frontend:5173 → PostgreSQL backend:8081; HTTP 200; ${real.count} productos`)
  for (const path of ['/', '/catalogo', '/login', '/registro', '/carrito', ...(real.id ? [`/productos/${real.id}`] : [])]) {
    await page.goto('http://127.0.0.1:5173' + path)
    await page.waitForFunction(() => !document.querySelector('.spinner') && document.querySelector('main'))
    for (const width of [360, 390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
      if (overflow) console.log(await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0,10).map(e => ({ tag: e.tagName, class: e.className, right: e.getBoundingClientRect().right }))))
      assert.equal(overflow, false, `${path} @ ${width}`)
    }
    console.log(`PASS ruta pública ${path}, 360/390/768/1280/1440`)
  }
  assert.equal(errors.length, 0)
} finally { await browser.close() }
