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
  guests?: number // Số khách để kiểm tra capacity
  isAvailableInTimeSlot?: boolean // Bàn có available trong khung giờ đã chọn không
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
  onResizeStart,
  guests,
  isAvailableInTimeSlot = true
}: Props) {
  const statusKey = table.status as keyof typeof STATUS_STYLE
  const capacity = table.capacity || 2
  
  // Xác định màu sắc dựa trên trạng thái và yêu cầu khách hàng
  let style: { fill: string; text: string } = STATUS_STYLE[statusKey] || STATUS_STYLE.AVAILABLE
  let seatColor: string = SEAT_COLOR[statusKey] || SEAT_COLOR.AVAILABLE

  // Biến viền mặc định cho bàn
  let tableStroke = selected ? '#3b82f6' : 'none'
  let tableStrokeWidth = selected ? 4 : 0
  let tableFilter = selected ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none'

  // Bàn AVAILABLE, OCCUPIED, hoặc RESERVED -> có thể tương tác
  if (statusKey === 'AVAILABLE' || statusKey === 'OCCUPIED' || statusKey === 'RESERVED') {
    // Trạng thái Unavailable do khung giờ / khách
    let isUnavailable = false;
    let isFull = false;
    if (statusKey === 'AVAILABLE') {
      if (!isAvailableInTimeSlot) isUnavailable = true;
      else if (guests !== undefined && capacity < guests) isFull = true;
    }

    if (isUnavailable) {
      style = { fill: '#d9534f', text: '#fff' } // Đỏ
      seatColor = '#a83a31'
    } else if (isFull) {
      style = { fill: '#f59e0b', text: '#fff' } // Vàng
      seatColor = '#d97706'
    } else {
      // Khả dụng (hoặc OCCUPIED/RESERVED nhưng cho phép đặt chồng)
      if (selected) {
        style = { fill: '#4caf50', text: '#fff' } // Xanh lá
        seatColor = '#2e7d32'
        tableStroke = '#4caf50' 
        tableStrokeWidth = 4
        tableFilter = 'drop-shadow(0 0 8px rgba(76, 175, 80, 0.6))'
      } else {
        style = { fill: '#ffffff', text: '#374151' } // Trắng
        seatColor = '#9ca3af' // Xám
        tableStroke = '#e5e7eb' // Viền trắng/xám
        tableStrokeWidth = 2
        tableFilter = 'none'
      }
    }
  }
  // Bàn UNAVAILABLE hoặc các trường hợp khác -> giữ màu mặc định (xám hoặc đỏ)

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
        return <circle key={i} cx={sx} cy={sy} r={5} fill={seatColor} />
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
            fill={seatColor}
          />
        )
      })

      bottomCenters.forEach((centerX, i) => {
        const d = `M ${centerX - 20},${height} L ${centerX + 20},${height} L ${centerX + 16},${height + 4} Q ${centerX + 16},${height + 6} ${centerX + 14},${height + 6} L ${centerX - 14},${height + 6} Q ${centerX - 16},${height + 6} ${centerX - 16},${height + 4} L ${centerX - 20},${height} Z`
        seats.push(
          <path
            key={`b${i}`}
            d={d}
            fill={seatColor}
          />
        )
      })

      const leftPoints = `-6,${leftCenterY - 14} -6,${leftCenterY + 14} 0,${leftCenterY + 20} 0,${leftCenterY - 20}`
      seats.push(
        <polygon
          key="l0"
          points={leftPoints}
          fill={seatColor}
        />
      )

      const rightPoints = `${width},${rightCenterY - 20} ${width},${rightCenterY + 20} ${width + 6},${rightCenterY + 14} ${width + 6},${rightCenterY - 14}`
      seats.push(
        <polygon
          key="r0"
          points={rightPoints}
          fill={seatColor}
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
          fill={seatColor}
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
          fill={seatColor}
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

  // Xác định bàn có thể chọn được không
  // Cho phép chọn bàn OCCUPIED và RESERVED
  // Chỉ disable bàn UNAVAILABLE hoặc bàn AVAILABLE nhưng không phù hợp yêu cầu
  const isSelectable = statusKey === 'AVAILABLE' 
    ? (isAvailableInTimeSlot && (guests === undefined || capacity >= guests))
    : (statusKey === 'OCCUPIED' || statusKey === 'RESERVED') // Cho phép chọn OCCUPIED và RESERVED
  const isDisabled = statusKey === 'UNAVAILABLE' || (statusKey === 'AVAILABLE' && !isSelectable)

  const minDim = Math.min(width, height)
  const scaleFactor = Math.max(1, minDim / 60)

  const nameFontSize = Math.max(14, Math.round(14 * scaleFactor))
  const capacityFontSize = Math.max(12, Math.round(12 * scaleFactor))

  const centerY = isCircle ? r : height / 2
  const nameY = centerY - (nameFontSize * 0.5)
  const capacityY = centerY + (capacityFontSize * 1.0)

  return (
    <g
      transform={`translate(${table.x}, ${table.y})`}
      onPointerDown={isDisabled ? undefined : onPointerDown}
      style={{ 
        cursor: isDisabled ? 'not-allowed' : (editable ? 'move' : 'pointer'),
        opacity: isDisabled ? 0.6 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto'
      }}
    >
      {/* ===== GHẾ ===== */}
      {renderSeats()}

      {/* ===== BÀN ===== */}
      {isCircle ? (
        <>
          {/* Shadow/Glow effect khi selected */}
          {selected && (
            <circle
              cx={r}
              cy={r}
              r={r + 4}
              fill="none"
              stroke={tableStroke}
              strokeWidth={4}
              opacity={0.5}
            />
          )}
        <circle
          cx={r}
          cy={r}
          r={r}
          fill={style.fill}
            stroke={tableStroke}
            strokeWidth={tableStrokeWidth}
            style={{
              filter: tableFilter
            }}
          />
        </>
      ) : (
        <>
          {/* Shadow/Glow effect khi selected */}
          {selected && (
            <rect
              x={-4}
              y={-4}
              width={width + 8}
              height={height + 8}
              rx={18}
              fill="none"
              stroke={tableStroke}
              strokeWidth={4}
              opacity={0.5}
            />
          )}
        <rect
          width={width}
          height={height}
          rx={14}
          fill={style.fill}
            stroke={tableStroke}
            strokeWidth={tableStrokeWidth}
            style={{
              filter: tableFilter
            }}
          />
        </>
      )}

      {/* ===== TÊN ===== */}
      <text
        x={isCircle ? r : width / 2}
        y={nameY}
        textAnchor="middle"
        fontSize={nameFontSize}
        fontWeight={600}
        fill={style.text}
      >
        {table.name}
      </text>
      
      {/* ===== SỐ LƯỢNG KHÁCH ===== */}
      <text
        x={isCircle ? r : width / 2}
        y={capacityY}
        textAnchor="middle"
        fontSize={capacityFontSize}
        fontWeight={500}
        fill={style.text}
      >
        {capacity} khách
      </text>

      {/* ===== RESIZE ===== */}
      {handle(-4, -4, 'nw')}
      {handle(width - 4, -4, 'ne')}
      {handle(-4, height - 4, 'sw')}
      {handle(width - 4, height - 4, 'se')}
    </g>
  )
}
