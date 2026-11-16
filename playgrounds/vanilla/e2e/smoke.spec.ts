import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const SAMPLE = '/samples/receipt.jpg'

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

test('loads an image, crops and straightens it in the worker, and applies it', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })

  // The worker starts with the first edit that needs it. If it cannot load, the viewer edits on the main thread
  // without a word, which is the failure this test is here to catch
  const workerStarted = page.waitForEvent('worker')
  await page.goto('/')
  const edit = control(page, 'edit')
  await expect(edit).toBeEnabled()
  await edit.click()

  // A crop alone is read from the canvas, so the perspective is what sends the pixels to the worker
  await control(page, 'crop').click()
  await dragTopLeftCorner(page)
  await control(page, 'confirm').click()
  await control(page, 'perspective').click()
  await dragTopLeftCorner(page)
  await control(page, 'confirm').click()
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
  expect(applied.width).toBeLessThan(source.width)
  expect(applied.height).toBeLessThan(source.height)

  // The viewer shows the applied image, ready for another edit
  await expect(edit).toBeEnabled()
  expect(errors).toEqual([])
})
