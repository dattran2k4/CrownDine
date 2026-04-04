import { useRef, useState } from 'react'
import type { FloorLayoutResponse, TableLayout } from '@/types/layout'
import TableShape from '@/components/TableShape'

type DragState =
  | {
      type: 'move'
      areaId: number
      tableId: number
      startX: number
      startY: number
      ox: number
      oy: number
    }
  | {
      type: 'resize'
      areaId: number
      tableId: number
      dir: 'nw' | 'ne' | 'sw' | 'se'
      startX: number
      startY: number
      ow: number
      oh: number
    }

export default function LayoutCanvas({
  layout,
  editable,
  onChange,
  onSelectTable,
  selectedTableIds,
  activeAreaId,
  zoomScale,
  enableScroll,
  guests,
  availableTableIds,
  isPaid
}: {
  layout: FloorLayoutResponse
  editable: boolean
  onChange: (l: FloorLayoutResponse) => void
  onSelectTable?: (t: TableLayout) => void
  selectedTableIds?: number[]
  activeAreaId?: number | null // If set, only render this area's tables without background rectangles
  zoomScale?: number
  enableScroll?: boolean
  guests?: number // Số khách để kiểm tra capacity
  availableTableIds?: Set<number> // Danh sách ID các bàn available trong khung giờ
  isPaid?: boolean // Nếu đã thanh toán, không cho chọn bàn mới
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [freezeViewBox, setFreezeViewBox] = useState<string | null>(null)

  // Setup fixed viewBox for consistent background across all pages
  const minX = 0
  const minY = 0
  const VBWidth = 1200
  const VBHeight = 1000 // Fixed height for standard layout 

  const currentViewBoxStr = `${minX} ${minY} ${VBWidth} ${VBHeight}`
  const viewBoxStr = freezeViewBox ?? currentViewBoxStr

  const physicalWidth = zoomScale ? VBWidth * zoomScale : VBWidth
  const physicalHeight = zoomScale ? VBHeight * zoomScale : VBHeight

  const getSvgPoint = (e: React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return { x: e.clientX, y: e.clientY }
    let point = svg.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY
    return point.matrixTransform(svg.getScreenCTM()!.inverse())
  }

  const clone = () => structuredClone(layout)

  const getTable = (l: FloorLayoutResponse, a: number, t: number) =>
    l.areas.find(x => x.areaId === a)!.tables.find(x => x.id === t)!

  const onMoveStart = (
    e: React.PointerEvent,
    areaId: number,
    table: TableLayout
  ) => {
    // If we're in edit mode (Admin), always allow selecting/moving everything
    if (editable) {
       setSelectedId(table.id)
       onSelectTable?.(table)
       setFreezeViewBox(currentViewBoxStr)
       const pt = getSvgPoint(e)
       dragRef.current = {
         type: 'move',
         areaId,
         tableId: table.id,
         startX: pt.x,
         startY: pt.y,
         ox: table.x,
         oy: table.y
       }
       ;(e.target as Element).setPointerCapture(e.pointerId)
       return;
    }

    // --- RESERVATION MODE FILTERS ---
    setSelectedId(table.id)
    onSelectTable?.(table)
  }

  const onResizeStart = (
    e: React.PointerEvent,
    areaId: number,
    table: TableLayout,
    dir: any
  ) => {
    if (!editable) return; // Only allow resize in edit mode
    
    setFreezeViewBox(currentViewBoxStr)
    const pt = getSvgPoint(e)
    dragRef.current = {
      type: 'resize',
      areaId,
      tableId: table.id,
      dir,
      startX: pt.x,
      startY: pt.y,
      ow: table.width,
      oh: table.height
    }
    e.stopPropagation()
  }

  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const d = dragRef.current
    const pt = getSvgPoint(e)
    const next = clone()
    const t = getTable(next, d.areaId, d.tableId)

    if (d.type === 'move') {
      t.x = d.ox + (pt.x - d.startX)
      t.y = d.oy + (pt.y - d.startY)
    } else {
      const dx = pt.x - d.startX
      const dy = pt.y - d.startY
      
      t.width = Math.max(40, d.ow + dx)
      t.height = Math.max(40, d.oh + dy)
    }

    onChange(next)
  }

  const innerSvg = (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={viewBoxStr}
      style={{
        background: '#f7f7f7',
        touchAction: 'none',
        position: enableScroll ? 'absolute' : 'relative',
        inset: enableScroll ? 0 : 'auto',
        overflow: enableScroll ? 'visible' : 'hidden'
      }}
      onPointerMove={onMove}
      onPointerUp={() => { dragRef.current = null; setFreezeViewBox(null); }}
      onPointerLeave={() => { dragRef.current = null; setFreezeViewBox(null); }}
    >
      {/* 1. Draw Areas Backgrounds & Labels (Hide if editing a specific Area) */}
      {!activeAreaId && layout.areas.map(a => {
        const x = a.x ?? 50
        const y = a.y ?? 50
        const w = a.width ?? 400
        const h = a.height ?? 300

        // Optional: Auto scale text size depending on Area width
        const fontSize = Math.max(14, Math.min(24, w / 15))

        return (
          <g key={`area-${a.areaId}`}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={12}
              fill="rgba(0,0,0,0.03)"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth={2}
              strokeDasharray="8 8"
            />
            <text
              x={x + w / 2}
              y={y + h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fontWeight="bold"
              fill="#888"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              Khu vực: {a.areaName}
            </text>
          </g>
        )
      })}

      {/* 2. Draw Tables on top */}
      {layout.areas
        .filter(a => activeAreaId ? a.areaId === activeAreaId : true)
        .map(a => (
        <g key={`area-tables-${a.areaId}`} transform={`translate(${a.x ?? 50}, ${a.y ?? 50})`}>
          {a.tables.map(t => (
            <TableShape
              key={t.id}
              table={t}
              editable={editable}
              selected={selectedTableIds !== undefined ? selectedTableIds.includes(t.id) : t.id === selectedId}
              onPointerDown={e => onMoveStart(e, a.areaId, t)}
              onResizeStart={(e, dir) =>
                onResizeStart(e, a.areaId, t, dir)
              }
              guests={guests}
              isAvailableInTimeSlot={availableTableIds ? availableTableIds.has(t.id) : true}
            />
          ))}
        </g>
      ))}
    </svg>
  )

  if (enableScroll) {
    return (
      <div className="w-full h-[600px] overflow-auto relative border border-slate-200 shadow-sm rounded-xl">
        <div style={{ width: physicalWidth, height: physicalHeight, position: 'relative', margin: '0 auto' }}>
          {innerSvg}
        </div>
      </div>
    )
  }

  return innerSvg
}
