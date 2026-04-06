/**
 * 账户管理页 Page Object Model
 */

import { Page, Locator, expect } from '@playwright/test'

export class AccountsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly pageSubtitle: Locator
  readonly gmailSection: Locator
  readonly taskPlatformSection: Locator
  readonly addGmailBtn: Locator
  readonly platformConnectButtons: Locator
  readonly emptyGmailState: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.locator('h1:has-text("账户管理")')
    this.pageSubtitle = page.locator('p:has-text("管理您的 Gmail 和任务平台账户")')
    this.gmailSection = page.locator('section').filter({ hasText: 'Gmail 账户' })
    this.taskPlatformSection = page.locator('section').filter({ hasText: '任务平台' })
    this.addGmailBtn = page.locator('button:has-text("添加账户")')
    this.platformConnectButtons = page.locator('button:has-text("点击连接")')
    this.emptyGmailState = page.locator('text=还没有连接 Gmail 账户')
  }

  async goto() {
    await this.page.goto('/dashboard/accounts')
    await this.page.waitForLoadState('networkidle')
    // 等待页面内容加载
    await this.page.waitForTimeout(500)
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard\/accounts/)
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 })
  }

  async assertGmailSectionVisible() {
    await expect(this.gmailSection).toBeVisible({ timeout: 10000 })
  }

  async assertTaskPlatformSectionVisible() {
    await expect(this.taskPlatformSection).toBeVisible({ timeout: 10000 })
  }

  async getConnectedGmailAccounts(): Promise<string[]> {
    const emails = await this.page.locator('p.font-medium').allTextContents()
    return emails.filter(text => text.includes('@'))
  }

  async clickAddGmail() {
    await this.addGmailBtn.click()
  }

  async getPlatformNames(): Promise<string[]> {
    const platforms = await this.gmailSection.locator('span.font-medium').allTextContents()
    return platforms.filter(name => ['飞书', 'Notion', 'Todoist'].some(n => platforms.includes(n)))
  }

  async getPlatformStatus(platformName: string): Promise<string | null> {
    const platformCard = this.taskPlatformSection.locator('button', { hasText: platformName })
    const isVisible = await platformCard.isVisible()
    return isVisible ? '未连接' : null
  }

  async clickConnectPlatform(platformName: string) {
    const platformBtn = this.taskPlatformSection.locator('button', { hasText: platformName })
    await platformBtn.click()
  }

  async assertEmptyGmailState() {
    await expect(this.emptyGmailState).toBeVisible()
  }

  async getConnectButtonCount(): Promise<number> {
    return await this.platformConnectButtons.count()
  }
}
