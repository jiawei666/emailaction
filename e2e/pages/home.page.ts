/**
 * 首页 Page Object Model
 */

import { Page, Locator, expect } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly header: Locator
  readonly logo: Locator
  readonly productName: Locator
  readonly loginLink: Locator
  readonly startFreeBtn: Locator
  readonly heroTitle: Locator
  readonly heroSubtitle: Locator
  readonly startUsingBtn: Locator
  readonly learnMoreLink: Locator
  readonly howItWorksSection: Locator
  readonly platformsSection: Locator
  readonly ctaSection: Locator
  readonly footer: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.locator('header')
    this.logo = page.locator('header').getByText('EmailAction')
    this.productName = page.locator('text=EmailAction')
    this.loginLink = page.locator('header a', { hasText: '登录' })
    this.startFreeBtn = page.locator('header a', { hasText: '免费开始' })
    this.heroTitle = page.locator('h1')
    this.heroSubtitle = page.locator('p:has-text("AI 识别待办内容")')
    this.startUsingBtn = page.locator('a:has-text("开始使用")').first()
    this.learnMoreLink = page.locator('a:has-text("了解工作原理")')
    this.howItWorksSection = page.locator('section:has-text("三个步骤")')
    this.platformsSection = page.locator('section:has-text("支持的任务平台")')
    this.ctaSection = page.locator('section:has-text("准备好了吗")')
    this.footer = page.locator('footer')
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\//)
    await expect(this.logo).toBeVisible()
    await expect(this.heroTitle).toBeVisible()
  }

  async assertHeaderVisible() {
    await expect(this.header).toBeVisible()
    await expect(this.logo).toBeVisible()
    await expect(this.loginLink).toBeVisible()
    await expect(this.startFreeBtn).toBeVisible()
  }

  async clickLogin() {
    await this.loginLink.click()
  }

  async clickStartFree() {
    await this.startFreeBtn.click()
  }

  async clickStartUsing() {
    await this.startUsingBtn.click()
  }

  async clickLearnMore() {
    await this.learnMoreLink.click()
  }

  async getHeroTitle(): Promise<string> {
    return await this.heroTitle.textContent() || ''
  }

  async assertHowItWorksSectionVisible() {
    await expect(this.howItWorksSection).toBeVisible()
  }

  async assertPlatformsVisible() {
    await expect(this.platformsSection).toBeVisible()
    await expect(this.page.locator('text=飞书')).toBeVisible()
    await expect(this.page.locator('text=Notion')).toBeVisible()
    await expect(this.page.locator('text=Todoist')).toBeVisible()
  }

  async assertCtaSectionVisible() {
    await expect(this.ctaSection).toBeVisible()
  }

  async assertFooterVisible() {
    await expect(this.footer).toBeVisible()
  }

  async scrollToHowItWorks() {
    await this.howItWorksSection.scrollIntoViewIfNeeded()
  }

  async scrollToCta() {
    await this.ctaSection.scrollIntoViewIfNeeded()
  }
}
