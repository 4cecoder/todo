import { Page } from '@playwright/test'

export class PageHelper {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  async waitForElement(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { timeout })
  }

  async clickAndWait(selector: string, waitFor?: string) {
    await this.page.click(selector)
    if (waitFor) {
      await this.page.waitForSelector(waitFor)
    }
  }

  async fillAndWait(selector: string, value: string) {
    await this.page.fill(selector, value)
    await this.page.waitForTimeout(500) // Small delay for reactivity
  }

  async getTextContent(selector: string): Promise<string | null> {
    return await this.page.locator(selector).textContent()
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible()
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true })
  }

  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded()
  }

  async waitForURL(url: string | RegExp, timeout: number = 10000) {
    await this.page.waitForURL(url, { timeout })
  }

  async reloadAndWait() {
    await this.page.reload()
    await this.waitForPageLoad()
  }

  async clearInput(selector: string) {
    await this.page.locator(selector).clear()
  }

  async pressKey(key: string) {
    await this.page.keyboard.press(key)
  }

  async hover(selector: string) {
    await this.page.locator(selector).hover()
  }
}