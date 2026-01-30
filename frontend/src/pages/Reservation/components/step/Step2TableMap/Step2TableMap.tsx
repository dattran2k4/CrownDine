import { MOCK_TABLES, type Table } from '@/pages/Reservation/data'
import { Armchair } from 'lucide-react'

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

      <div className='relative min-h-100 rounded-xl border bg-white p-8 shadow-inner'>
        <div className='grid grid-cols-2 justify-items-center gap-6 md:grid-cols-3 lg:grid-cols-4'>
          {MOCK_TABLES.map((table) => {
            const isSelected = selectedTables.some((t) => t.id === table.id)
            const isAvailable = table.status === 'AVAILABLE'

            return (
              <button
                key={table.id}
                disabled={!isAvailable}
                onClick={() => toggleTable(table)}
                className={`relative flex aspect-square w-full max-w-30 flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all ${!isAvailable ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60' : ''} ${isSelected ? 'bg-primary border-primary scale-105 transform text-white shadow-lg' : 'hover:border-primary/50 bg-white'} `}
              >
                <Armchair size={24} />
                <span className='text-xs font-bold'>{table.name}</span>
                <span className='text-[10px] opacity-80'>{table.capacity} ghế</span>
                {table.type === 'VIP' && (
                  <span className='absolute top-2 right-2 rounded-sm bg-yellow-400 px-1.5 text-[10px] font-bold text-black'>
                    VIP
                  </span>
                )}
                {!isAvailable && (
                  <span className='absolute inset-0 flex rotate-12 items-center justify-center rounded-2xl bg-black/5 text-xs font-bold text-gray-500'>
                    ĐÃ ĐẶT
                  </span>
                )}
              </button>
            )
          })}
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
