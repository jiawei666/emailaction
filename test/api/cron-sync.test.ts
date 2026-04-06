import { beforeEach, describe, expect, it, vi } from "vitest"

const prismaMock = {
  gmailAccount: {
    findMany: vi.fn(),
  },
  taskAccount: {
    findMany: vi.fn(),
  },
}

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}))

vi.mock("@/lib/gmail", () => ({
  searchEmails: vi.fn(),
}))

vi.mock("@/lib/glm", () => ({
  analyzeEmail: vi.fn(),
}))

vi.mock("@/lib/errors", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe("/api/cron/sync auth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.gmailAccount.findMany.mockResolvedValue([])
    prismaMock.taskAccount.findMany.mockResolvedValue([])
    process.env.CRON_SECRET = "test-cron-secret"
  })

  it("accepts Bearer token auth", async () => {
    const { GET } = await import("@/app/api/cron/sync/route")

    const request = new Request("https://example.com/api/cron/sync", {
      headers: {
        authorization: "Bearer test-cron-secret",
      },
    })

    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("rejects invalid auth", async () => {
    const { GET } = await import("@/app/api/cron/sync/route")

    const request = new Request("https://example.com/api/cron/sync", {
      headers: {
        authorization: "Bearer wrong-secret",
      },
    })

    const response = await GET(request as any)

    expect(response.status).toBe(401)
  })
})
