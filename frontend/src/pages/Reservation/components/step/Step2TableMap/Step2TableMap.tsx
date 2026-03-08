import type { Table } from '@/pages/Reservation/data'
import { useEffect, useState } from 'react'
import layoutApi from '@/apis/layout.api'
import type { FloorLayoutResponse, TableLayout, AreaLayout } from '@/types/layout'
import LayoutCanvas from '@/components/Layout/LayoutCanvas'
import AreaCanvas from '@/components/Layout/AreaCanvas'
import { Loader2, ArrowLeft, MapPin, Wallet, Table as TableIcon } from 'lucide-react'
import { formatCurrency } from '@/utils/utils'

interface Props {
  selectedTables: Table[]
  toggleTable: (t: Table) => void
  guests: number
  date: string
  startTime: string
  endTime: string
  isPaid?: boolean // Nếu đã thanh toán, không cho chọn bàn mới
}

const Step2TableMap = ({
  selectedTables,
  toggleTable,
  guests,
  date,
  startTime,
  endTime,
  isPaid = false
}: Props) => {
  const [floors, setFloors] = useState<{ id: number; name: string }[]>([])
  const [activeFloorId, setActiveFloorId] = useState<number | null>(null)
  const [activeAreaId, setActiveAreaId] = useState<number | null>(null)
  const [activeLayout, setActiveLayout] = useState<FloorLayoutResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableTableIds, setAvailableTableIds] = useState<Set<number>>(new Set())

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

  // 3. Fetch available tables for the selected time slot
  useEffect(() => {
    if (!date || !startTime || !endTime) return

    const fetchAvailableTables = async () => {
      try {
        const res = await layoutApi.getAvailableTables({
          date,
          startTime,
          endTime,
          guestNumber: guests
        })
        const availableIds = new Set(res.data.data.map((t: TableLayout) => t.id))
        
        // Nếu đã có bàn được chọn (selectedTables), thêm nó vào availableIds để hiển thị màu xanh
        // (vì bàn đã được đặt bởi reservation hiện tại nên không có trong available tables)
        selectedTables.forEach(table => {
          availableIds.add(parseInt(table.id))
        })
        
        setAvailableTableIds(availableIds)
      } catch (error) {
        console.error('Failed to load available tables', error)
        // Nếu lỗi, coi như tất cả bàn đều available
        setAvailableTableIds(new Set())
      }
    }
    fetchAvailableTables()
  }, [date, startTime, endTime, guests, selectedTables])

  const handleSelectArea = (area: AreaLayout) => {
    setActiveAreaId(area.areaId)
  }

  // Map TableLayout to Booking Table type when clicking on a table
  const handleSelectTable = (tableLayout: TableLayout) => {
    // Nếu đã thanh toán, không cho phép chọn bàn mới
    if (isPaid) {
      return
    }
    
    // Không cho chọn bàn OCCUPIED hoặc RESERVED
    if (tableLayout.status === 'OCCUPIED' || tableLayout.status === 'RESERVED') {
      return
    }
    
    // Không cho chọn bàn đã được đặt trong khung giờ này
    if (!availableTableIds.has(tableLayout.id)) {
      return
    }
    
    // Không cho chọn bàn AVAILABLE nhưng capacity < guests
    if (tableLayout.status === 'AVAILABLE') {
      const capacity = tableLayout.capacity || 2
      if (capacity < guests) {
        return
      }
    }

    // Chỉ cho chọn bàn AVAILABLE, capacity >= guests, và chưa được đặt trong khung giờ này
    const mappedTable: Table = {
      id: tableLayout.id.toString(),
      name: tableLayout.name || `Bàn ${tableLayout.id}`,
      capacity: tableLayout.capacity || 2,
      status: tableLayout.status as 'AVAILABLE' | 'OCCUPIED' | 'RESERVED',
      type: 'STANDARD' // Backend might not store type yet, fallback to STANDARD
    }

    toggleTable(mappedTable)
  }
  // Lấy thông tin hiển thị
  const activeFloor = floors.find(f => f.id === activeFloorId)
  const activeArea = activeLayout?.areas.find(a => a.areaId === activeAreaId)
  const selectedTable = selectedTables[0]
  
  // Tìm khu vực của bàn đã chọn (nếu có)
  let selectedTableArea: AreaLayout | undefined
  let selectedTableLayout: TableLayout | undefined
  if (selectedTable && activeLayout) {
    for (const area of activeLayout.areas) {
      const table = area.tables.find(t => t.id === parseInt(selectedTable.id))
      if (table) {
        selectedTableArea = area
        selectedTableLayout = table
        break
      }
    }
  }

  // Hiển thị khu vực: ưu tiên khu vực của bàn đã chọn, nếu không thì khu vực đang xem
  const displayArea = selectedTableArea || activeArea

  return (
    <div className='animate-fade-in space-y-6'>
      {/* Thông tin đã chọn - Modern Design */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-6 shadow-lg ring-1 ring-orange-200/50'>
        <div className='absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5'></div>
        <div className='relative'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='h-1.5 w-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-sm'></div>
            <span className='text-base font-bold text-gray-800'>Thông tin đã chọn</span>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {/* Tầng */}
            <div className='group flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3.5 border border-orange-100/50 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 group-hover:from-orange-200 group-hover:to-amber-200 transition-colors'>
                <MapPin className='h-5 w-5 text-orange-600' />
              </div>
              <div className='flex flex-col min-w-0 flex-1'>
                <span className='text-xs font-medium text-gray-500 mb-0.5'>Tầng</span>
                <span className='text-sm font-bold text-gray-800 truncate'>
                  {activeFloor ? activeFloor.name : 'Chưa chọn'}
                </span>
              </div>
            </div>

            {/* Khu vực */}
            <div className='group flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3.5 border border-orange-100/50 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 group-hover:from-orange-200 group-hover:to-amber-200 transition-colors'>
                <MapPin className='h-5 w-5 text-orange-600' />
              </div>
              <div className='flex flex-col min-w-0 flex-1'>
                <span className='text-xs font-medium text-gray-500 mb-0.5'>Khu vực</span>
                <span className='text-sm font-bold text-gray-800 truncate'>
                  {displayArea ? displayArea.areaName : 'Chưa chọn'}
                </span>
              </div>
            </div>

            {/* Bàn */}
            <div className='group flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3.5 border border-orange-200/50 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-200 to-orange-300 group-hover:from-orange-300 group-hover:to-orange-400 transition-colors'>
                <TableIcon className='h-5 w-5 text-white' />
        </div>
              <div className='flex flex-col min-w-0 flex-1'>
                <span className='text-xs font-medium text-gray-500 mb-0.5'>Bàn</span>
                <span className='text-sm font-bold text-orange-600 truncate'>
                  {selectedTable ? selectedTable.name : 'Chưa chọn'}
                </span>
        </div>
      </div>

            {/* Tiền cọc bàn */}
            <div className='group flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3.5 border border-orange-100/50 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 group-hover:from-amber-200 group-hover:to-yellow-200 transition-colors'>
                <Wallet className='h-5 w-5 text-amber-600' />
              </div>
              <div className='flex flex-col min-w-0 flex-1'>
                <span className='text-xs font-medium text-gray-500 mb-0.5'>Tiền cọc bàn</span>
                <span className='text-sm font-bold text-gray-800 truncate'>
                  {(() => {
                    if (!selectedTableLayout || selectedTableLayout.deposit == null) {
                      return '—'
                    }
                    // Convert deposit to number if it's a string (from BigDecimal)
                    const depositValue = typeof selectedTableLayout.deposit === 'string' 
                      ? parseFloat(selectedTableLayout.deposit) 
                      : selectedTableLayout.deposit
                    return isNaN(depositValue) ? '—' : formatCurrency(depositValue)
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>

      <div className='relative min-h-[500px] overflow-hidden rounded-2xl border-2 border-gray-200/80 bg-white shadow-2xl flex flex-col backdrop-blur-sm'>
        {/* Floor Tabs - Enhanced Modern Design */}
        {!isLoading && floors.length > 0 && (
          <div className="flex border-b-2 border-gray-200/50 bg-gradient-to-br from-gray-50 via-white to-gray-50 shadow-sm">
            {floors.map(floor => (
              <button
                key={floor.id}
                onClick={() => setActiveFloorId(floor.id)}
                className={`relative px-8 py-4 text-sm font-bold transition-all duration-300 ${
                  activeFloorId === floor.id
                    ? 'text-orange-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-br hover:from-gray-50 hover:to-white'
                }`}
              >
                {activeFloorId === floor.id && (
                  <>
                    <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-lg'></div>
                    <div className='absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50'></div>
                  </>
                )}
                <span className='relative z-10'>{floor.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Layout Area - Enhanced Modern Design */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-50/80 via-white to-gray-50/80 rounded-b-2xl overflow-hidden min-h-[500px] backdrop-blur-sm">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className='flex flex-col items-center gap-4'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full blur-xl'></div>
                  <Loader2 className="relative h-12 w-12 animate-spin text-orange-500" />
                </div>
                <p className='text-sm font-semibold text-gray-600'>Đang tải sơ đồ...</p>
              </div>
            </div>
          ) : activeLayout ? (
            activeAreaId === null ? (
              // 1. Show Areas View
              <div className="absolute inset-0 flex flex-col">
                <div className="bg-gradient-to-r from-gray-50/90 via-white to-gray-50/90 backdrop-blur-sm p-5 border-b-2 border-gray-200/50 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 text-center">
                    <span className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-gray-200/50 shadow-sm'>
                      <MapPin className='h-4 w-4 text-orange-500' />
                      Nhấn vào một khu vực để xem sơ đồ bàn
                    </span>
                  </p>
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
                <div className="bg-gradient-to-r from-white/90 via-gray-50/90 to-white/90 backdrop-blur-sm p-5 border-b-2 border-gray-200/50 flex items-center justify-between shadow-md">
                  <button 
                    onClick={() => setActiveAreaId(null)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white/80 border border-gray-200/50 shadow-sm hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:border-gray-300 hover:shadow-md hover:text-gray-900 transition-all duration-200"
                  >
                    <ArrowLeft size={18} /> Quay lại
                  </button>
                  <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 shadow-sm'>
                    <MapPin className='h-4 w-4 text-orange-500' />
                    <span className="font-bold text-base text-gray-800">
                    {activeLayout.areas.find(a => a.areaId === activeAreaId)?.areaName}
                  </span>
                  </div>
                  <div className="w-[120px]"></div> {/* Spacer for centering */}
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
                    guests={guests}
                    availableTableIds={availableTableIds}
                    isPaid={isPaid}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className='text-center'>
                <div className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4'>
                  <TableIcon className='h-6 w-6 text-gray-400' />
                </div>
                <p className='text-sm font-medium text-gray-500'>Không có dữ liệu sơ đồ cho tầng này.</p>
              </div>
            </div>
          )}
        </div>
        <div className='absolute right-0 bottom-6 left-0 text-center'>
          <div className='inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-full border-2 border-gray-200/80 shadow-lg'>
            <div className='h-2.5 w-2.5 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-sm ring-2 ring-green-200'></div>
            <span className='text-xs font-semibold text-gray-700'>Cửa ra vào</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step2TableMap
