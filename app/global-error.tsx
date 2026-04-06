'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="zh">
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F4F3EE',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
          }}>
            <h1 style={{ fontSize: '1.5rem', color: '#1A1918', marginBottom: '1rem' }}>
              出错了
            </h1>
            <p style={{ color: '#6B6966', marginBottom: '1.5rem' }}>
              {error.message || '发生了一个错误'}
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#C15F3C',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
