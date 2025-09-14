import { chromium as playwrightChromium } from 'playwright-core'
import chromium from '@sparticuz/chromium'

export interface ServerlessPlaywrightOptions {
  headless?: boolean
  args?: string[]
}

export async function createServerlessBrowser(options: ServerlessPlaywrightOptions = {}) {
  const executablePath = await chromium.executablePath()

  const defaultArgs = [
    ...chromium.args,
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ]

  return await playwrightChromium.launch({
    executablePath,
    headless: true,
    args: [...defaultArgs, ...(options.args || [])],
    ...options,
  })
}

export async function createServerlessContext(options: ServerlessPlaywrightOptions = {}) {
  const browser = await createServerlessBrowser(options)
  return await browser.newContext()
}

export async function createServerlessPage(options: ServerlessPlaywrightOptions = {}) {
  const context = await createServerlessContext(options)
  return await context.newPage()
}
