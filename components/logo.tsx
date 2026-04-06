import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: 20,
  md: 28,
  lg: 40,
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const iconSize = sizes[size]
  const textSize = size === 'sm' ? 'text-[15px]' : size === 'lg' ? 'text-2xl' : 'text-lg'

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Sync Rings */}
        <circle
          cx="38"
          cy="50"
          r="22"
          stroke="currentColor"
          strokeWidth="3"
          className="text-[#C15F3C]"
        />
        <circle
          cx="62"
          cy="50"
          r="22"
          stroke="currentColor"
          strokeWidth="3"
          className="text-[#C15F3C]"
        />
        {/* Center dot */}
        <circle cx="50" cy="50" r="6" className="fill-[#C15F3C]" />
      </svg>
      {showText && (
        <span className={`font-medium tracking-[-0.01em] text-[#1A1918] ${textSize}`}>
          Email<span className="text-[#C15F3C]">Action</span>
        </span>
      )}
    </Link>
  )
}
