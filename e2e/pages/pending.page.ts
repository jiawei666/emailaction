/**
 * Pending Page Object Model - 修复版
 */

import { Page, Locator, expect } from '@playwright/test'

export class PendingPage {
  readonly page: Page
  readonly taskItems: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.taskItems = page.locator('[class*="rounded-xl"][class*="border"]')
    this.emptyState = page.locator('text=没有待处理项')
  }

  async goto() {
    await this.page.goto('/dashboard/pending')
    await this.page.waitForLoadState('networkidle')
  }

  async getTaskCount(): Promise<number> {
    return await this.taskItems.count()
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard\/pending/)
  }

  async assertEmptyState() {
    await expect(this.emptyState).toBeVisible()
  }
}
