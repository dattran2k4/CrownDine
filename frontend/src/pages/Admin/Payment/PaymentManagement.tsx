import { useState, useEffect, Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Search, Eye, Filter, RefreshCw, Code2, X } from 'lucide-react'
import paymentApi from '@/apis/payment.api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import type { PaymentDetailResponse } from '@/types/payment.type'
import { cn } from '@/lib/utils'

// Raw Data Modal Extracted
const RawDataModal = ({ data, onClose }: { data: string | null; onClose: () => void }) => {
  if (data === null) return null

  let parsedJson = data
  try {
    // Attempt to format if it's JSON
    parsedJson = JSON.stringify(JSON.parse(data), null, 2)
  } catch (e) {
    // leave as text
  }

  return (
    <div className='bg-background/80 fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm'>
      <div className='bg-card border-border animate-in fade-in zoom-in-95 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border shadow-lg'>
        <div className='border-border flex items-center justify-between border-b px-5 py-4'>
          <h2 className='text-foreground flex items-center gap-2 text-lg font-bold'>
            <Code2 className='text-primary h-5 w-5' /> Debug Giao dịch (Raw Payload)
          </h2>
          <button onClick={onClose} className='text-muted-foreground hover:bg-muted rounded p-1.5 transition-colors'>
            <X className='h-5 w-5' />
          </button>
        </div>
        <div className='hide-scrollbar w-full overflow-y-auto bg-[#1e1e1e] p-0 font-mono text-xs text-green-400'>
          <pre className='word-break p-4 whitespace-pre-wrap'>
            {parsedJson || 'Không có dữ liệu Callback từ đối tác'}
          </pre>
        </div>
      </div>
    </div>
  )
}

const PaymentManagement = () => {
  // Advanced Filter States
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [target, setTarget] = useState('')
  const [source, setSource] = useState('')
  const [dateFilterType, setDateFilterType] = useState('ALL') // ALL, TODAY, YESTERDAY, CUSTOM
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Pagination State
  const [page, setPage] = useState(1)
  const [size] = useState(15)

  // Audit view state
  const [selectedRawData, setSelectedRawData] = useState<string | null>(null)

  // Handlers for Date parsing
  const getFilterDates = () => {
    let fromDate = ''
    let toDate = ''

    const today = new Date()
    // Local Timezone adjustment hack for native YYYY-MM-DD format
    const timezoneOffset = today.getTimezoneOffset() * 60000

    if (dateFilterType === 'TODAY') {
      const todayStr = new Date(today.getTime() - timezoneOffset).toISOString().split('T')[0]
      fromDate = todayStr
      toDate = todayStr
    } else if (dateFilterType === 'YESTERDAY') {
      const yesterday = new Date(today.getTime() - 86400000)
      const yesterdayStr = new Date(yesterday.getTime() - timezoneOffset).toISOString().split('T')[0]
      fromDate = yesterdayStr
      toDate = yesterdayStr
    } else if (dateFilterType === 'CUSTOM') {
      fromDate = customStartDate
      toDate = customEndDate
    }

    return { fromDate, toDate }
  }

  const { fromDate, toDate } = getFilterDates()

  // React Query Fetch Data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['payments', { page, size, search, status, type, target, source, fromDate, toDate }],
    queryFn: () =>
      paymentApi.getPayments({
        page,
        size,
        search: search || undefined,
        status: status || undefined,
        type: type || undefined,
        target: target || undefined,
        source: source || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      })
  })

  // Fallbacks
  const payments = data?.data?.data?.data || [] // Adjusted mapping to match standard Pagination response
  const totalPages = data?.data?.data?.totalPages || 0
  const totalItems = data?.data?.data?.totalItems || 0

  // Format money helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Visual Badges
  const renderStatusBadge = (s: string) => {
    switch (s) {
      case 'SUCCESS':
        return (
          <Badge variant='success' className='border-emerald-500/30 bg-emerald-500/15 text-emerald-600'>
            Thành công
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant='warning' className='border-amber-500/30 bg-amber-500/15 text-amber-600'>
            Đang chờ
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge variant='danger' className='border-rose-500/30 bg-rose-500/15 text-rose-600'>
            Thất bại
          </Badge>
        )
      case 'REFUNDED':
        return (
          <Badge variant='outline' className='border-zinc-500/30 bg-zinc-500/15 text-zinc-600'>
            Hoàn tiền
          </Badge>
        )
      default:
        return <Badge variant='outline'>{s}</Badge>
    }
  }

  const renderTypeTargetBadge = (type: string, target: string) => {
    // Lable mapping format: Type - Target
    const typeStr =
      type === 'INCOME'
        ? 'Thu'
        : type === 'OUTCOME'
          ? 'Chi'
          : type === 'DEPOSIT'
            ? 'Cọc'
            : type === 'REFUND'
              ? 'Hoàn'
              : type
    const targetStr = target === 'RESERVATION' ? 'Bàn' : target === 'ORDER' ? 'Đơn hàng' : target

    let colorClass =
      'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700'
    if (type === 'INCOME')
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
    else if (type === 'DEPOSIT')
      colorClass = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
    else if (type === 'OUTCOME' || type === 'REFUND')
      colorClass = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400'

    return (
      <Badge
        variant='outline'
        className={cn('px-2 text-[11px] font-medium tracking-tight whitespace-nowrap', colorClass)}
      >
        {typeStr} &bull; {targetStr}
      </Badge>
    )
  }

  // Reset pagination when filter changes
  useEffect(() => {
    setPage(1)
  }, [search, status, type, target, source, dateFilterType, customStartDate, customEndDate])

  return (
    <div className='bg-background mx-auto flex min-h-screen w-full max-w-[1400px] flex-col p-6 md:p-8'>
      <header className='mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end'>
        <div>
          <h1 className='text-foreground text-3xl font-bold tracking-tight'>Quản lý Thanh Toán</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Theo dõi, đối soát và gỡ lỗi log thanh toán của toàn bộ giao dịch trên hệ thống.
          </p>
        </div>
        {/* Quick Top Stats - based on fetched layout items for simplicity */}
        <div className='bg-primary/5 border-primary/20 flex min-w-[200px] items-center justify-between rounded-lg border px-4 py-3 shadow-sm'>
          <span className='text-primary/80 text-sm font-semibold'>Tìm thấy</span>
          <span className='text-primary text-2xl font-bold'>
            {totalItems} <span className='text-xs font-normal'>GD</span>
          </span>
        </div>
      </header>

      {/* Advanced Filters Block */}
      <div className='bg-card border-border mb-6 flex flex-col gap-4 rounded-xl border p-5 shadow-sm'>
        {/* Search & Action Row */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='relative w-full sm:w-[350px]'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Tra cứu theo mã GD, Ref Code...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='bg-background w-full pl-9 shadow-none'
            />
          </div>
          <Button variant='outline' onClick={() => refetch()} className='shrink-0 gap-2'>
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} /> Tải lại
          </Button>
        </div>

        {/* Categories Dropdowns */}
        <div className='border-border mt-2 grid grid-cols-2 gap-3 border-t pt-4 lg:grid-cols-5 xl:grid-cols-6'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-muted-foreground text-[11px] font-semibold uppercase'>Trạng thái (Status)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className='bg-background border-border rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none'
            >
              <option value=''>Tất cả</option>
              <option value='SUCCESS'>Thành công</option>
              <option value='PENDING'>Đang chờ xử lý</option>
              <option value='FAILED'>Thất bại</option>
              <option value='REFUNDED'>Hoàn tiền</option>
            </select>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-muted-foreground text-[11px] font-semibold uppercase'>Phân loại (Type)</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className='bg-background border-border rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none'
            >
              <option value=''>Tất cả Type</option>
              <option value='INCOME'>Doanh thu (INCOME)</option>
              <option value='DEPOSIT'>Tiền cọc (DEPOSIT)</option>
              <option value='OUTCOME'>Hoàn trả (OUTCOME)</option>
            </select>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-muted-foreground text-[11px] font-semibold uppercase'>Mục tiêu (Target)</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className='bg-background border-border rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none'
            >
              <option value=''>Tất cả Target</option>
              <option value='ORDER'>Đơn gọi món</option>
              <option value='RESERVATION'>Đặt bàn</option>
            </select>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-muted-foreground text-[11px] font-semibold uppercase'>Nguồn (Source)</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className='bg-background border-border rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none'
            >
              <option value=''>Mọi nguồn</option>
              <option value='CASH'>Tiền mặt</option>
              <option value='VNPAY'>VNPAY</option>
              <option value='PAYOS'>PayOS</option>
              <option value='MOMO'>Momo</option>
            </select>
          </div>

          <div className='col-span-2 flex flex-col gap-1.5 lg:col-span-1 xl:col-span-2'>
            <label className='text-muted-foreground text-[11px] font-semibold uppercase'>Khung Thời gian</label>
            <div className='flex flex-wrap items-center gap-2 lg:flex-nowrap'>
              <select
                value={dateFilterType}
                onChange={(e) => setDateFilterType(e.target.value)}
                className='bg-background border-border flex-shrink-0 rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none lg:w-[130px]'
              >
                <option value='ALL'>Mọi lúc</option>
                <option value='TODAY'>Hôm nay</option>
                <option value='YESTERDAY'>Hôm qua</option>
                <option value='CUSTOM'>Tùy chọn</option>
              </select>

              {dateFilterType === 'CUSTOM' && (
                <div className='animate-in fade-in flex items-center gap-1.5'>
                  <Input
                    type='date'
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className='h-[38px] text-sm'
                  />
                  <span className='text-muted-foreground'>-</span>
                  <Input
                    type='date'
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className='h-[38px] text-sm'
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className='bg-card border-border flex-1 overflow-hidden rounded-xl border shadow-sm'>
        <div className='min-h-[400px] overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-border bg-muted/40 border-b text-left text-sm font-semibold'>
                <th className='p-4 pl-6'>Mã GD</th>
                <th className='hidden p-4 md:table-cell'>Ngày Thu</th>
                <th className='p-4'>Phân loại</th>
                <th className='p-4 text-right'>Số tiền</th>
                <th className='hidden p-4 sm:table-cell'>Kênh</th>
                <th className='hidden p-4 lg:table-cell'>Liên kết</th>
                <th className='p-4'>Trạng thái</th>
                <th className='p-4 text-center'>Audit</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className='text-muted-foreground py-16 text-center italic'>
                    Đang tải dữ liệu đường truyền...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className='text-muted-foreground py-16 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <Filter className='text-muted mb-3 h-10 w-10 opacity-20' />
                      <p>Không tìm thấy giao dịch nào phù hợp với bộ lọc ({totalItems})</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p: PaymentDetailResponse) => (
                  <tr
                    key={p.id}
                    className='border-border/50 hover:bg-muted/30 border-b text-sm transition-colors last:border-0'
                  >
                    <td className='p-4 pl-6 font-medium'>
                      <div className='flex flex-col'>
                        <span>#{p.code}</span>
                        {p.transactionCode && (
                          <span className='text-muted-foreground mt-0.5 font-mono text-[11px]' title='Đối tác Ref'>
                            Ref: {p.transactionCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='text-muted-foreground hidden p-4 text-[13px] whitespace-nowrap md:table-cell'>
                      {p.createdAt ? format(new Date(p.createdAt), 'dd MMMM, HH:mm', { locale: vi }) : '-'}
                    </td>
                    <td className='p-4'>{renderTypeTargetBadge(p.type, p.target)}</td>
                    <td className='text-foreground p-4 text-right font-bold tracking-tight'>
                      {formatCurrency(p.amount)}
                    </td>
                    <td className='hidden p-4 sm:table-cell'>
                      <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase'>
                        {p.method === 'CASH' ? 'Tiền mặt' : p.source}
                      </div>
                    </td>
                    <td className='hidden p-4 lg:table-cell'>
                      {p.orderCode && (
                        <div className='bg-secondary text-secondary-foreground inline-block rounded px-2 py-0.5 font-mono text-xs'>
                          ORD: {p.orderCode}
                        </div>
                      )}
                      {p.reservationCode && (
                        <div className='bg-secondary text-secondary-foreground inline-block rounded px-2 py-0.5 font-mono text-xs'>
                          RES: {p.reservationCode}
                        </div>
                      )}
                      {!p.orderCode && !p.reservationCode && <span className='text-muted-foreground'>-</span>}
                    </td>
                    <td className='p-4'>{renderStatusBadge(p.status)}</td>
                    <td className='p-4 text-center'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={cn(
                          'hover:bg-secondary h-8 w-8 rounded-full',
                          p.rawApiData
                            ? 'text-primary ring-primary/20 shadow-sm ring-1'
                            : 'text-muted-foreground opacity-40'
                        )}
                        disabled={!p.rawApiData}
                        title={
                          p.rawApiData ? 'Xem Raw JSON Log từ đối tác' : 'Giao dịch này không có Webhook callback text'
                        }
                        onClick={() => setSelectedRawData(p.rawApiData || null)}
                      >
                        {p.rawApiData ? <Code2 className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Block */}
        {totalPages > 1 && (
          <div className='border-border flex justify-center border-t bg-gray-50/50 p-4'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.max(1, p - 1))
                    }}
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages })
                  .map((_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(page - p) <= 1)
                  .map((p, i, arr) => (
                    <Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          isActive={page === p}
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(p)
                          }}
                          className='cursor-pointer shadow-sm'
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    </Fragment>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) setPage(page + 1)
                    }}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Extracted Audit Log Modal */}
      <RawDataModal data={selectedRawData} onClose={() => setSelectedRawData(null)} />
    </div>
  )
}

export default PaymentManagement
