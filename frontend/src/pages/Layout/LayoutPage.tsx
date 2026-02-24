'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import LayoutCanvas from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FloorLayoutResponse, TableLayout, LayoutSaveRequest } from '@/types/layout'
import { Modal } from '@/components/ui/modal'

import { useEffect } from 'react'
import layoutApi from '@/apis/layout.api'
import { toast } from 'sonner' // Assuming sonner is used, if not we'll use a basic alert or simply console.error


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
  const [floors, setFloors] = useState<FloorLayoutResponse[]>([])
  const [activeFloorId, setActiveFloorId] = useState<number | null>(null)
  const [activeAreaId, setActiveAreaId] = useState<number | null>(null)
  const [expandedFloors, setExpandedFloors] = useState<number[]>([1])
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)

  // Dialog states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  const [showAddArea, setShowAddArea] = useState(false)
  const [newAreaName, setNewAreaName] = useState('')
  const [newAreaFloor, setNewAreaFloor] = useState(1)
  const [newAreaDesc, setNewAreaDesc] = useState('')

  const activeFloor = floors.find(f => f.floorId === activeFloorId)
  const activeArea = activeFloor?.areas.find(a => a.areaId === activeAreaId)
  const selectedTable =
    activeArea?.tables.find(t => t.id === selectedTableId) || null

  const loadAllData = async () => {
    try {
      const res = await layoutApi.getAllFloors()
      const floorRecords = res.data.data
      const fullLayouts = await Promise.all(
        floorRecords.map(async f => {
          const layoutRes = await layoutApi.getFloorLayout(f.id)
          return layoutRes.data.data
        })
      )
      setFloors(fullLayouts)
      if (fullLayouts.length > 0) {
        if (!activeFloorId) setActiveFloorId(fullLayouts[0].floorId)
        if (!activeAreaId && fullLayouts[0].areas.length > 0) {
          setActiveAreaId(fullLayouts[0].areas[0].areaId)
        }
        setExpandedFloors(fullLayouts.map(f => f.floorId))
      }
    } catch (error) {
      console.error('Failed to load layout data:', error)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  /* ---------- ADD AREA ---------- */
  const handleSaveArea = async () => {
    if (!newAreaName.trim()) return

    try {
      const floorExist = floors.find(f => f.floorId === newAreaFloor)
      let targetFloorId = newAreaFloor

      if (!floorExist) {
        const createFloorRes = await layoutApi.createFloor({ name: `Tầng ${newAreaFloor}` })
        targetFloorId = createFloorRes.data.data.id
      }

      await layoutApi.createArea(targetFloorId, {
        name: newAreaName,
        description: newAreaDesc
      })

      await loadAllData()
      
      setActiveFloorId(targetFloorId)
      setExpandedFloors(p => p.includes(targetFloorId) ? p : [...p, targetFloorId])
      setShowAddArea(false)
      setNewAreaName('')
      setNewAreaDesc('')
    } catch (error) {
      console.error('Failed to save area:', error)
    }
  }

  /* ---------- ADD TABLE ---------- */
  const addTable = async (shape: TableLayout['shape']) => {
    if (!activeAreaId) return
    const size = SHAPE_SIZE[shape]

    try {
      const res = await layoutApi.createTable(activeAreaId, {
        name: `Bàn mới`,
        shape,
        capacity: size.capacity,
        deposit: 100000,
        width: size.width,
        height: size.height,
        x: 300,
        y: 200,
        rotation: 0
      })
      
      const newTableServer = res.data.data;
      
      // Update local state directly so it has immediate width/height instead of waiting for a reload 
      // which might be missing from the POST response
      const newTableLocal: TableLayout = {
      	...newTableServer,
      	id: newTableServer.id,
      	name: newTableServer.name || 'Bàn mới',
      	shape: newTableServer.shape as TableLayout['shape'] || shape,
      	status: newTableServer.status as TableLayout['status'] || 'AVAILABLE',
      	capacity: newTableServer.capacity || size.capacity,
      	deposit: newTableServer.deposit || 100000,
      	width: newTableServer.width || size.width,
      	height: newTableServer.height || size.height,
      	x: newTableServer.x || 300,
      	y: newTableServer.y || 200,
      	rotation: newTableServer.rotation || 0
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
                    : { ...a, tables: [...a.tables, newTableLocal] }
                )
              }
        )
      )
      
      setSelectedTableId(res.data.data.id)
      
      // Auto-update name based on the new length after refreshing
      // Not perfect but works for simple ID. Ideally backend handles names or we do.
    } catch (error) {
      console.error('Failed to create table:', error)
    }
  }

  /* ---------- UPDATE TABLE STATE ---------- */
  const updateTableState = (patch: Partial<TableLayout>) => {
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

  const handleUpdateTableApi = async () => {
    if (!selectedTable) return
    setIsUpdateModalOpen(true)
  }

  const confirmUpdateTable = async () => {
    if (!selectedTable) return
    setIsUpdateModalOpen(false)
    try {
      await layoutApi.updateTable(selectedTable.id, {
        name: selectedTable.name,
        capacity: selectedTable.capacity,
        shape: selectedTable.shape,
        deposit: selectedTable.deposit,
        width: selectedTable.width,
        height: selectedTable.height,
        x: selectedTable.x,
        y: selectedTable.y,
        rotation: selectedTable.rotation
      })
      toast.success('Cập nhật bàn thành công')
    } catch (error) {
      console.error('Failed to update table:', error)
      toast.error('Cập nhật bàn thất bại')
    }
  }

  const handleDeleteTableApi = async () => {
    if (!selectedTable) return
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteTable = async () => {
    if (!selectedTable) return
    setIsDeleteModalOpen(false)
    try {
      await layoutApi.deleteTable(selectedTable.id)
      toast.success('Xóa bàn thành công')
      setSelectedTableId(null)
      await loadAllData()
    } catch (error) {
      console.error('Failed to delete table:', error)
      toast.error('Xóa bàn thất bại')
    }
  }

  const handleSaveFloorLayout = async () => {
    if (!activeFloor) return
    setIsSaveModalOpen(true)
  }

  const confirmSaveFloorLayout = async () => {
    if (!activeFloor) return
    setIsSaveModalOpen(false)
    try {
      const payload: LayoutSaveRequest = {
        areas: activeFloor.areas.map(a => ({
          areaId: a.areaId,
          objects: a.tables.map(t => ({
            id: t.id,
            x: t.x || 0,
            y: t.y || 0,
            width: t.width || 0,
            height: t.height || 0,
            rotation: t.rotation || 0
          }))
        }))
      }
      await layoutApi.saveLayout(activeFloor.floorId, payload)
      toast.success('Lưu vị trí sơ đồ tầng thành công')
    } catch (error) {
      console.error('Failed to save layout:', error)
      toast.error('Lưu sơ đồ thất bại')
    }
  }

  const updateShape = (shape: TableLayout['shape']) => {
    const size = SHAPE_SIZE[shape]
    updateTableState({
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

          <Button
            className="w-full mb-6 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSaveFloorLayout}
            disabled={!activeFloor}
          >
            Lưu sơ đồ tầng
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
        <div className="flex-1 bg-gray-50 p-6 flex flex-col">
          {!activeFloor || !activeArea ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Chưa có khu vực nào được chọn. Vui lòng thêm hoặc chọn khu vực.
            </div>
          ) : (
            <>
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
                className="bg-white border rounded-lg flex-1 min-h-[500px]"
                style={{
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
            </>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div className="w-80 border-l bg-white p-6 overflow-y-auto">
          {selectedTable ? (
            <>
              <div className="flex justify-between mb-4">
                <h3 className="font-bold">Chỉnh sửa Bàn</h3>
                <X className="cursor-pointer" onClick={() => setSelectedTableId(null)} />
              </div>

              <div className="space-y-4">
                <Field label="Tên bàn *">
                  <Input
                    value={selectedTable.name || ''}
                    onChange={e => updateTableState({ name: e.target.value })}
                  />

                </Field>

                <Field label="Số khách tối đa">
                  <Input
                    type="number"
                    min={1}
                    max={SHAPE_SIZE[selectedTable.shape].capacity}
                    value={selectedTable.capacity || 0}
                    onChange={e =>
                      updateTableState({ capacity: Number(e.target.value) })
                    }
                  />
                </Field>

                <Field label="Tiền cọc (VND)">
                  <Input
                    type="number"
                    min={0}
                    value={selectedTable.deposit || 0}
                    onChange={e =>
                      updateTableState({ deposit: Number(e.target.value) })
                    }
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vị trí X (px)">
                    <Input
                      type="number"
                      value={selectedTable.x || 0}
                      onChange={e => updateTableState({ x: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Vị trí Y (px)">
                    <Input
                      type="number"
                      value={selectedTable.y || 0}
                      onChange={e => updateTableState({ y: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Chiều rộng (px)">
                    <Input
                      type="number"
                      value={selectedTable.width || 0}
                      onChange={e =>
                        updateTableState({ width: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Chiều cao (px)">
                    <Input
                      type="number"
                      value={selectedTable.height || 0}
                      onChange={e =>
                        updateTableState({ height: Number(e.target.value) })
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

                <Button className="w-full" onClick={handleUpdateTableApi}>Cập nhật Cấu hình Bàn</Button>
                <Button variant="destructive" className="w-full" onClick={handleDeleteTableApi}>
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

      {/* Confirm Update Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Xác nhận"
      >
        <div className="flex flex-col gap-4">
          <p>Bạn có chắc chắn muốn lưu thông số mới cho bàn này?</p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={confirmUpdateTable}
            >
              Cập nhật
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xác nhận xóa"
      >
        <div className="flex flex-col gap-4">
          <p>Bạn có chắc chắn muốn xóa bàn này khỏi sơ đồ? Hành động này không thể hoàn tác.</p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={confirmDeleteTable}
            >
              Xóa bàn
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Save Layout Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Xác nhận lưu sơ đồ"
      >
        <div className="flex flex-col gap-4">
          <p>Bạn có chắc chắn muốn lưu lại vị trí của tất cả các bàn trên sơ đồ tầng này?</p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => setIsSaveModalOpen(false)}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
              onClick={confirmSaveFloorLayout}
            >
              Lưu sơ đồ
            </button>
          </div>
        </div>
      </Modal>

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
