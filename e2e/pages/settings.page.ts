/**
 * 设置页 Page Object Model
 */

import { Page, Locator, expect } from '@playwright/test'

export class SettingsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly pageSubtitle: Locator
  readonly gmailSection: Locator
  readonly taskPlatformSection: Locator
  readonly syncSettingsSection: Locator
  readonly securitySection: Locator
  readonly dangerSection: Locator
  readonly autoSyncToggle: Locator
  readonly emailNotificationToggle: Locator
  readonly syncFrequencySelect: Locator
  readonly changePasswordBtn: Locator
  readonly loginHistoryBtn: Locator
  readonly deleteAccountBtn: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.locator('h1:has-text("设置")')
    this.pageSubtitle = page.locator('p:has-text("管理您的账户和偏好设置")')
    this.gmailSection = page.locator('section').filter({ has: page.locator('h2:has-text("Gmail 账户")') })
    this.taskPlatformSection = page.locator('section').filter({ has: page.locator('h2:has-text("任务平台")') })
    this.syncSettingsSection = page.locator('section').filter({ has: page.locator('h2:has-text("同步设置")') })
    this.securitySection = page.locator('section').filter({ has: page.locator('h2:has-text("安全")') })
    this.dangerSection = page.locator('section').filter({ hasText: '危险区域' })
    this.autoSyncToggle = page.locator('div:has-text("自动同步新邮件")').locator('..').locator('button')
    this.emailNotificationToggle = page.locator('div:has-text("邮件通知")').locator('..').locator('button')
    this.syncFrequencySelect = page.locator('select')
    this.changePasswordBtn = page.locator('button:has-text("修改密码")')
    this.loginHistoryBtn = page.locator('button:has-text("登录历史")')
    this.deleteAccountBtn = page.locator('button:has-text("删除账户")')
  }

  async goto() {
    await this.page.goto('/dashboard/settings')
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(500)
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard\/settings/)
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 })
  }

  async assertAllSectionsVisible() {
    await expect(this.gmailSection.first()).toBeVisible({ timeout: 10000 })
    await expect(this.syncSettingsSection).toBeVisible({ timeout: 10000 })
    await expect(this.securitySection).toBeVisible({ timeout: 10000 })
    await expect(this.dangerSection).toBeVisible({ timeout: 10000 })
  }

  async toggleAutoSync() {
    await this.autoSyncToggle.first().click()
  }

  async toggleEmailNotification() {
    await this.emailNotificationToggle.first().click()
  }

  async isAutoSyncEnabled(): Promise<boolean> {
    const button = this.autoSyncToggle.first()
    const bgClass = await button.getAttribute('class')
    return bgClass?.includes('bg-[#C15F3C]') || false
  }

  async isEmailNotificationEnabled(): Promise<boolean> {
    const button = this.emailNotificationToggle.first()
    const bgClass = await button.getAttribute('class')
    return bgClass?.includes('bg-[#C15F3C]') || false
  }

  async selectSyncFrequency(value: string) {
    await this.syncFrequencySelect.selectOption(value)
  }

  async getSyncFrequency(): Promise<string> {
    return await this.syncFrequencySelect.inputValue()
  }

  async clickChangePassword() {
    await this.changePasswordBtn.click()
  }

  async clickLoginHistory() {
    await this.loginHistoryBtn.click()
  }

  async clickDeleteAccount() {
    await this.deleteAccountBtn.click()
  }

  async assertDangerSectionVisible() {
    await expect(this.dangerSection).toBeVisible({ timeout: 10000 })
    await expect(this.deleteAccountBtn).toBeVisible({ timeout: 10000 })
  }

  async getGmailAccountEmail(): Promise<string> {
    const emailElement = await this.page.locator('p[class*="font-medium"]').first()
    return await emailElement.textContent() || ''
  }
}
