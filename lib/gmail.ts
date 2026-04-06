import { google } from 'googleapis'
import { prisma } from './db'

interface GmailMessagePart {
  body?: { data: string }
  mimeType: string
  parts?: GmailMessagePart[]
}

interface GmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: { name: string; value: string }[]
    body?: { data: string }
    parts?: GmailMessagePart[]
  }
  internalDate: string
}

interface ParsedEmail {
  id: string
  threadId: string
  subject: string
  from: string
  to: string
  date: Date
  body: string
  snippet: string
}

/**
 * 获取用户的 Gmail 客户端
 */
export async function getGmailClient(userId: string, accountId: string) {
  const account = await prisma.gmailAccount.findUnique({
    where: { id: accountId },
  })

  if (!account || account.userId !== userId) {
    throw new Error('Gmail account not found')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gmail/oauth/callback`
  )

  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken || undefined,
  })

  // 检查 token 是否过期，如果过期则刷新
  if (account.tokenExpiry && account.tokenExpiry < new Date()) {
    if (!account.refreshToken) {
      throw new Error('Token expired and no refresh token available. Please re-connect your account.')
    }

    try {
      const { credentials } = await oauth2Client.refreshAccessToken()

      if (!credentials.access_token) {
        throw new Error('No access token in refresh response')
      }

      // 更新数据库中的 token
      await prisma.gmailAccount.update({
        where: { id: accountId },
        data: {
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token || account.refreshToken,
          tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        },
      })

      console.log('Gmail token refreshed successfully for account:', accountId)
    } catch (error) {
      console.error('Failed to refresh Gmail token:', error)
      throw new Error('Failed to refresh token. Please re-connect your Gmail account.')
    }
  }

  return google.gmail({ version: 'v1', auth: oauth2Client })
}

/**
 * 解析邮件内容
 */
function parseEmail(message: GmailMessage): ParsedEmail {
  const headers = message.payload.headers
  const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''

  // 解析邮件正文
  let body = ''
  const decodeBase64 = (data: string) => {
    return Buffer.from(data, 'base64').toString('utf-8')
  }

  if (message.payload.body?.data) {
    body = decodeBase64(message.payload.body.data)
  } else if (message.payload.parts) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/html' || part.mimeType === 'text/plain') {
        if (part.body?.data) {
          body = decodeBase64(part.body.data)
          break
        }
      }
      if (part.parts) {
        for (const subPart of part.parts) {
          if (subPart.mimeType === 'text/html' || subPart.mimeType === 'text/plain') {
            if (subPart.body?.data) {
              body = decodeBase64(subPart.body.data)
              break
            }
          }
        }
      }
    }
  }

  return {
    id: message.id,
    threadId: message.threadId,
    subject: getHeader('Subject'),
    from: getHeader('From'),
    to: getHeader('To'),
    date: new Date(Number(message.internalDate)),
    body,
    snippet: message.snippet,
  }
}

/**
 * 获取邮件列表
 */
export async function getEmails(
  userId: string,
  accountId: string,
  options: {
    maxResults?: number
    query?: string
    pageToken?: string
  } = {}
) {
  const gmail = await getGmailClient(userId, accountId)

  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults: options.maxResults || 20,
    q: options.query,
    pageToken: options.pageToken,
  })

  const messages = response.data.messages || []
  const emails: ParsedEmail[] = []

  for (const message of messages) {
    if (message.id) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      })
      emails.push(parseEmail(detail.data as GmailMessage))
    }
  }

  return {
    emails,
    nextPageToken: response.data.nextPageToken,
    resultSizeEstimate: response.data.resultSizeEstimate,
  }
}

/**
 * 获取单封邮件详情
 */
export async function getEmail(userId: string, accountId: string, messageId: string) {
  const gmail = await getGmailClient(userId, accountId)

  const response = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  })

  return parseEmail(response.data as GmailMessage)
}

/**
 * 搜索邮件
 */
export async function searchEmails(
  userId: string,
  accountId: string,
  query: string,
  options: { maxResults?: number; pageToken?: string } = {}
) {
  return getEmails(userId, accountId, { ...options, query })
}

/**
 * 监听新邮件
 */
export async function watchInbox(userId: string, accountId: string) {
  const gmail = await getGmailClient(userId, accountId)

  const response = await gmail.users.watch({
    userId: 'me',
    requestBody: {
      topicName: process.env.GMAIL_PUBSUB_TOPIC || '',
      labelIds: ['INBOX'],
    },
  })

  return response.data
}

/**
 * 同步历史记录
 */
export async function getHistory(userId: string, accountId: string, startHistoryId?: string) {
  const gmail = await getGmailClient(userId, accountId)

  const response = await gmail.users.history.list({
    userId: 'me',
    startHistoryId,
  })

  return response.data
}

/**
 * 修改邮件标签（标记为已读/未读/归档等）
 */
export async function modifyLabels(
  userId: string,
  accountId: string,
  messageId: string,
  options: {
    addLabels?: string[]
    removeLabels?: string[]
  } = {}
) {
  const gmail = await getGmailClient(userId, accountId)

  const response = await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      addLabelIds: options.addLabels,
      removeLabelIds: options.removeLabels,
    },
  })

  return response.data
}
