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
  enableScroll
}: {
  layout: FloorLayoutResponse
  editable: boolean
  onChange: (l: FloorLayoutResponse) => void
  onSelectTable?: (t: TableLayout) => void
  selectedTableIds?: number[]
  activeAreaId?: number | null // If set, only render this area's tables without background rectangles
  zoomScale?: number
  enableScroll?: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [freezeViewBox, setFreezeViewBox] = useState<string | null>(null)

  // Calculate viewBox
  let minX = 0, minY = 0, maxX = 1200, maxY = 600

  if (layout.areas && layout.areas.length > 0) {
    if (activeAreaId) {
      const a = layout.areas.find(a => a.areaId === activeAreaId)
      if (a) {
        const ax = a.x ?? 50
        const ay = a.y ?? 50
        const aw = a.width ?? 400
        const ah = a.height ?? 300

        minX = ax
        minY = ay
        maxX = ax + aw
        maxY = ay + ah

        if (a.tables && a.tables.length > 0) {
          a.tables.forEach(t => {
            const tx = ax + (t.x ?? 0)
            const ty = ay + (t.y ?? 0)
            const tw = t.width ?? 60
            const th = t.height ?? 60

            if (tx < minX) minX = tx
            if (ty < minY) minY = ty
            if (tx + tw > maxX) maxX = tx + tw
            if (ty + th > maxY) maxY = ty + th
          })
        }

        // Add padding perfectly around the isolated area
        minX -= 50
        minY -= 50
        maxX += 50
        maxY += 150
      }
    } else {
      layout.areas.forEach(a => {
        const ax = a.x ?? 50
        const ay = a.y ?? 50
        const aw = a.width ?? 400
        const ah = a.height ?? 300

        if (ax < minX) minX = ax
        if (ay < minY) minY = ay
        if (ax + aw > maxX) maxX = ax + aw
        if (ay + ah > maxY) maxY = ay + ah

        if (a.tables && a.tables.length > 0) {
          a.tables.forEach(t => {
            const right = ax + (t.x ?? 0) + (t.width ?? 60)
            const bottom = ay + (t.y ?? 0) + (t.height ?? 60)
            if (right > maxX) maxX = right
            if (bottom > maxY) maxY = bottom
          })
        }
      })

      if (minX < 0) minX -= 50
      if (minY < 0) minY -= 50
      if (maxX > 1200) maxX += 50
      if (maxY > 600) maxY += 100
    }
  }

  const VBWidth = Math.max(1200, maxX - minX)
  const VBHeight = Math.max(600, maxY - minY)

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
    setSelectedId(table.id)
    onSelectTable?.(table)

    if (!editable) return

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
  }

  const onResizeStart = (
    e: React.PointerEvent,
    areaId: number,
    table: TableLayout,
    dir: any
  ) => {
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
              selected={t.id === selectedId || selectedTableIds?.includes(t.id)}
              onPointerDown={e => onMoveStart(e, a.areaId, t)}
              onResizeStart={(e, dir) =>
                onResizeStart(e, a.areaId, t, dir)
              }
            />
          ))}
        </g>
      ))}
    </svg>
  )

  if (!enableScroll) return innerSvg

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: '#f7f7f7', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', width: physicalWidth, height: physicalHeight, position: 'relative', textAlign: 'left' }}>
        {innerSvg}
      </div>
    </div>
  )
}
