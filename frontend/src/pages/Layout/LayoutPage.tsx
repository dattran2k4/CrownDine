'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import LayoutCanvas from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FloorLayoutResponse, TableLayout } from '@/types/layout'

/* ---------- MOCK DATA ---------- */
const INITIAL_FLOORS: FloorLayoutResponse[] = [
  {
    floorId: 1,
    floorName: 'Tầng 1',
    areas: [
      {
        areaId: 1,
        areaName: 'Góc cửa sổ',
        tables: [
          {
            id: 1,
            name: 'W01',
            shape: 'SQUARE',
            status: 'OCCUPIED',
            x: 200,
            y: 180,
            width: 80,
            height: 80,
            rotation: 0,
            capacity: 2,
            deposit: 100000
          },
          {
            id: 2,
            name: 'W02',
            shape: 'RECT',
            status: 'RESERVED',
            x: 420,
            y: 200,
            width: 140,
            height: 90,
            rotation: 0,
            capacity: 4,
            deposit: 100000
          }
        ]
      }
    ]
  }
]

/* ---------- SHAPE SIZE ---------- */
const SHAPE_SIZE = {
  CIRCLE: { width: 100, height: 100, capacity: 8 },
  SQUARE: { width: 140, height: 140, capacity: 6 },
  RECT: { width: 270, height: 120, capacity: 10 }
} as const

const Field = ({ label, children }: { label: string; children: any }) => (
  <div className="space-y-1">
    <div className="text-sm font-semibold text-gray-700">{label}</div>
    {children}
  </div>
)

export default function LayoutPage() {
  const [floors, setFloors] = useState(INITIAL_FLOORS)
  const [activeFloorId, setActiveFloorId] = useState(1)
  const [activeAreaId, setActiveAreaId] = useState(1)
  const [expandedFloors, setExpandedFloors] = useState<number[]>([1])
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [showAddArea, setShowAddArea] = useState(false)
  const [newAreaName, setNewAreaName] = useState('')
  const [newAreaFloor, setNewAreaFloor] = useState(1)
  const [newAreaDesc, setNewAreaDesc] = useState('')

  const activeFloor = floors.find(f => f.floorId === activeFloorId)!
  const activeArea = activeFloor.areas.find(a => a.areaId === activeAreaId)!
  const selectedTable =
    activeArea.tables.find(t => t.id === selectedTableId) || null

  /* ---------- ADD AREA ---------- */
  const handleSaveArea = () => {
    if (!newAreaName.trim()) return

    const newAreaId = Date.now()

    setFloors(prev => {
      const floorExist = prev.find(f => f.floorId === newAreaFloor)

      // Nếu tầng chưa tồn tại → tạo mới tầng
      if (!floorExist) {
        return [
          ...prev,
          {
            floorId: newAreaFloor,
            floorName: `Tầng ${newAreaFloor}`,
            areas: [
              {
                areaId: newAreaId,
                areaName: newAreaName,
                tables: []
              }
            ]
          }
        ]
      }

      // Nếu tầng tồn tại → thêm khu vực vào tầng
      return prev.map(f =>
        f.floorId === newAreaFloor
          ? {
              ...f,
              areas: [
                ...f.areas,
                {
                  areaId: newAreaId,
                  areaName: newAreaName,
                  tables: []
                }
              ]
            }
          : f
      )
    })

    // set active sau khi tạo
    setActiveFloorId(newAreaFloor)
    setActiveAreaId(newAreaId)
    setExpandedFloors(p =>
      p.includes(newAreaFloor) ? p : [...p, newAreaFloor]
    )

    // reset popup
    setShowAddArea(false)
    setNewAreaName('')
    setNewAreaDesc('')
  }

  /* ---------- ADD TABLE ---------- */
  const addTable = (shape: TableLayout['shape']) => {
    const id = Date.now()
    const size = SHAPE_SIZE[shape]

    const newTable: TableLayout = {
      id,
      name: `B${activeArea.tables.length + 1}`,
      shape,
      status: 'AVAILABLE',
      x: 300,
      y: 200,
      width: size.width,
      height: size.height,
      rotation: 0,
      capacity: size.capacity,
      deposit: 100000
    }

    setFloors(prev =>
      prev.map(f =>
        f.floorId !== activeFloorId
          ? f
          : {
              ...f,
              areas: f.areas.map(a =>
                a.areaId !== activeAreaId
                  ? a
                  : { ...a, tables: [...a.tables, newTable] }
              )
            }
      )
    )

    setSelectedTableId(id)
  }

  /* ---------- UPDATE TABLE ---------- */
  const updateTable = (patch: Partial<TableLayout>) => {
    if (!selectedTableId) return

    setFloors(prev =>
      prev.map(f =>
        f.floorId !== activeFloorId
          ? f
          : {
              ...f,
              areas: f.areas.map(a =>
                a.areaId !== activeAreaId
                  ? a
                  : {
                      ...a,
                      tables: a.tables.map(t =>
                        t.id === selectedTableId
                          ? { ...t, ...patch }
                          : t
                      )
                    }
              )
            }
      )
    )
  }

  const updateShape = (shape: TableLayout['shape']) => {
    const size = SHAPE_SIZE[shape]
    updateTable({
      shape,
      width: size.width,
      height: size.height,
      capacity: size.capacity
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b px-6 py-4 font-bold">
        CrownDine – Quản lý sơ đồ bàn
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ================= LEFT SIDEBAR ================= */}
        <div className="w-64 border-r bg-white p-4 overflow-y-auto">
          <Button
            className="w-full mb-4 gap-2 bg-orange-500 hover:bg-orange-600"
            onClick={() => setShowAddArea(true)}
          >
            <Plus size={16} /> Thêm khu vực
          </Button>

          {floors.map(floor => (
            <div key={floor.floorId} className="mb-2">
              <button
                className="flex items-center gap-2 font-semibold py-2 w-full"
                onClick={() =>
                  setExpandedFloors(p =>
                    p.includes(floor.floorId)
                      ? p.filter(i => i !== floor.floorId)
                      : [...p, floor.floorId]
                  )
                }
              >
                {expandedFloors.includes(floor.floorId)
                  ? <ChevronDown size={16} />
                  : <ChevronRight size={16} />}
                {floor.floorName}
              </button>

              {expandedFloors.includes(floor.floorId) &&
                floor.areas.map(area => (
                  <button
                    key={area.areaId}
                    onClick={() => {
                      setActiveFloorId(floor.floorId)
                      setActiveAreaId(area.areaId)
                      setSelectedTableId(null)
                    }}
                    className={`w-full text-left px-3 py-2 mt-1 rounded-md border-l-4 transition ${
                      area.areaId === activeAreaId
                        ? 'bg-orange-50 border-orange-500'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{area.areaName}</div>
                    <div className="text-xs text-gray-400">
                      {floor.floorName} • {area.tables.length} bàn
                    </div>
                  </button>
                ))}
            </div>
          ))}
        </div>

        {/* ================= CENTER ================= */}
        <div className="flex-1 bg-gray-50 p-6">
          <h2 className="text-xl font-bold mb-4">
            {activeArea.areaName} ({activeFloor.floorName})
          </h2>

          <div className="flex gap-2 mb-4">
            <Button variant="outline" onClick={() => addTable('RECT')}>
              Bàn chữ nhật
            </Button>
            <Button variant="outline" onClick={() => addTable('SQUARE')}>
              Bàn vuông
            </Button>
            <Button variant="outline" onClick={() => addTable('CIRCLE')}>
              Bàn tròn
            </Button>
          </div>

          <div
            className="bg-white border rounded-lg"
            style={{
              height: 520,
              backgroundSize: '30px 30px',
              backgroundImage:
                'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)'
            }}
          >
            <LayoutCanvas
              layout={{
                floorId: activeFloor.floorId,
                floorName: activeFloor.floorName,
                areas: [activeArea]
              }}
              editable
              onSelectTable={t => setSelectedTableId(t.id)}
              onChange={updated =>
                setFloors(prev =>
                  prev.map(f =>
                    f.floorId !== activeFloor.floorId
                      ? f
                      : {
                          ...f,
                          areas: f.areas.map(a =>
                            a.areaId === activeArea.areaId
                              ? updated.areas[0]
                              : a
                          )
                        }
                  )
                )
              }
            />
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="w-80 border-l bg-white p-6">
          {selectedTable ? (
            <>
              <div className="flex justify-between mb-4">
                <h3 className="font-bold">Chỉnh sửa Bàn</h3>
                <X onClick={() => setSelectedTableId(null)} />
              </div>

              <div className="space-y-4">
                <Field label="Tên bàn">
                  <Input
                    value={selectedTable.name}
                    onChange={e => updateTable({ name: e.target.value })}
                  />
                </Field>

                <Field label="Số khách tối đa">
                  <Input
                    type="number"
                    min={1}
                    max={SHAPE_SIZE[selectedTable.shape].capacity}
                    value={selectedTable.capacity}
                    onChange={e =>
                      updateTable({ capacity: Number(e.target.value) })
                    }
                  />
                </Field>

                <Field label="Tiền cọc (VND)">
                  <Input
                    type="number"
                    min={0}
                    value={selectedTable.deposit || 0}
                    onChange={e =>
                      updateTable({ deposit: Number(e.target.value) })
                    }
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vị trí X (px)">
                    <Input
                      type="number"
                      value={selectedTable.x}
                      onChange={e => updateTable({ x: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Vị trí Y (px)">
                    <Input
                      type="number"
                      value={selectedTable.y}
                      onChange={e => updateTable({ y: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Chiều rộng (px)">
                    <Input
                      type="number"
                      value={selectedTable.width}
                      onChange={e =>
                        updateTable({ width: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Chiều cao (px)">
                    <Input
                      type="number"
                      value={selectedTable.height}
                      onChange={e =>
                        updateTable({ height: Number(e.target.value) })
                      }
                    />
                  </Field>
                </div>

                <Field label="Hình dạng">
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={selectedTable.shape}
                    onChange={e =>
                      updateShape(e.target.value as TableLayout['shape'])
                    }
                  >
                    <option value="RECT">Chữ nhật</option>
                    <option value="SQUARE">Vuông</option>
                    <option value="CIRCLE">Tròn</option>
                  </select>
                </Field>

                <Button className="w-full">Cập nhật</Button>
                <Button variant="destructive" className="w-full">
                  Xóa bàn
                </Button>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-center mt-20">
              Chọn một bàn để chỉnh sửa
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL THÊM KHU VỰC ===== */}
      {showAddArea && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Thêm Khu vực Mới</h3>
              <X
                className="cursor-pointer"
                onClick={() => setShowAddArea(false)}
              />
            </div>

            <Field label="Tên khu vực *">
              <Input
                placeholder="Nhập tên khu vực"
                value={newAreaName}
                onChange={e => setNewAreaName(e.target.value)}
              />
            </Field>

            <Field label="Tầng">
              <Input
                type="number"
                min={1}
                value={newAreaFloor}
                onChange={e => setNewAreaFloor(Number(e.target.value))}
              />
            </Field>

            <Field label="Mô tả">
              <textarea
                className="w-full border rounded px-3 py-2"
                placeholder="Nhập mô tả khu vực"
                value={newAreaDesc}
                onChange={e => setNewAreaDesc(e.target.value)}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddArea(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveArea}>
                Lưu khu vực
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
