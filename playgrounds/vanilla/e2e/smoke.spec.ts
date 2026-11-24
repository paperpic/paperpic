import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const SAMPLE = '/samples/receipt.jpg'
/** A receipt whose bottom right corner is outside the photo, and its real corners, as fractions of the photo. */
const CUT_SAMPLE = '/samples/receipt-cut-corner.jpg'
const CUT_SAMPLE_CORNERS = {
  cornerTopLeft: { x: 0.51, y: 0.02 },
  cornerTopRight: { x: 0.86, y: 0.13 },
  cornerBottomRight: { x: 0.59, y: 1 },
  cornerBottomLeft: { x: 0.1, y: 0.81 },
}

/** The control of the viewer whose `data-paperpic-control` is `name`, which is public and does not depend on the language. */
const control = (page: Page, name: string) => page.locator(`[data-paperpic-control="${name}"]`)

/** Decodes an image the page can fetch, and returns its size. */
function imageSize(page: Page, url: string) {
  return page.evaluate(async (url) => {
    const bitmap = await createImageBitmap(await (await fetch(url)).blob())
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return size
  }, url)
}

/** Drags the top left corner of the open tool towards the middle of the viewer, by a sixth of its size. */
async function dragTopLeftCorner(page: Page) {
  const box = (await control(page, 'cornerTopLeft').boundingBox())!
  const viewer = (await page.locator('.paperpic').boundingBox())!
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x + viewer.width / 6, start.y + viewer.height / 6, { steps: 8 })
  await page.mouse.up()
}

/** Where a corner is, in image pixels, as the viewer tells screen readers once an arrow key moves it by 1 screen pixel. */
async function cornerPosition(page: Page, name: string) {
  await control(page, name).press('ArrowUp')
  const announcement = await page.locator('.paperpic-announcement').textContent()
  const [x, y] = announcement!.match(/\d+/g)!.map(Number)
  return { x: x!, y: y! }
}

test('loads an image, finds the document and straightens it in the worker, crops it and applies it', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })

  // The worker starts as Straighten looks for the document. If it cannot load, the viewer works on the main thread
  // without a word, which is the failure this test is here to catch
  const workerStarted = page.waitForEvent('worker')
  await page.goto('/')
  const edit = control(page, 'edit')
  await expect(edit).toBeEnabled()
  await edit.click()

  // Done waits until a corner moves, or until the viewer finds the document, which places the corners itself
  await control(page, 'perspective').click()
  const confirm = control(page, 'confirm')
  await expect(confirm).toHaveAttribute('aria-disabled', 'false', { timeout: 15_000 })
  await confirm.click()

  await control(page, 'crop').click()
  await dragTopLeftCorner(page)
  await confirm.click()
  await control(page, 'apply').click()

  const worker = await workerStarted
  // A worker whose script fails to load never answers, so it gets a few seconds
  const answered = await Promise.race([
    worker.evaluate(() => true),
    new Promise<false>(resolve => setTimeout(resolve, 5000, false)),
  ]).catch(() => false)
  expect(answered, 'the worker did not start, so the viewer edited on the main thread').toBe(true)

  const result = page.locator('.result')
  await expect(result).toContainText('Applied', { timeout: 30_000 })
  const href = await result.locator('a').getAttribute('href')
  expect(href).toMatch(/^blob:/)

  const source = await imageSize(page, SAMPLE)
  const applied = await imageSize(page, href!)
  expect(applied.width).toBeGreaterThan(0)
  expect(applied.height).toBeGreaterThan(0)
  expect(applied.width * applied.height).toBeLessThan(source.width * source.height)
  // The photo lies, and the receipt in it stands, so the corners were on the receipt
  expect(source.width).toBeGreaterThan(source.height)
  expect(applied.height).toBeGreaterThan(applied.width)

  // The viewer shows the applied image, ready for another edit
  await expect(edit).toBeEnabled()
  expect(errors).toEqual([])
})

test('finds the corners of a document that the photo cuts off', async ({ page }) => {
  await page.goto('/')
  await page.locator('[name="sample"]').selectOption(CUT_SAMPLE)
  const edit = control(page, 'edit')
  await expect(edit).toBeEnabled()
  await edit.click()
  await control(page, 'perspective').click()
  await expect(control(page, 'confirm')).toHaveAttribute('aria-disabled', 'false', { timeout: 15_000 })

  const { width, height } = await imageSize(page, CUT_SAMPLE)
  for (const [name, real] of Object.entries(CUT_SAMPLE_CORNERS)) {
    const found = await cornerPosition(page, name)
    expect(Math.abs(found.x / width - real.x), `${name}, across`).toBeLessThan(0.03)
    expect(Math.abs(found.y / height - real.y), `${name}, down`).toBeLessThan(0.03)
  }
})
