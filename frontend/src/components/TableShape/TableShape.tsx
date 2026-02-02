import type { JSX } from 'react'
import type { TableLayout } from '@/types/layout'

type Props = {
  table: TableLayout
  editable: boolean
  selected?: boolean
  onPointerDown: (e: React.PointerEvent) => void
  onResizeStart?: (
    e: React.PointerEvent,
    dir: 'nw' | 'ne' | 'sw' | 'se'
  ) => void
}

const STATUS_STYLE = {
  AVAILABLE: { fill: '#e5e5e5', text: '#555' },
  RESERVED: { fill: '#4f8dd6', text: '#fff' },
  OCCUPIED: { fill: '#d9534f', text: '#fff' },
  UNAVAILABLE: { fill: '#555', text: '#fff' }
} as const

const SEAT_COLOR: Record<keyof typeof STATUS_STYLE, string> = {
  AVAILABLE: '#999',
  RESERVED: '#2c5aa0',
  OCCUPIED: '#a83a31',
  UNAVAILABLE: '#333'
} as const

export default function TableShape({
  table,
  editable,
  selected,
  onPointerDown,
  onResizeStart
}: Props) {
  const style = STATUS_STYLE[table.status]
  const capacity = table.capacity || 2

  /* ===== FIX TỈ LỆ ===== */
  let width = table.width
  let height = table.height

  if (table.shape === 'SQUARE') {
    const s = Math.min(width, height)
    width = height = s
  }

  const isCircle = table.shape === 'CIRCLE'
  const r = Math.min(width, height) / 2

  /* ===== GHẾ ===== */
  const renderSeats = () => {
    if (isCircle) {
      return Array.from({ length: capacity }).map((_, i) => {
        const angle = (i / capacity) * Math.PI * 2
        const sx = r + Math.cos(angle) * (r + 14)
        const sy = r + Math.sin(angle) * (r + 14)
        return <circle key={i} cx={sx} cy={sy} r={5} fill={SEAT_COLOR[table.status]} />
      })
    }

    // RECT / SQUARE - Trapezoid shape pointing to table
    const top = Math.ceil(capacity / 2)
    const bottom = capacity - top
    const seats: JSX.Element[] = []

    if (table.shape === 'SQUARE' && capacity === 6) {
      const topCenters = [width * 0.3, width * 0.7]
      const bottomCenters = [width * 0.3, width * 0.7]
      const leftCenterY = height / 2
      const rightCenterY = height / 2

      topCenters.forEach((centerX, i) => {
        const d = `M ${centerX - 14},-6 L ${centerX + 14},-6 Q ${centerX + 16},-6 ${centerX + 16},-4 L ${centerX + 20},0 L ${centerX - 20},0 L ${centerX - 16},-4 Q ${centerX - 16},-6 ${centerX - 14},-6 Z`
        seats.push(
          <path
            key={`t${i}`}
            d={d}
            fill={SEAT_COLOR[table.status]}
          />
        )
      })

      bottomCenters.forEach((centerX, i) => {
        const d = `M ${centerX - 20},${height} L ${centerX + 20},${height} L ${centerX + 16},${height + 4} Q ${centerX + 16},${height + 6} ${centerX + 14},${height + 6} L ${centerX - 14},${height + 6} Q ${centerX - 16},${height + 6} ${centerX - 16},${height + 4} L ${centerX - 20},${height} Z`
        seats.push(
          <path
            key={`b${i}`}
            d={d}
            fill={SEAT_COLOR[table.status]}
          />
        )
      })

      const leftPoints = `-6,${leftCenterY - 14} -6,${leftCenterY + 14} 0,${leftCenterY + 20} 0,${leftCenterY - 20}`
      seats.push(
        <polygon
          key="l0"
          points={leftPoints}
          fill={SEAT_COLOR[table.status]}
        />
      )

      const rightPoints = `${width},${rightCenterY - 20} ${width},${rightCenterY + 20} ${width + 6},${rightCenterY + 14} ${width + 6},${rightCenterY - 14}`
      seats.push(
        <polygon
          key="r0"
          points={rightPoints}
          fill={SEAT_COLOR[table.status]}
        />
      )

      return seats
    }

    for (let i = 0; i < top; i++) {
      const spreadWidth = width + (top - 1) * 4
      const centerX = (spreadWidth / (top + 1)) * (i + 1) - (spreadWidth - width) / 2
      // Trapezoid: narrow at top, wide at bottom (pointing into table) with rounded top corners
      const d = `M ${centerX - 14},-6 L ${centerX + 14},-6 Q ${centerX + 16},-6 ${centerX + 16},-4 L ${centerX + 20},0 L ${centerX - 20},0 L ${centerX - 16},-4 Q ${centerX - 16},-6 ${centerX - 14},-6 Z`
      seats.push(
        <path
          key={`t${i}`}
          d={d}
          fill={SEAT_COLOR[table.status]}
        />
      )
    }

    for (let i = 0; i < bottom; i++) {
      const spreadWidth = width + (bottom - 1) * 4
      const centerX = (spreadWidth / (bottom + 1)) * (i + 1) - (spreadWidth - width) / 2
      // Trapezoid: narrow at bottom, wide at top (pointing into table) with rounded bottom corners
      const d = `M ${centerX - 20},${height} L ${centerX + 20},${height} L ${centerX + 16},${height + 4} Q ${centerX + 16},${height + 6} ${centerX + 14},${height + 6} L ${centerX - 14},${height + 6} Q ${centerX - 16},${height + 6} ${centerX - 16},${height + 4} L ${centerX - 20},${height} Z`
      seats.push(
        <path
          key={`b${i}`}
          d={d}
          fill={SEAT_COLOR[table.status]}
        />
      )
    }

    return seats
  }

  /* ===== RESIZE HANDLE ===== */
  const handle = (x: number, y: number, dir: any) =>
    editable && selected ? (
      <rect
        x={x}
        y={y}
        width={8}
        height={8}
        fill="#ff9800"
        cursor={`${dir}-resize`}
        onPointerDown={e => onResizeStart?.(e, dir)}
      />
    ) : null

  return (
    <g
      transform={`translate(${table.x}, ${table.y})`}
      onPointerDown={onPointerDown}
      style={{ cursor: editable ? 'move' : 'default' }}
    >
      {/* ===== GHẾ ===== */}
      {renderSeats()}

      {/* ===== BÀN ===== */}
      {isCircle ? (
        <circle
          cx={r}
          cy={r}
          r={r}
          fill={style.fill}
          stroke={selected ? '#ff9800' : 'none'}
          strokeWidth={selected ? 2 : 0}
        />
      ) : (
        <rect
          width={width}
          height={height}
          rx={14}
          fill={style.fill}
          stroke={selected ? '#ff9800' : 'none'}
          strokeWidth={selected ? 2 : 0}
        />
      )}

      {/* ===== TÊN ===== */}
      <text
        x={isCircle ? r : width / 2}
        y={isCircle ? r + 4 : height / 2 + 4}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={style.text}
      >
        {table.name}
      </text>

      {/* ===== RESIZE ===== */}
      {handle(-4, -4, 'nw')}
      {handle(width - 4, -4, 'ne')}
      {handle(-4, height - 4, 'sw')}
      {handle(width - 4, height - 4, 'se')}
    </g>
  )
}
