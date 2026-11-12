interface Props {
  className?: string
  width?: string | number
  height?: string | number
  circle?: boolean
}

export default function Skeleton({ className = '', width, height, circle }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton ${circle ? 'rounded-full' : ''} ${className}`}
      style={{
        width: width ?? undefined,
        height: height ?? undefined,
      }}
    />
  )
}
