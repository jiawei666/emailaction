'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
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
        maxWidth: '28rem',
      }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          backgroundColor: '#B85450/10',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B85450"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1918', marginBottom: '0.5rem' }}>
          出错了
        </h2>
        <p style={{ color: '#6B6966', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error.message || '发生了一个错误，请重试'}
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
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#A64D2E'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#C15F3C'}
        >
          重试
        </button>
      </div>
    </div>
  )
}
