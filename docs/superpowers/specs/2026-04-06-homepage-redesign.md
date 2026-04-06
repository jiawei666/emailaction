# EmailAction 首页重设计

## 设计目标

将首页从传统 SaaS 营销页改造为 Editorial Storytelling（叙事杂志风）风格，保持品牌色调的同时提升设计感和独特性。

## 设计风格参考

- **风格**: Editorial / Magazine Style
- **参考**: sanyoya.com
- **特点**: 全屏分段式布局、大量留白、强烈字体层次、叙事性

## 品牌色彩（保持不变）

| 名称 | 色值 | 用途 |
|------|------|------|
| 主色 | `#C15F3C` | CTA 按钮、强调文字 |
| 背景 | `#F4F3EE` | 页面背景 |
| 文字 | `#1A1918` | 主标题 |
| 次要文字 | `#6B6966` | 描述文字 |
| 辅助文字 | `#9E9C98` | 小标签 |
| 边框 | `#E8E6E1` | 分隔线、边框 |

## 页面结构

```
┌─────────────────────────────────────┐
│  HEADER - 固定导航                  │
├─────────────────────────────────────┤
│  HERO SECTION - 100vh 全屏          │
├─────────────────────────────────────┤
│  SECTION 2 - INTELLIGENCE           │
├─────────────────────────────────────┤
│  SECTION 3 - SYNC                   │
├─────────────────────────────────────┤
│  FOOTER                             │
└─────────────────────────────────────┘
```

## Section 详情

### Header

- Logo: 左侧，图标 + 文字
- 导航: 右侧
  - 未登录: 登录 | 开始使用
  - 已登录: 控制台 | 进入控制台
- 样式: 固定顶部，半透明背景 + blur

### Section 1: Hero（100vh 全屏居中）

```
EMAIL × TASK × AI

邮件里的待办
自动进入任务列表

AI 从邮件中识别待办事项，
一键同步到 Notion 或飞书

[开始使用]        了解更多 →

○ scroll
```

- 小标签: `text-xs tracking-[0.3em] text-[#9E9C98] uppercase`
- 主标题: `text-6xl lg:text-7xl font-medium leading-[1.05]`
- "scroll": 底部居中，带小圆圈装饰

### Section 2: Intelligence（100vh 左对齐）

```
INTELLIGENCE

不遗漏任何
重要事项

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

邮件内容 · 截止日期 · 优先级

AI 自动分析邮件，提取待办事项、截止日期
和优先级，你只需要确认即可
```

- 分隔线: `border-t border-[#E8E6E1]`
- 关键词用品牌色高亮

### Section 3: Sync（100vh）

```
SYNC

一键同步
到你的工具

┌──────────┐  ┌──────────┐
│    N     │  │    飞    │
│  Notion  │  │   飞书   │
└──────────┘  └──────────┘

支持更多平台 Coming soon...
```

- 平台卡片: 简洁图标 + 名称
- 卡片样式: `bg-white border border-[#E8E6E1] rounded-xl`

### Footer

```
EmailAction              © 2026
把邮件变成行动
```

## 视觉规范

| 元素 | 样式 |
|------|------|
| Section | `min-h-screen flex items-center px-8 lg:px-16` |
| 容器 | `max-w-6xl mx-auto w-full` |
| 小标签 | `text-xs tracking-[0.3em] text-[#9E9C98] uppercase mb-6` |
| 大标题 | `text-5xl lg:text-7xl font-medium text-[#1A1918] leading-[1.05] mb-6` |
| 正文 | `text-lg text-[#6B6966] leading-relaxed max-w-lg` |
| 主按钮 | `bg-[#C15F3C] hover:bg-[#A64D2E] text-white px-8 py-4 rounded-full font-medium transition-all` |
| 次链接 | `text-[#6B6966] hover:text-[#C15F3C] transition-colors` |

## 动画细节

1. **Scroll 指示器**: 小圆圈有微妙的上下浮动动画
2. **按钮 Hover**: 轻微阴影增强
3. **链接箭头**: hover 时向右移动

## 实现文件

- `app/page.tsx` - 主页面组件
- `app/globals.css` - 添加 scroll 指示器动画

## 技术要求

- Next.js 15 App Router
- Tailwind CSS
- 响应式设计（移动端适配）
- 保持现有认证逻辑
