/**
 * 登录页 Page Object Model
 */

import { Page, Locator, expect } from '@playwright/test'

export class SignInPage {
  readonly page: Page
  readonly logo: Locator
  readonly pageTitle: Locator
  readonly pageSubtitle: Locator
  readonly googleSignInBtn: Locator
  readonly githubSignInBtn: Locator
  readonly divider: Locator
  readonly securityText: Locator
  readonly backToHomeLink: Locator
  readonly errorMessage: Locator
  readonly loadingSpinner: Locator

  constructor(page: Page) {
    this.page = page
    this.logo = page.locator('div:has(> svg.lucide-mail)')
    this.pageTitle = page.locator('h1:has-text("欢迎使用")')
    this.pageSubtitle = page.locator('p:has-text("连接您的 Gmail")')
    this.googleSignInBtn = page.locator('button:has-text("使用 Google")')
    this.githubSignInBtn = page.locator('button:has-text("使用 GitHub")')
    this.divider = page.locator('span:has-text("或")')
    this.securityText = page.locator('span:has-text("安全加密")')
    this.backToHomeLink = page.locator('a:has-text("返回首页")')
    this.errorMessage = page.locator('div[class*="bg-[#FEE2E2]"]')
    this.loadingSpinner = page.locator('div[class*="animate-spin"]')
  }

  async goto() {
    await this.page.goto('/auth/signin')
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(500)
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/auth\/signin/)
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 })
  }

  async assertSignInButtonsVisible() {
    await expect(this.googleSignInBtn).toBeVisible({ timeout: 10000 })
    await expect(this.githubSignInBtn).toBeVisible({ timeout: 10000 })
  }

  async clickGoogleSignIn() {
    await this.googleSignInBtn.click()
  }

  async clickGitHubSignIn() {
    await this.githubSignInBtn.click()
  }

  async clickBackToHome() {
    await this.backToHomeLink.click()
  }

  async isGoogleButtonLoading(): Promise<boolean> {
    const spinner = await this.googleSignInBtn.locator('div[class*="animate-spin"]').count()
    return spinner > 0
  }

  async isGitHubButtonLoading(): Promise<boolean> {
    const spinner = await this.githubSignInBtn.locator('div[class*="animate-spin"]').count()
    return spinner > 0
  }

  async assertSecurityInfoVisible() {
    await expect(this.page.locator('text=您的数据安全存储')).toBeVisible({ timeout: 10000 })
    await expect(this.page.locator('text=仅使用 Gmail 只读权限')).toBeVisible({ timeout: 10000 })
  }

  async assertBackToHomeVisible() {
    await expect(this.backToHomeLink).toBeVisible({ timeout: 10000 })
  }

  async getPageTitle(): Promise<string> {
    return await this.pageTitle.textContent() || ''
  }
}
