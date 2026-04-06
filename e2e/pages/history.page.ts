/**
 * 历史页 Page Object Model
 */

import { Page, Locator, expect } from '@playwright/test'

export class HistoryPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly pageSubtitle: Locator
  readonly filterBar: Locator
  readonly filterAll: Locator
  readonly filterSuccess: Locator
  readonly filterFailed: Locator
  readonly filterCancelled: Locator
  readonly recordCount: Locator
  readonly historyList: Locator
  readonly historyItems: Locator
  readonly emptyState: Locator
  readonly statusBadges: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.locator('h1')
    this.pageSubtitle = page.locator('p:has-text("查看所有")')
    this.filterBar = page.locator('div').filter({ hasText: '全部' }).first()
    this.filterAll = page.getByRole('button', { name: '全部' })
    this.filterSuccess = page.getByRole('button', { name: '已同步' })
    this.filterFailed = page.getByRole('button', { name: '失败' })
    this.filterCancelled = page.getByRole('button', { name: '已忽略' })
    this.recordCount = page.locator('text=/共.*条记录/')
    this.historyList = page.locator('div[class*="space-y-6"]')
    this.historyItems = page.locator('div[class*="rounded-xl"] > div')
    this.emptyState = page.locator('text=暂无历史记录')
    this.statusBadges = page.locator('span[class*="rounded"]')
  }

  async goto() {
    await this.page.goto('/dashboard/history')
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(500)
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard\/history/)
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 })
  }

  async assertFilterBarVisible() {
    await expect(this.filterAll.first()).toBeVisible({ timeout: 10000 })
    await expect(this.filterSuccess.first()).toBeVisible({ timeout: 10000 })
    await expect(this.filterFailed.first()).toBeVisible({ timeout: 10000 })
    await expect(this.filterCancelled.first()).toBeVisible({ timeout: 10000 })
  }

  async clickFilterAll() {
    await this.filterAll.first().click()
  }

  async clickFilterSuccess() {
    await this.filterSuccess.first().click()
  }

  async clickFilterFailed() {
    await this.filterFailed.first().click()
  }

  async clickFilterCancelled() {
    await this.filterCancelled.first().click()
  }

  async getRecordCount(): Promise<number> {
    const text = await this.recordCount.textContent()
    const match = text?.match(/共\s*(\d+)\s*条记录/)
    return match ? parseInt(match[1], 10) : 0
  }

  async getHistoryItemCount(): Promise<number> {
    return await this.historyItems.count()
  }

  async assertEmptyStateVisible() {
    await expect(this.emptyState).toBeVisible()
  }

  async assertHistoryListVisible() {
    await expect(this.historyList).toBeVisible()
  }

  async getStatusBadges(): Promise<string[]> {
    const badges = await this.statusBadges.allTextContents()
    return badges
  }

  async assertDateGroupsVisible() {
    const dates = await this.page.locator('h3[class*="text-[#6B6966]"]').allTextContents()
    return dates
  }
}
