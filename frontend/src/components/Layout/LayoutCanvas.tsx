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
  onSelectTable
}: {
  layout: FloorLayoutResponse
  editable: boolean
  onChange: (l: FloorLayoutResponse) => void
  onSelectTable?: (t: TableLayout) => void
}) {
  const dragRef = useRef<DragState | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

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

    if (!editable || table.status !== 'AVAILABLE') return

    dragRef.current = {
      type: 'move',
      areaId,
      tableId: table.id,
      startX: e.clientX,
      startY: e.clientY,
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
    dragRef.current = {
      type: 'resize',
      areaId,
      tableId: table.id,
      dir,
      startX: e.clientX,
      startY: e.clientY,
      ow: table.width,
      oh: table.height
    }
    e.stopPropagation()
  }

  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const d = dragRef.current
    const next = clone()
    const t = getTable(next, d.areaId, d.tableId)

    if (d.type === 'move') {
      t.x = d.ox + (e.clientX - d.startX)
      t.y = d.oy + (e.clientY - d.startY)
    } else {
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      t.width = Math.max(40, d.ow + dx)
      t.height = Math.max(40, d.oh + dy)
    }

    onChange(next)
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1200 600"
      style={{ background: '#f7f7f7', touchAction: 'none' }}
      onPointerMove={onMove}
      onPointerUp={() => (dragRef.current = null)}
      onPointerLeave={() => (dragRef.current = null)}
    >
      {layout.areas.map(a =>
        a.tables.map(t => (
          <TableShape
            key={t.id}
            table={t}
            editable={editable}
            selected={t.id === selectedId}
            onPointerDown={e => onMoveStart(e, a.areaId, t)}
            onResizeStart={(e, dir) =>
              onResizeStart(e, a.areaId, t, dir)
            }
          />
        ))
      )}
    </svg>
  )
}
