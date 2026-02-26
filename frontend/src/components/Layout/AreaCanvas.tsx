import { useRef, useState } from 'react'
import type { FloorLayoutResponse, AreaLayout } from '@/types/layout'

const AREA_COLORS = [
  { fill: '#fff3e0', stroke: '#ffb74d', text: '#e65100' }, // Orange
  { fill: '#e8eaf6', stroke: '#7986cb', text: '#283593' }, // Indigo
  { fill: '#e0f2f1', stroke: '#4db6ac', text: '#00695c' }, // Teal
  { fill: '#fce4ec', stroke: '#f06292', text: '#ad1457' }, // Pink
  { fill: '#f3e5f5', stroke: '#ba68c8', text: '#6a1b9a' }, // Purple
]

// Minimal equivalent of TableShape but for Areas
function AreaShape({
  area,
  index,
  selected,
  onPointerDown,
  onResizeStart
}: {
  area: AreaLayout
  index: number
  selected: boolean
  onPointerDown: (e: React.PointerEvent) => void
  onResizeStart: (e: React.PointerEvent, dir: 'nw' | 'ne' | 'sw' | 'se') => void
}) {
  const x = area.x || 50
  const y = area.y || 50
  const w = area.width || 400
  const h = area.height || 300

  // Optional: Auto scale text size depending on Area width
  const fontSize = Math.max(16, Math.min(28, w / 12))
  const color = AREA_COLORS[index % AREA_COLORS.length]

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={w}
        height={h}
        rx={8}
        fill={color.fill}
        stroke={selected ? color.stroke : 'rgba(0,0,0,0.05)'}
        strokeWidth={selected ? 3 : 1}
        onPointerDown={onPointerDown}
        style={{ cursor: 'move' }}
      />
      
      <text
        x={w / 2}
        y={h / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontWeight="bold"
        fill={color.text}
        style={{ userSelect: 'none', pointerEvents: 'none', opacity: 0.8 }}
      >
        {area.areaName}
      </text>

      {/* Resize handles */}
      {selected && (
        <>
          <circle cx={0} cy={0} r={6} fill="#3b82f6" cursor="nwse-resize" onPointerDown={e => onResizeStart(e, 'nw')} />
          <circle cx={w} cy={0} r={6} fill="#3b82f6" cursor="nesw-resize" onPointerDown={e => onResizeStart(e, 'ne')} />
          <circle cx={0} cy={h} r={6} fill="#3b82f6" cursor="nesw-resize" onPointerDown={e => onResizeStart(e, 'sw')} />
          <circle cx={w} cy={h} r={6} fill="#3b82f6" cursor="nwse-resize" onPointerDown={e => onResizeStart(e, 'se')} />
        </>
      )}
    </g>
  )
}

type DragState =
  | {
      type: 'move'
      areaId: number
      startX: number
      startY: number
      ox: number
      oy: number
    }
  | {
      type: 'resize'
      areaId: number
      dir: 'nw' | 'ne' | 'sw' | 'se'
      startX: number
      startY: number
      ow: number
      oh: number
    }

export default function AreaCanvas({
  layout,
  onChange,
  onSelectArea,
  selectedAreaId,
  zoomScale,
  enableScroll
}: {
  layout: FloorLayoutResponse
  onChange: (l: FloorLayoutResponse) => void
  onSelectArea?: (a: AreaLayout) => void
  selectedAreaId?: number | null
  zoomScale?: number
  enableScroll?: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [localSelectedId, setLocalSelectedId] = useState<number | null>(null)
  const [freezeViewBox, setFreezeViewBox] = useState<string | null>(null)

  const activeSelectedId = selectedAreaId !== undefined ? selectedAreaId : localSelectedId

  // Calculate absolute viewBox bounds for width/height
  let minX = 0, minY = 0, maxX = 1200, maxY = 600

  if (layout.areas && layout.areas.length > 0) {
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
    })
  }

  if (minX < 0) minX -= 50
  if (minY < 0) minY -= 50
  if (maxX > 1200) maxX += 50
  if (maxY > 600) maxY += 100

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

  const getArea = (l: FloorLayoutResponse, aId: number) =>
    l.areas.find(x => x.areaId === aId)!

  const onMoveStart = (e: React.PointerEvent, area: AreaLayout) => {
    setLocalSelectedId(area.areaId)
    onSelectArea?.(area)

    setFreezeViewBox(currentViewBoxStr)
    const pt = getSvgPoint(e)
    dragRef.current = {
      type: 'move',
      areaId: area.areaId,
      startX: pt.x,
      startY: pt.y,
      ox: area.x || 50,
      oy: area.y || 50
    }

    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const onResizeStart = (e: React.PointerEvent, area: AreaLayout, dir: any) => {
    setFreezeViewBox(currentViewBoxStr)
    const pt = getSvgPoint(e)
    dragRef.current = {
      type: 'resize',
      areaId: area.areaId,
      dir,
      startX: pt.x,
      startY: pt.y,
      ow: area.width || 400,
      oh: area.height || 300
    }
    e.stopPropagation()
  }

  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const d = dragRef.current
    const pt = getSvgPoint(e)
    const next = clone()
    const a = getArea(next, d.areaId)

    if (d.type === 'move') {
      a.x = d.ox + (pt.x - d.startX)
      a.y = d.oy + (pt.y - d.startY)
    } else {
      const dx = pt.x - d.startX
      const dy = pt.y - d.startY
      a.width = Math.max(200, d.ow + dx)
      a.height = Math.max(150, d.oh + dy)
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
        background: '#ffffff',
        touchAction: 'none',
        position: enableScroll ? 'absolute' : 'relative',
        inset: enableScroll ? 0 : 'auto',
        overflow: enableScroll ? 'visible' : 'hidden'
      }}
      onPointerMove={onMove}
      onPointerUp={() => { dragRef.current = null; setFreezeViewBox(null); }}
      onPointerLeave={() => { dragRef.current = null; setFreezeViewBox(null); }}
    >
      {layout.areas.map((a, i) => (
        <AreaShape
          key={a.areaId}
          area={a}
          index={i}
          selected={a.areaId === activeSelectedId}
          onPointerDown={e => onMoveStart(e, a)}
          onResizeStart={(e, dir) => onResizeStart(e, a, dir)}
        />
      ))}
    </svg>
  )

  if (!enableScroll) return innerSvg

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: '#ffffff', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', width: physicalWidth, height: physicalHeight, position: 'relative', textAlign: 'left' }}>
        {innerSvg}
      </div>
    </div>
  )
}
