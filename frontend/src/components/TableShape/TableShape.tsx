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
  isPaid?: boolean // Nếu đã thanh toán, không cho chọn bàn mới
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
  isAvailableInTimeSlot = true,
  isPaid = false
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
        // Ghế tròn có tựa
        const sx = r + Math.cos(angle) * (r + 14)
        const sy = r + Math.sin(angle) * (r + 14)
        const backX = r + Math.cos(angle) * (r + 18)
        const backY = r + Math.sin(angle) * (r + 18)

        return (
          <g key={i}>
            <circle cx={sx} cy={sy} r={6} fill={seatColor} />
            <path
              d={`M ${sx - 8 * Math.sin(angle)},${sy + 8 * Math.cos(angle)} Q ${backX},${backY} ${sx + 8 * Math.sin(angle)},${sy - 8 * Math.cos(angle)}`}
              fill="none"
              stroke={seatColor}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </g>
        )
      })
    }

    // RECT / SQUARE - Modern chairs with backs
    const topCap = Math.ceil(capacity / 2)
    const bottomCap = capacity - topCap
    const seats: JSX.Element[] = []

    const renderDetailedChair = (centerX: number, centerY: number, rotation: number, key: string) => {
      return (
        <g key={key} transform={`translate(${centerX}, ${centerY}) rotate(${rotation})`}>
          {/* Seat base */}
          <rect x={-12} y={-4} width={24} height={8} rx={3} fill={seatColor} />
          {/* Chair backrest */}
          <path
            d="M -14,-7 Q 0,-10 14,-7"
            fill="none"
            stroke={seatColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      )
    }

    for (let i = 0; i < topCap; i++) {
      const spreadWidth = width + (topCap - 1) * 4
      const centerX = (spreadWidth / (topCap + 1)) * (i + 1) - (spreadWidth - width) / 2
      seats.push(renderDetailedChair(centerX, -8, 0, `t${i}`))
    }

    for (let i = 0; i < bottomCap; i++) {
      const spreadWidth = width + (bottomCap - 1) * 4
      const centerX = (spreadWidth / (bottomCap + 1)) * (i + 1) - (spreadWidth - width) / 2
      seats.push(renderDetailedChair(centerX, height + 8, 180, `b${i}`))
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
  const isSelectable = isPaid
    ? selected
    : (statusKey === 'AVAILABLE'
      ? (isAvailableInTimeSlot && (guests === undefined || capacity >= guests))
      : (statusKey === 'OCCUPIED' || statusKey === 'RESERVED'))
  const isDisabled = !isSelectable
  
  const minDim = Math.min(width, height)
  const scaleFactor = Math.max(1, minDim / 60)

  const nameFontSize = Math.max(14, Math.round(14 * scaleFactor))
  const capacityFontSize = Math.max(12, Math.round(12 * scaleFactor))

  const centerY = isCircle ? r : height / 2
  const nameY = centerY - (nameFontSize * 0.5)
  const capacityY = centerY + (capacityFontSize * 1.0)

  return (
    <g
      transform={`translate(${table.x}, ${table.y}) rotate(${table.rotation || 0}, ${width/2}, ${height/2})`}
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
            style={{ filter: tableFilter }}
          />
        </>
      ) : (
        <>
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
            style={{ filter: tableFilter }}
          />
        </>
      )}

      {/* ===== TÊN BÀN ===== */}
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

      {/* ===== RESIZE (Chỉ hiện nếu có thể chỉnh sửa) ===== */}
      {editable && selected && (
        <>
          {handle(-4, -4, 'nw')}
          {handle(width - 4, -4, 'ne')}
          {handle(-4, height - 4, 'sw')}
          {handle(width - 4, height - 4, 'se')}
        </>
      )}
    </g>
  )
}
