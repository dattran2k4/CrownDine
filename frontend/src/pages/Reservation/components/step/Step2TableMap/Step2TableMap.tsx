import type { ReservationTable as Table } from '@/types/reservation.type'
import { useEffect, useState } from 'react'
import layoutApi from '@/apis/layout.api'
import type { FloorLayoutResponse, TableLayout, AreaLayout } from '@/types/layout'
import LayoutCanvas from '@/components/Layout/LayoutCanvas'
import AreaCanvas from '@/components/Layout/AreaCanvas'
import { Loader2, ArrowLeft, MapPin, Wallet, Table as TableIcon } from 'lucide-react'
import { formatCurrency } from '@/utils/utils'

interface Props {
  selectedTable: Table | null
  toggleTable: (t: Table) => void
  guests: number
  date: string
  startTime: string
  isPaid?: boolean // Nếu đã thanh toán, không cho chọn bàn mới
}

const Step2TableMap = ({ selectedTable, toggleTable, guests, date, startTime, isPaid = false }: Props) => {
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

  // 3. Fetch available tables for the selected time
  useEffect(() => {
    if (!date || !startTime) return

    const fetchAvailableTables = async () => {
      try {
        const res = await layoutApi.getAvailableTables({
          date,
          startTime,
          guestNumber: guests
        })
        const availableIds = new Set(res.data.data.map((t: TableLayout) => t.id))

        // Nếu đã có bàn được chọn, thêm nó vào availableIds để hiển thị màu xanh
        // (vì bàn đã được đặt bởi reservation hiện tại nên không có trong available tables)
        if (selectedTable) {
          availableIds.add(parseInt(selectedTable.id))
        }

        setAvailableTableIds(availableIds)
      } catch (error) {
        console.error('Failed to load available tables', error)
        // Nếu lỗi, coi như tất cả bàn đều available
        setAvailableTableIds(new Set())
      }
    }
    fetchAvailableTables()
  }, [date, startTime, guests, selectedTable])

  const handleSelectArea = (area: AreaLayout) => {
    setActiveAreaId(area.areaId)
  }

  // Map TableLayout to Booking Table type when clicking on a table
  const handleSelectTable = (tableLayout: TableLayout) => {
    // Nếu đã thanh toán, không cho phép chọn bàn mới
    if (isPaid) {
      return
    }

    // Không cho chọn bàn đã được đặt trong khung giờ này (chỉ áp dụng cho bàn AVAILABLE)
    if (tableLayout.status === 'AVAILABLE' && !availableTableIds.has(tableLayout.id)) {
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
  const activeFloor = floors.find((f) => f.id === activeFloorId)
  const activeArea = activeLayout?.areas.find((a) => a.areaId === activeAreaId)
  const currentSelectedTable = selectedTable

  // Tìm khu vực của bàn đã chọn (nếu có)
  let selectedTableArea: AreaLayout | undefined
  let selectedTableLayout: TableLayout | undefined
  if (currentSelectedTable && activeLayout) {
    for (const area of activeLayout.areas) {
      const table = area.tables.find((t) => t.id === parseInt(currentSelectedTable.id))
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
      <div className='relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-50 via-amber-50 to-orange-100 p-6 shadow-lg ring-1 ring-orange-200/50'>
        <div className='absolute inset-0 bg-linear-to-r from-orange-500/5 to-amber-500/5'></div>
        <div className='relative'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='h-1.5 w-16 rounded-full bg-linear-to-r from-orange-500 to-amber-500 shadow-sm'></div>
            <span className='text-base font-bold text-gray-800'>Thông tin đã chọn</span>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            {/* Tầng */}
            <div className='group flex items-center gap-3 rounded-xl border border-orange-100/50 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-orange-100 to-amber-100 transition-colors group-hover:from-orange-200 group-hover:to-amber-200'>
                <MapPin className='h-5 w-5 text-orange-600' />
              </div>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='mb-0.5 text-xs font-medium text-gray-500'>Tầng</span>
                <span className='truncate text-sm font-bold text-gray-800'>
                  {activeFloor ? activeFloor.name : 'Chưa chọn'}
                </span>
              </div>
            </div>

            {/* Khu vực */}
            <div className='group flex items-center gap-3 rounded-xl border border-orange-100/50 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-orange-100 to-amber-100 transition-colors group-hover:from-orange-200 group-hover:to-amber-200'>
                <MapPin className='h-5 w-5 text-orange-600' />
              </div>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='mb-0.5 text-xs font-medium text-gray-500'>Khu vực</span>
                <span className='truncate text-sm font-bold text-gray-800'>
                  {displayArea ? displayArea.areaName : 'Chưa chọn'}
                </span>
              </div>
            </div>

            {/* Bàn */}
            <div className='group flex items-center gap-3 rounded-xl border border-orange-200/50 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-orange-200 to-orange-300 transition-colors group-hover:from-orange-300 group-hover:to-orange-400'>
                <TableIcon className='h-5 w-5 text-white' />
              </div>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='mb-0.5 text-xs font-medium text-gray-500'>Bàn</span>
                <span className='truncate text-sm font-bold text-orange-600'>
                  {currentSelectedTable ? currentSelectedTable.name : 'Chưa chọn'}
                </span>
              </div>
            </div>

            {/* Tiền cọc bàn */}
            <div className='group flex items-center gap-3 rounded-xl border border-orange-100/50 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-amber-100 to-yellow-100 transition-colors group-hover:from-amber-200 group-hover:to-yellow-200'>
                <Wallet className='h-5 w-5 text-amber-600' />
              </div>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='mb-0.5 text-xs font-medium text-gray-500'>Tiền cọc bàn</span>
                <span className='truncate text-sm font-bold text-gray-800'>
                  {(() => {
                    if (!selectedTableLayout || selectedTableLayout.deposit == null) {
                      return '—'
                    }
                    // Convert deposit to number if it's a string (from BigDecimal)
                    const depositValue =
                      typeof selectedTableLayout.deposit === 'string'
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

      <div className='relative flex min-h-125 flex-col overflow-hidden rounded-2xl border-2 border-gray-200/80 bg-white shadow-2xl backdrop-blur-sm'>
        {/* Floor Tabs - Enhanced Modern Design */}
        {!isLoading && floors.length > 0 && (
          <div className='flex border-b-2 border-gray-200/50 bg-linear-to-br from-gray-50 via-white to-gray-50 shadow-sm'>
            {floors.map((floor) => (
              <button
                key={floor.id}
                onClick={() => setActiveFloorId(floor.id)}
                className={`relative px-8 py-4 text-sm font-bold transition-all duration-300 ${
                  activeFloorId === floor.id
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:bg-linear-to-br hover:from-gray-50 hover:to-white hover:text-gray-900'
                }`}
              >
                {activeFloorId === floor.id && (
                  <>
                    <div className='absolute right-0 bottom-0 left-0 h-1 bg-linear-to-r from-orange-500 via-amber-500 to-orange-500 shadow-lg'></div>
                    <div className='absolute inset-0 bg-linear-to-br from-orange-50/50 to-amber-50/50'></div>
                  </>
                )}
                <span className='relative z-10'>{floor.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Layout Area - Enhanced Modern Design */}
        <div className='relative min-h-125 flex-1 overflow-hidden rounded-b-2xl bg-linear-to-br from-gray-50/80 via-white to-gray-50/80 backdrop-blur-sm'>
          {isLoading ? (
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <div className='flex flex-col items-center gap-4'>
                <div className='relative'>
                  <div className='absolute inset-0 rounded-full bg-linear-to-r from-orange-500/20 to-amber-500/20 blur-xl'></div>
                  <Loader2 className='relative h-12 w-12 animate-spin text-orange-500' />
                </div>
                <p className='text-sm font-semibold text-gray-600'>Đang tải sơ đồ...</p>
              </div>
            </div>
          ) : activeLayout ? (
            activeAreaId === null ? (
              // 1. Show Areas View
              <div className='absolute inset-0 flex flex-col'>
                <div className='border-b-2 border-gray-200/50 bg-linear-to-r from-gray-50/90 via-white to-gray-50/90 p-5 shadow-sm backdrop-blur-sm'>
                  <p className='text-center text-sm font-semibold text-gray-700'>
                    <span className='inline-flex items-center gap-2 rounded-full border border-gray-200/50 bg-white/80 px-4 py-2 shadow-sm'>
                      <MapPin className='h-4 w-4 text-orange-500' />
                      Nhấn vào một khu vực để xem sơ đồ bàn
                    </span>
                  </p>
                </div>
                <div className='relative flex-1'>
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
              <div className='absolute inset-0 flex flex-col'>
                <div className='flex items-center justify-between border-b-2 border-gray-200/50 bg-linear-to-r from-white/90 via-gray-50/90 to-white/90 p-5 shadow-md backdrop-blur-sm'>
                  <button
                    onClick={() => setActiveAreaId(null)}
                    className='flex items-center gap-2 rounded-xl border border-gray-200/50 bg-white/80 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-linear-to-r hover:from-gray-50 hover:to-white hover:text-gray-900 hover:shadow-md'
                  >
                    <ArrowLeft size={18} /> Quay lại
                  </button>
                  <div className='flex items-center gap-2 rounded-xl border border-orange-200/50 bg-linear-to-r from-orange-50 to-amber-50 px-4 py-2 shadow-sm'>
                    <MapPin className='h-4 w-4 text-orange-500' />
                    <span className='text-base font-bold text-gray-800'>
                      {activeLayout.areas.find((a) => a.areaId === activeAreaId)?.areaName}
                    </span>
                  </div>
                  <div className='w-30'></div> {/* Spacer for centering */}
                </div>
                <div className='relative flex-1 bg-white'>
                  <LayoutCanvas
                    layout={activeLayout}
                    activeAreaId={activeAreaId}
                    editable={false}
                    onChange={() => {}} // Disabled in this view
                    onSelectTable={handleSelectTable}
                    selectedTableIds={currentSelectedTable ? [parseInt(currentSelectedTable.id)] : []}
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
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center'>
                <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
                  <TableIcon className='h-6 w-6 text-gray-400' />
                </div>
                <p className='text-sm font-medium text-gray-500'>Không có dữ liệu sơ đồ cho tầng này.</p>
              </div>
            </div>
          )}
        </div>
        <div className='absolute right-0 bottom-6 left-0 text-center'>
          <div className='inline-flex items-center gap-2 rounded-full border-2 border-gray-200/80 bg-white/90 px-5 py-2.5 shadow-lg backdrop-blur-md'>
            <div className='h-2.5 w-2.5 rounded-full bg-linear-to-r from-green-400 to-green-500 shadow-sm ring-2 ring-green-200'></div>
            <span className='text-xs font-semibold text-gray-700'>Cửa ra vào</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step2TableMap
