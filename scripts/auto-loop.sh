#!/bin/bash

# AI 自主开发循环启动脚本
# 使用方法: ./auto-loop.sh [选项]

set -e

cd "$(dirname "$0")/.."

# 默认配置
MAX_LOOPS=10
TEST_FILTER=""
DRY_RUN=false

# 解析参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --max-loops)
      MAX_LOOPS="$2"
      shift 2
      ;;
    --filter)
      TEST_FILTER="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "未知选项: $1"
      echo "使用方法: $0 [--max-loops N] [--filter PATTERN] [--dry-run]"
      exit 1
      ;;
  esac
done

echo "🚀 AI 自主开发循环"
echo "=================="
echo "最大循环次数: $MAX_LOOPS"
echo "测试过滤: ${TEST_FILTER:-无}"
echo "预演模式: $DRY_RUN"
echo ""

# 检查环境
echo "📋 检查环境..."
if ! command -v npm &> /dev/null; then
  echo "❌ 未找到 npm"
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "❌ 未找到 package.json"
  exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 创建报告目录
mkdir -p e2e/reports

# 生成唯一 ID
RUN_ID=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="e2e/reports/auto-loop-${RUN_ID}.md"

echo "📝 报告将保存到: $REPORT_FILE"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo "🔍 预演模式：���运行测试，不修复代码"
  echo ""

  # 只运行一次测试
  if [ -n "$TEST_FILTER" ]; then
    npx playwright test "$TEST_FILTER"
  else
    npm run test:e2e
  fi

  echo ""
  echo "✅ 预演完成"
  exit 0
fi

# 提示用户
echo "⚠️  即将启动 AI 自主开发循环"
echo "   - AI 将自动运行测试、修复代码、重新测试"
echo "   - 这个过程可能需要几个小时"
echo "   - 建议在晚上或周末运行"
echo ""
read -p "是否继续? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "已取消"
  exit 0
fi

# 初始化报告
cat > "$REPORT_FILE" << EOF
# AI 自主开发循环报告

**运行 ID**: $RUN_ID
**开始时间**: $(date '+%Y-%m-%d %H:%M:%S')
**配置**:
- 最大循环次数: $MAX_LOOPS
- 测试过滤: ${TEST_FILTER:-无}

---

## 执行日志

EOF

echo ""
echo "🎯 启动 Claude Code 自主循环..."
echo ""
echo "请在 Claude Code 中执行："
echo ""
echo "  /auto-loop --max-loops=$MAX_LOOPS ${TEST_FILTER:+--filter=$TEST_FILTER}"
echo ""
echo "或直接告诉我："
echo ""
echo "  '启动自主开发循环，最大循环 $MAX_LOOPS 次'"
echo ""

# 记录到文件
echo "启动命令: /auto-loop --max-loops=$MAX_LOOPS ${TEST_FILTER:+--filter=$TEST_FILTER}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
