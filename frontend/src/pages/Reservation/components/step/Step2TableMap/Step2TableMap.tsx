import type { Table } from '@/pages/Reservation/data'
import { useEffect, useState } from 'react'
import layoutApi from '@/apis/layout.api'
import type { FloorLayoutResponse, TableLayout, AreaLayout } from '@/types/layout'
import LayoutCanvas from '@/components/Layout/LayoutCanvas'
import AreaCanvas from '@/components/Layout/AreaCanvas'
import { Loader2, ArrowLeft } from 'lucide-react'

interface Props {
  selectedTables: Table[]
  toggleTable: (t: Table) => void
  guests: number
  totalCapacity: number
  multiTableOption: 'NEAR' | 'SEPARATED'
  setMultiTableOption: (o: 'NEAR' | 'SEPARATED') => void
}

const Step2TableMap = ({
  selectedTables,
  toggleTable,
  guests,
  totalCapacity,
  multiTableOption,
  setMultiTableOption
}: Props) => {
  const [floors, setFloors] = useState<{ id: number; name: string }[]>([])
  const [activeFloorId, setActiveFloorId] = useState<number | null>(null)
  const [activeAreaId, setActiveAreaId] = useState<number | null>(null)
  const [activeLayout, setActiveLayout] = useState<FloorLayoutResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 1. Fetch all floors on mount
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await layoutApi.getAllFloors()
        const fetchedFloors = res.data.data
        setFloors(fetchedFloors)
        if (fetchedFloors.length > 0) {
          setActiveFloorId(fetchedFloors[0].id)
        }
      } catch (error) {
        console.error('Failed to load floors', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFloors()
  }, [])

  // 2. Fetch specific floor layout when activeFloorId changes
  useEffect(() => {
    if (!activeFloorId) return

    const fetchLayout = async () => {
      try {
        const res = await layoutApi.getFloorLayout(activeFloorId)
        setActiveLayout(res.data.data)
        setActiveAreaId(null) // Reset area when floor changes
      } catch (error) {
        console.error('Failed to load layout details', error)
      }
    }
    fetchLayout()
  }, [activeFloorId])

  const handleSelectArea = (area: AreaLayout) => {
    setActiveAreaId(area.areaId)
  }

  // Map TableLayout to Booking Table type when clicking on a table
  const handleSelectTable = (tableLayout: TableLayout) => {
    if (tableLayout.status !== 'AVAILABLE') return

    const mappedTable: Table = {
      id: tableLayout.id.toString(),
      name: tableLayout.name || `Bàn ${tableLayout.id}`,
      capacity: tableLayout.capacity || 2,
      status: tableLayout.status as 'AVAILABLE' | 'OCCUPIED' | 'RESERVED',
      type: 'STANDARD' // Backend might not store type yet, fallback to STANDARD
    }

    toggleTable(mappedTable)
  }
  return (
    <div className='animate-fade-in space-y-6'>
      <div className='flex items-center justify-between rounded-lg border bg-gray-50 p-4'>
        <div>
          <p className='text-sm font-bold'>Đang chọn cho: {guests} Khách</p>
        </div>
        <div
          className={`rounded-lg border px-4 py-2 font-bold ${totalCapacity >= guests ? 'border-green-200 bg-green-100 text-green-700' : 'border-red-200 bg-red-100 text-red-700'}`}
        >
          Sức chứa: {totalCapacity}/{guests}
        </div>
      </div>

      {selectedTables.length > 1 && (
        <div className='flex gap-6 text-sm'>
          <label className='flex cursor-pointer items-center gap-2'>
            <input
              type='radio'
              checked={multiTableOption === 'NEAR'}
              onChange={() => setMultiTableOption('NEAR')}
              className='accent-primary'
            />
            <span>Xếp bàn gần nhau</span>
          </label>
          <label className='flex cursor-pointer items-center gap-2'>
            <input
              type='radio'
              checked={multiTableOption === 'SEPARATED'}
              onChange={() => setMultiTableOption('SEPARATED')}
              className='accent-primary'
            />
            <span>Có thể ngồi tách bàn</span>
          </label>
        </div>
      )}

      <div className='relative min-h-[500px] rounded-xl border bg-white shadow-inner flex flex-col'>
        {/* Floor Tabs */}
        {!isLoading && floors.length > 0 && (
          <div className="flex border-b">
            {floors.map(floor => (
              <button
                key={floor.id}
                onClick={() => setActiveFloorId(floor.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeFloorId === floor.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {floor.name}
              </button>
            ))}
          </div>
        )}

        {/* Layout Area */}
        <div className="flex-1 relative bg-[#f7f7f7] rounded-b-xl overflow-hidden min-h-[500px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Đang tải sơ đồ...</p>
            </div>
          ) : activeLayout ? (
            activeAreaId === null ? (
              // 1. Show Areas View
              <div className="absolute inset-0 flex flex-col">
                <div className="bg-white p-2 border-b text-sm text-gray-500 text-center">
                  Nhấn vào một khu vực để xem sơ đồ bàn.
                </div>
                <div className="flex-1 relative">
                  <AreaCanvas
                    layout={activeLayout}
                    onChange={() => {}} // Readonly
                    onSelectArea={handleSelectArea}
                    zoomScale={0.4}
                    enableScroll={true}
                  />
                </div>
              </div>
            ) : (
              // 2. Show Tables in Specific Area View
              <div className="absolute inset-0 flex flex-col">
                <div className="bg-white p-2 border-b flex items-center justify-between">
                  <button 
                    onClick={() => setActiveAreaId(null)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                  >
                    <ArrowLeft size={16} /> Quay lại chọn khu vực
                  </button>
                  <span className="font-medium text-sm">
                    {activeLayout.areas.find(a => a.areaId === activeAreaId)?.areaName}
                  </span>
                  <div className="w-[100px]"></div> {/* Spacer for centering */}
                </div>
                <div className="flex-1 relative bg-white">
                  <LayoutCanvas
                    layout={activeLayout}
                    activeAreaId={activeAreaId}
                    editable={false}
                    onChange={() => {}} // Disabled in this view
                    onSelectTable={handleSelectTable}
                    selectedTableIds={selectedTables.map(t => parseInt(t.id))}
                    zoomScale={0.4}
                    enableScroll={true}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <p>Không có dữ liệu sơ đồ cho tầng này.</p>
            </div>
          )}
        </div>
        <div className='absolute right-0 bottom-4 left-0 text-center text-xs text-gray-400'>
          Cửa ra vào
          <div className='mx-auto mt-1 h-1 w-20 bg-gray-300'></div>
        </div>
      </div>
    </div>
  )
}

export default Step2TableMap
