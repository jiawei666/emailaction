# EmailAction 设计规范

> 版本：1.0
> 风格：温暖极简主义（参考 Claude.ai）

---

## 设计原则

### 核心理念
- **温暖**：使用大地色系，避免冷冰冰的科技感
- **极简**：大量留白，只保留必要元素
- **清晰**：信息层级明确，一眼看到重点

### 禁止事项 ❌
- 紫色/蓝色渐变
- 发光效果 (glow)
- 科技感网格背景
- 复杂的动画效果
- 过多的颜色
- 过重的阴影

### 推荐事项 ✅
- 大量留白（padding >= 24px）
- 柔和的阴影 (shadow-sm)
- 圆角卡片 (rounded-lg)
- 简洁的排版
- 清晰的层级

---

## 色彩系统

### 主色
| 名称 | 色值 | 用途 |
|------|------|------|
| Primary | `#C15F3C` | 主按钮、链接、强调 |
| Primary Hover | `#A64D2E` | 按钮悬停状态 |

### 中性色
| 名称 | 色值 | 用途 |
|------|------|------|
| Text Primary | `#1A1918` | 标题、正文 |
| Text Secondary | `#6B6966` | 描述、辅助文字 |
| Text Muted | `#9E9C98` | 占位符、禁用文字 |
| Border | `#E8E6E1` | 边框、分割线 |
| Cloudy | `#B1ADA1` | 图标、禁用状态 |
| Pampas | `#F4F3EE` | 页面背景 |
| White | `#FFFFFF` | 卡片背景 |

### 功能色
| 名称 | 色值 | 用途 |
|------|------|------|
| Success | `#4A7C59` | 成功状态 |
| Warning | `#D4A574` | 警���状态 |
| Error | `#B85450` | 错误状态 |

---

## 排版

### 字体
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### 字号
| 名称 | 大小 | 用途 |
|------|------|------|
| text-xs | 12px | 标签、时间 |
| text-sm | 14px | 描述、辅助文字 |
| text-base | 16px | 正文 |
| text-lg | 18px | 小标题 |
| text-xl | 20px | 卡片标题 |
| text-2xl | 24px | 页面标题 |
| text-3xl | 30px | 大标题 |
| text-4xl | 36px | 首页主标题 |

### 行高
- 标题：`leading-tight` (1.25)
- 正文：`leading-relaxed` (1.625)

---

## 间距

### 基础单位
- 单位：4px
- 常用：4, 8, 12, 16, 20, 24, 32, 40, 48, 64

### 页面边距
- 移动端：`p-4` (16px)
- 桌面端：`p-6` (24px)

### 卡片内边距
- 默认：`p-6` (24px)
- 紧凑：`p-4` (16px)

---

## 圆角

| 名称 | 大小 | 用途 |
|------|------|------|
| rounded | 4px | 小元素 |
| rounded-md | 6px | 按钮、输入框 |
| rounded-lg | 8px | 卡片 |
| rounded-xl | 12px | 大卡片 |

---

## 阴影

```css
/* 卡片阴影 */
.shadow-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 悬浮阴影 */
.shadow-hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

---

## 组件规范

### 按钮

```jsx
// 主按钮
<button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-md font-medium transition-colors">
  开始使用
</button>

// 次要按钮
<button className="bg-white border border-border hover:border-cloudy text-text-primary px-6 py-3 rounded-md font-medium transition-colors">
  取消
</button>

// 文字按钮
<button className="text-primary hover:text-primary-hover font-medium transition-colors">
  了解更多
</button>
```

### 卡片

```jsx
<div className="bg-white border border-border rounded-lg p-6 shadow-card">
  <h3 className="text-lg font-semibold text-text-primary mb-2">卡片标题</h3>
  <p className="text-text-secondary">卡片描述文字</p>
</div>
```

### 输入框

```jsx
<input
  type="text"
  className="w-full bg-white border border-border rounded-md px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
  placeholder="请输入..."
/>
```

### 标签

```jsx
// 状态标签
<span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-pampas text-primary">
  待处理
</span>

// 普通标签
<span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-pampas text-text-secondary">
  #来自邮件
</span>
```

---

## 页面布局

### 首页
- 全屏 hero 区域
- 居中布局，最大宽度 1200px
- 大标题 + 副标题 + CTA 按钮

### Dashboard
- 左侧导航栏（固定宽度 240px）
- 右侧内容区（flex-1）
- 内容区最大宽度 960px，居中

### 卡片列表
- 垂直排列，间距 16px
- 每个卡片固定内边距 24px

---

## 动画

### 过渡
```css
/* 默认过渡 */
transition-colors /* 颜色变化 */
transition-all    /* 所有属性 */
duration-200      /* 200ms */
```

### 悬浮效果
```css
/* 卡片悬浮 */
.card:hover {
  border-color: var(--color-cloudy);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

---

## 图标

使用 Lucide React 图标库，统一大小：

| 场景 | 大小 |
|------|------|
| 导航图标 | 20px |
| 按钮图标 | 18px |
| 状态图标 | 16px |
| 大图标 | 24px |

```jsx
import { Mail, Check, X, Clock } from 'lucide-react'

<Mail className="w-5 h-5" />
```

---

## 示例页面

### 首页 Hero

```jsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-pampas">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          邮件待办，自动同步
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          AI 识别邮件中的待办事项，一键同步到飞书 / Notion / Todoist
        </p>
        <button className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-md font-medium transition-colors">
          开始使用
        </button>
      </div>
    </main>
  )
}
```

---

## 参考资源

- [Claude.ai](https://claude.ai) - 设计风格参考
- [shadcn/ui](https://ui.shadcn.com) - 组件库
- [Lucide Icons](https://lucide.dev) - 图标库
