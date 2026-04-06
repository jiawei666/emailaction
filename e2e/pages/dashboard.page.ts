/**
 * Dashboard Page Object Model - 修复版
 */

import { Page, Locator, expect } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly pendingCard: Locator
  readonly syncedCard: Locator
  readonly totalCard: Locator
  readonly processPendingBtn: Locator
  readonly syncNewEmailBtn: Locator

  constructor(page: Page) {
    this.page = page
    // 使用实际的文本和类选择器
    this.pendingCard = page.locator('text=待处理邮件').locator('..')
    this.syncedCard = page.locator('text=已同步').locator('..')
    this.totalCard = page.locator('text=累计任务').locator('..')
    this.processPendingBtn = page.locator('text=处理待办邮件')
    this.syncNewEmailBtn = page.locator('text=同步新邮件')
  }

  async goto() {
    await this.page.goto('/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async getPendingCount(): Promise<number> {
    const text = await this.pendingCard.locator('text-3xl').textContent()
    return parseInt(text || '0', 10)
  }

  async clickProcessPending() {
    await this.processPendingBtn.click()
    await this.page.waitForURL('**/dashboard/pending**')
  }

  async clickSyncNewEmail() {
    await this.syncNewEmailBtn.click()
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard/)
    await expect(this.processPendingBtn).toBeVisible()
  }

  async assertStatsVisible() {
    await expect(this.pendingCard).toBeVisible()
    await expect(this.syncedCard).toBeVisible()
    await expect(this.totalCard).toBeVisible()
  }
}
