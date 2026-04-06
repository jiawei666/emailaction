import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['test/**/*.test.ts'],
    exclude: [
      'node_modules/',
      'dist/',
      '.next/',
      '**/*.config.{js,ts}',
      '**/types/**',
      '**/mock-data/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.config.{js,ts}',
        '**/types/**',
        '**/test/**',
        '**/mock-data/**',
      ],
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    isolate: false,
    fileParallelism: false, // 按顺序运行测试文件,避免并行初始化竞态
    pool: 'forks', // 使用 forks 模式
    poolOptions: {
      forks: {
        singleFork: true, // 单线程模式避免 SQLite 并发写入问题
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname),
    },
  },
})
