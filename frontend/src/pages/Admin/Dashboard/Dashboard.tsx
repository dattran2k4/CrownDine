import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dashboardApi from '@/apis/dashboard.api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts'
import {
  Users,
  CircleDollarSign,
  Utensils,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  History,
  FileDown,
  ChevronDown,
  ChevronUp,
  Check,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Fake data removed, will use data from API

const TimeRangeDropdown = ({
  selected,
  onSelect,
  options
}: {
  selected: string
  onSelect: (val: string) => void
  options: string[]
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-1.5 rounded border border-blue-100/50 bg-blue-50/50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:bg-blue-50'
      >
        {selected}
        {isOpen ? (
          <ChevronUp size={14} className='text-slate-400' />
        ) : (
          <ChevronDown size={14} className='text-slate-400' />
        )}
      </button>

      {isOpen && (
        <>
          <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
          <div className='border-border animate-in fade-in zoom-in absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border bg-white shadow-2xl duration-200'>
            <div className='py-1'>
              {options.map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    onSelect(range)
                    setIsOpen(false)
                  }}
                  className='border-border/10 flex w-full items-center justify-between border-b px-4 py-2.5 text-left text-sm font-bold transition-colors last:border-b-0 hover:bg-blue-50/50'
                >
                  <span className={range === selected ? 'text-blue-600' : 'text-gray-700'}>{range}</span>
                  {range === selected && <Check size={16} className='text-blue-600' strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [revenueTimeRange, setRevenueTimeRange] = useState('Hôm nay')
  const [customerTimeRange, setCustomerTimeRange] = useState('Hôm nay')
  const [topProductsTimeRange, setTopProductsTimeRange] = useState('Hôm nay')
  const [topProductsViewMode, setTopProductsViewMode] = useState<'revenue' | 'quantity'>('revenue')
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)

  const revenueViewMode = revenueTimeRange === 'Hôm nay' || revenueTimeRange === 'Hôm qua' ? 'Theo giờ' : 'Theo ngày'
  const customerViewMode = customerTimeRange === 'Hôm nay' || customerTimeRange === 'Hôm qua' ? 'Theo giờ' : 'Theo ngày'

  const timeRanges = ['Hôm nay', 'Hôm qua', '7 ngày qua', 'Tháng này', 'Tháng trước']

  const { data: revenueResults } = useQuery({
    queryKey: ['dashboard-sales', 'revenue', revenueViewMode, revenueTimeRange],
    queryFn: () => dashboardApi.getSalesResults(revenueViewMode, revenueTimeRange),
    refetchInterval: 15000 // Tự động tải lại sau 15 giây
  })

  const { data: customerResults } = useQuery({
    queryKey: ['dashboard-sales', 'customer', customerViewMode, customerTimeRange],
    queryFn: () => dashboardApi.getSalesResults(customerViewMode, customerTimeRange),
    refetchInterval: 15000
  })

  const { data: topProductsResults } = useQuery({
    queryKey: ['dashboard-sales', 'topProducts', topProductsTimeRange],
    queryFn: () => dashboardApi.getSalesResults('Theo ngày', topProductsTimeRange),
    refetchInterval: 15000
  })

  const summaryResults = revenueResults?.data.data // Base analytics use the revenue range but usually they are for Today anyway
  const revenueData = revenueResults?.data.data
  const customerData = customerResults?.data.data
  const topProductsData = topProductsResults?.data.data

  const displaySalesData =
    revenueData?.revenueChart?.map((item) => ({
      time: item.label,
      value: item.value
    })) || []

  const displayCustomerData =
    customerData?.customerChart?.map((item) => ({
      time: item.label,
      value: item.value
    })) || []

  const displayTopProductsData =
    (topProductsViewMode === 'revenue' ? topProductsData?.topProducts : topProductsData?.topProductsQuantity)?.map(
      (item) => ({
        name: item.label,
        value: item.value
      })
    ) || []

  const displayRecentActivities = summaryResults?.recentActivities || []

  const handleExport = async () => {
    try {
      const response = await dashboardApi.exportSales(revenueTimeRange)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `bao_cao_doanh_thu_${revenueTimeRange.replace(' ', '_')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div className='bg-muted/5 grid min-h-screen grid-cols-1 gap-6 p-6 lg:grid-cols-4'>
      {/* Left Column (Main Content) */}
      <div className='space-y-6 lg:col-span-3'>
        {/* Sales Summary Cards */}
        <Card className='border-none bg-white shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
              Kết quả bán hàng hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='border-border/50 flex items-center gap-4 border-r pr-4 md:last:border-r-0'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
                <CircleDollarSign size={24} />
              </div>
              <div className='space-y-0.5'>
                <p className='text-muted-foreground text-xs font-semibold'>
                  {summaryResults?.completedOrdersToday || 0} đơn đã xong
                </p>
                <div className='flex items-end gap-2'>
                  <div className='text-2xl leading-none font-bold text-blue-500'>
                    {(summaryResults?.completedTotalAmount || 0).toLocaleString('vi-VN')}
                  </div>
                  <div
                    className={`mb-0.5 flex items-center gap-0.5 text-[13px] font-bold ${
                      (summaryResults?.completedGrowthPercentage || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {(summaryResults?.completedGrowthPercentage || 0) >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span>{Math.abs(summaryResults?.completedGrowthPercentage || 0).toFixed(0)}%</span>
                  </div>
                </div>
                <p className='text-muted-foreground mt-1 text-[11px]'>
                  Hôm qua {(summaryResults?.completedOrdersYesterday || 0).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div className='border-border/50 flex items-center gap-4 border-r pr-4 md:last:border-r-0'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600'>
                <Utensils size={24} />
              </div>
              <div className='space-y-0.5'>
                <p className='text-muted-foreground text-xs font-semibold'>
                  {summaryResults?.servingOrdersToday || 0} đơn đang phục vụ
                </p>
                <div className='text-2xl leading-none font-bold text-green-500'>
                  {(summaryResults?.servingTotalAmount || 0).toLocaleString('vi-VN')}
                </div>
                <p className='text-muted-foreground mt-1 text-[11px]'>&nbsp;</p>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-600'>
                <Users size={24} />
              </div>
              <div className='space-y-0.5'>
                <p className='text-muted-foreground text-xs font-semibold'>Khách hàng</p>
                <div className='flex items-end gap-2'>
                  <div className='text-2xl leading-none font-bold text-cyan-500'>
                    {summaryResults?.totalCustomersToday || 0}
                  </div>
                  <div
                    className={`mb-0.5 flex items-center gap-0.5 text-[13px] font-bold ${
                      (summaryResults?.customersGrowthPercentage || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {(summaryResults?.customersGrowthPercentage || 0) >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span>{Math.abs(summaryResults?.customersGrowthPercentage || 0).toFixed(0)}%</span>
                  </div>
                </div>
                <p className='text-muted-foreground mt-1 text-[11px]'>
                  Hôm qua {(summaryResults?.totalCustomersYesterday || 0).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className='overflow-hidden border-none bg-white shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between py-4'>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-foreground text-sm font-semibold tracking-wider uppercase'>
                Doanh số {revenueTimeRange.toLowerCase()}
              </CardTitle>
              <Badge variant='outline' className='border-blue-200 bg-blue-50 font-bold text-blue-600'>
                {(revenueData?.rangeTotalAmount || 0).toLocaleString('vi-VN')}
              </Badge>
            </div>
            <div className='flex items-center gap-4'>
              <TimeRangeDropdown selected={revenueTimeRange} onSelect={setRevenueTimeRange} options={timeRanges} />
            </div>
          </CardHeader>
          <CardContent className='h-[300px] pt-4'>
            <ResponsiveContainer width='100%' height='100%' minWidth={0}>
              <BarChart data={displaySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#E5E7EB' />
                <XAxis dataKey='time' axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(value: number | string) => `${value} tr`}
                />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any) => [`${(Number(value) * 1000000).toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}
                />
                <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                  {displaySalesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill='#0EA5E9' />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Count Chart */}
        <Card className='border-none bg-white shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between py-4'>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-foreground text-sm font-semibold tracking-wider uppercase'>
                Số lượng khách {customerTimeRange.toLowerCase()}
              </CardTitle>
              <Badge variant='outline' className='border-blue-200 bg-blue-50 font-bold text-blue-600'>
                {(customerData?.rangeTotalCustomers || 0).toLocaleString('vi-VN')}
              </Badge>
            </div>
            <TimeRangeDropdown selected={customerTimeRange} onSelect={setCustomerTimeRange} options={timeRanges} />
          </CardHeader>
          <CardContent className='h-[250px] pt-4'>
            <ResponsiveContainer width='100%' height='100%' minWidth={0}>
              <LineChart data={displayCustomerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#E5E7EB' />
                <XAxis
                  dataKey='time'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} khách`, 'Số lượng']}
                />
                <Line
                  type='monotone'
                  dataKey='value'
                  stroke='#0EA5E9'
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#0EA5E9' }}
                  activeDot={{ r: 6, fill: '#0EA5E9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card className='border-none bg-white shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between border-b py-4'>
            <div className='flex items-center gap-6'>
              <CardTitle className='text-foreground text-sm font-semibold tracking-wider uppercase'>
                Top 10 hàng hóa bán chạy {topProductsTimeRange.toLowerCase()}
              </CardTitle>
              <div className='flex items-center gap-4'>
                <div
                  className={`flex cursor-pointer items-center gap-1 text-xs font-bold uppercase transition-colors ${topProductsViewMode === 'revenue' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setTopProductsViewMode('revenue')}
                >
                  Theo doanh thu {topProductsViewMode === 'revenue' && <Check size={12} strokeWidth={3} />}
                </div>
                <div
                  className={`flex cursor-pointer items-center gap-1 text-xs font-bold uppercase transition-colors ${topProductsViewMode === 'quantity' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setTopProductsViewMode('quantity')}
                >
                  Theo số lượng {topProductsViewMode === 'quantity' && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            </div>
            <TimeRangeDropdown
              selected={topProductsTimeRange}
              onSelect={setTopProductsTimeRange}
              options={timeRanges}
            />
          </CardHeader>
          <CardContent className='h-[480px] p-0 pt-8 pb-4'>
            <ResponsiveContainer width='100%' height='100%' minWidth={0}>
              <BarChart
                layout='vertical'
                data={displayTopProductsData}
                margin={{ top: 0, right: 25, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke='#E5E7EB' />
                <XAxis
                  type='number'
                  domain={[0, 'auto']}
                  padding={{ left: 0, right: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF', textAnchor: 'start' }}
                  tickFormatter={(value) => {
                    if (topProductsViewMode === 'quantity') return value.toString()
                    if (value === 0) return '0'
                    if (value < 1) return `${(value * 1000).toFixed(0)}k`
                    return `${value} tr`
                  }}
                />
                <YAxis
                  dataKey='name'
                  type='category'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#4B5563' }}
                  width={140}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any) => {
                    if (topProductsViewMode === 'quantity') {
                      return [`${Number(value).toLocaleString('vi-VN')} món`, 'Số lượng bán']
                    }
                    return [`${(Number(value) * 1000000).toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']
                  }}
                />
                <Bar dataKey='value' fill='#0EA5E9' radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Right Column (Sidebar) */}
      <div className='space-y-6'>
        {/* Export File Widget */}
        <Card
          onClick={handleExport}
          className='group relative flex min-h-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm transition-transform active:scale-95'
        >
          <div className='p-4 text-center'>
            <div className='mb-3 flex justify-center'>
              <div className='rounded-full bg-white/20 p-3 backdrop-blur-md'>
                <FileDown size={32} />
              </div>
            </div>
            <div className='mb-1 text-lg font-bold'>Xuất file báo cáo</div>
            <p className='mb-3 text-[11px] opacity-80'>Tải xuống dữ liệu doanh thu và hàng hóa</p>
            <Badge className='border-none bg-white font-bold text-blue-600 hover:bg-white/90'>XUẤT FILE NGAY</Badge>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className='flex h-[600px] flex-col border-none bg-white shadow-sm'>
          <CardHeader className='sticky top-0 z-10 border-b bg-white py-4'>
            <CardTitle className='text-foreground text-sm font-bold tracking-wider uppercase'>
              Các hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className='flex-1 overflow-y-auto p-0'>
            <div className='divide-border/50 divide-y'>
              {displayRecentActivities.length === 0 ? (
                <div className='flex h-32 items-center justify-center text-sm text-slate-400'>
                  Chưa có hoạt động nào trong khoảng thời gian này
                </div>
              ) : (
                displayRecentActivities.map((activity: any) => (
                  <div key={activity.id} className='hover:bg-muted/5 flex gap-4 p-4 transition-colors'>
                    <div
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        activity.type === 'delete'
                          ? 'bg-red-50 text-red-500'
                          : activity.type === 'import'
                            ? 'bg-green-50 text-green-500'
                            : 'bg-blue-50 text-blue-500'
                      }`}
                    >
                      {activity.type === 'delete' ? (
                         <X size={16} />
                      ) : activity.type === 'import' ? (
                        <History size={16} />
                      ) : (
                        <CircleDollarSign size={16} />
                      )}
                    </div>
                    <div className='space-y-1'>
                      <p className='text-foreground text-xs leading-relaxed'>
                        <span className='font-bold text-blue-600'>{activity.user || 'Nhân viên'}</span> vừa{' '}
                        <span className='text-foreground font-medium'>{activity.action}</span>{' '}
                        {Number(activity.value) > 0 && (
                          <>
                            với giá trị <span className='font-bold'>{Number(activity.value).toLocaleString('vi-VN')} đ</span>
                          </>
                        )}
                      </p>
                      <p className='text-muted-foreground text-[10px]'>{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className='sticky bottom-0 flex justify-center border-t bg-white p-4'>
              <button 
                onClick={() => setIsActivityModalOpen(true)}
                className='flex items-center gap-1 text-[11px] font-bold text-blue-600 uppercase hover:underline'
              >
                Xem thêm <ChevronRight size={14} />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scroll to Top button float (as seen in image) */}
      <div className='fixed right-6 bottom-6 z-50'>
        <button className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-400 text-white shadow-lg transition-colors hover:bg-blue-500'>
          <TrendingUp size={20} className='rotate-[-45deg]' />
        </button>
      </div>

      {/* Activity Details Modal */}
      {isActivityModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'>
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm' onClick={() => setIsActivityModalOpen(false)} />
          <div className='bg-background w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl relative flex flex-col max-h-[85vh]'>
            <div className='border-border flex items-center justify-between border-b px-6 py-4'>
              <h2 className='text-lg font-bold tracking-tight'>Chi tiết hoạt động gần đây</h2>
              <button onClick={() => setIsActivityModalOpen(false)} className='text-muted-foreground hover:text-foreground rounded-full p-2 transition-colors'>
                <X size={20} />
              </button>
            </div>
            
            <div className='flex-1 overflow-auto p-0'>
              <table className='w-full text-left text-sm whitespace-nowrap'>
                <thead className='bg-muted/50 text-muted-foreground sticky top-0 border-b border-border text-xs font-semibold uppercase'>
                  <tr>
                    <th className='px-6 py-4'>Thời gian</th>
                    <th className='px-6 py-4'>Nhân viên</th>
                    <th className='px-6 py-4'>Hành động</th>
                    <th className='px-6 py-4 text-right'>Giá trị (VNĐ)</th>
                    <th className='px-6 py-4'>Lý do</th>
                  </tr>
                </thead>
                <tbody className='divide-border divide-y bg-white'>
                  {summaryResults?.recentActivities?.length ? (
                    summaryResults.recentActivities.map((activity: any) => (
                      <tr key={activity.id} className='hover:bg-muted/30 transition-colors'>
                        <td className='text-foreground px-6 py-4 whitespace-nowrap'>{activity.time}</td>
                        <td className='px-6 py-4'>
                          <span className='font-bold text-blue-600'>{activity.user || 'Nhân viên'}</span>
                        </td>
                        <td className='text-foreground px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${activity.type === 'delete' ? 'bg-red-50 text-red-500' : activity.type === 'import' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                              {activity.type === 'delete' ? <X size={12} /> : activity.type === 'import' ? <History size={12} /> : <CircleDollarSign size={12} />}
                            </div>
                            <span className='font-medium'>{activity.action}</span>
                          </div>
                        </td>
                        <td className='text-foreground px-6 py-4 text-right font-bold'>
                          {Number(activity.value) > 0 ? Number(activity.value).toLocaleString('vi-VN') : '-'}
                        </td>
                        <td className='px-6 py-4 min-w-[200px] whitespace-normal text-xs'>
                          {activity.reason ? (
                            <span className='text-destructive font-semibold'>{activity.reason}</span>
                          ) : (
                            <span className='text-muted-foreground italic'>-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className='text-muted-foreground px-6 py-12 text-center'>
                        Chưa có hoạt động nào trong khoảng thời gian này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
