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
  Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'



const recentActivities = [
  { id: 1, user: 'asldkj', action: 'bán đơn giao hàng', value: '508,000', time: '2 days ago', type: 'sale' },
  { id: 2, user: 'Hương - Kế Toán', action: 'bán đơn hàng', value: '330,000', time: '2 days ago', type: 'sale' },
  { id: 3, user: 'asldkj', action: 'bán đơn hàng', value: '3,290,000', time: '2 days ago', type: 'sale' },
  { id: 4, user: 'Hương - Kế Toán', action: 'nhập hàng', value: '286,500', time: '3 days ago', type: 'import' },
  { id: 5, user: 'asldkj', action: 'nhập hàng', value: '2,847,000', time: '3 days ago', type: 'import' },
  { id: 6, user: 'asldkj', action: 'nhập hàng', value: '285,000', time: '3 days ago', type: 'import' },
  { id: 7, user: 'Hoàng - Kinh Doanh', action: 'bán đơn giao hàng', value: '2,125,000', time: '3 days ago', type: 'sale' },
  { id: 8, user: 'asldkj', action: 'bán đơn hàng', value: '1,495,000', time: '3 days ago', type: 'sale' },
  { id: 9, user: 'Hương - Kế Toán', action: 'bán đơn hàng', value: '1,250,000', time: '3 days ago', type: 'sale' }
]


const TimeRangeDropdown = ({ 
  selected, 
  onSelect, 
  options 
}: { 
  selected: string, 
  onSelect: (val: string) => void, 
  options: string[] 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-blue-600 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50/50 hover:bg-blue-50 transition-all border border-blue-100/50"
      >
        {selected} 
        {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-border shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="py-1">
              {options.map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    onSelect(range)
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-2.5 text-sm font-bold text-left hover:bg-blue-50/50 flex items-center justify-between transition-colors border-b last:border-b-0 border-border/10"
                >
                  <span className={range === selected ? 'text-blue-600' : 'text-gray-700'}>{range}</span>
                  {range === selected && <Check size={16} className="text-blue-600" strokeWidth={3} />}
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

  const revenueViewMode = (revenueTimeRange === 'Hôm nay' || revenueTimeRange === 'Hôm qua') ? 'Theo giờ' : 'Theo ngày'
  const customerViewMode = (customerTimeRange === 'Hôm nay' || customerTimeRange === 'Hôm qua') ? 'Theo giờ' : 'Theo ngày'

  const timeRanges = ['Hôm nay', 'Hôm qua', '7 ngày qua', 'Tháng này', 'Tháng trước']


  const { data: revenueResults } = useQuery({
    queryKey: ['dashboard-sales', 'revenue', revenueViewMode, revenueTimeRange],
    queryFn: () => dashboardApi.getSalesResults(revenueViewMode, revenueTimeRange)
  })

  const { data: customerResults } = useQuery({
    queryKey: ['dashboard-sales', 'customer', customerViewMode, customerTimeRange],
    queryFn: () => dashboardApi.getSalesResults(customerViewMode, customerTimeRange)
  })

  const { data: topProductsResults } = useQuery({
    queryKey: ['dashboard-sales', 'topProducts', topProductsTimeRange],
    queryFn: () => dashboardApi.getSalesResults('Theo ngày', topProductsTimeRange)
  })

  const summaryResults = revenueResults?.data.data // Base analytics use the revenue range but usually they are for Today anyway
  const revenueData = revenueResults?.data.data
  const customerData = customerResults?.data.data
  const topProductsData = topProductsResults?.data.data

  const displaySalesData = revenueData?.revenueChart?.map(item => ({
    time: item.label,
    value: item.value
  })) || []

  const displayCustomerData = customerData?.customerChart?.map(item => ({
    time: item.label,
    value: item.value
  })) || []

  const displayTopProductsData = topProductsData?.topProducts?.map(item => ({
    name: item.label,
    value: item.value
  })) || []

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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 bg-muted/5 min-h-screen">
      {/* Left Column (Main Content) */}
      <div className="lg:col-span-3 space-y-6">
        {/* Sales Summary Cards */}
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Kết quả bán hàng hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 border-r md:last:border-r-0 border-border/50 pr-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <CircleDollarSign size={24} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-muted-foreground">{summaryResults?.completedOrdersToday || 0} đơn đã xong</p>
                <div className="flex items-end gap-2">
                  <div className="text-blue-500 font-bold text-2xl leading-none">
                    {(summaryResults?.completedTotalAmount || 0).toLocaleString('vi-VN')}
                  </div>
                  <div className={`flex items-center gap-0.5 text-[13px] font-bold mb-0.5 ${(summaryResults?.completedGrowthPercentage || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {(summaryResults?.completedGrowthPercentage || 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(summaryResults?.completedGrowthPercentage || 0).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Hôm qua {(summaryResults?.completedOrdersYesterday || 0).toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-r md:last:border-r-0 border-border/50 pr-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Utensils size={24} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-muted-foreground">{summaryResults?.servingOrdersToday || 0} đơn đang phục vụ</p>
                <div className="text-green-500 font-bold text-2xl leading-none">
                  {(summaryResults?.servingTotalAmount || 0).toLocaleString('vi-VN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">&nbsp;</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                <Users size={24} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-muted-foreground">Khách hàng</p>
                <div className="flex items-end gap-2">
                  <div className="text-cyan-500 font-bold text-2xl leading-none">
                    {summaryResults?.totalCustomersToday || 0}
                  </div>
                  <div className={`flex items-center gap-0.5 text-[13px] font-bold mb-0.5 ${(summaryResults?.customersGrowthPercentage || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {(summaryResults?.customersGrowthPercentage || 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(summaryResults?.customersGrowthPercentage || 0).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Hôm qua {(summaryResults?.totalCustomersYesterday || 0).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="shadow-sm border-none bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Doanh số {revenueTimeRange.toLowerCase()}
              </CardTitle>
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 font-bold">
                {(revenueData?.rangeTotalAmount || 0).toLocaleString('vi-VN')}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <TimeRangeDropdown 
                selected={revenueTimeRange} 
                onSelect={setRevenueTimeRange} 
                options={timeRanges} 
              />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={displaySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                />
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
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {displaySalesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#0EA5E9" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Count Chart */}
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Số lượng khách {customerTimeRange.toLowerCase()}
              </CardTitle>
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 font-bold">
                {(customerData?.rangeTotalCustomers || 0).toLocaleString('vi-VN')}
              </Badge>
            </div>
            <TimeRangeDropdown 
              selected={customerTimeRange} 
              onSelect={setCustomerTimeRange} 
              options={timeRanges} 
            />
          </CardHeader>
          <CardContent className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={displayCustomerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="time"
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
                  type="monotone"
                  dataKey="value"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#0EA5E9' }}
                  activeDot={{ r: 6, fill: '#0EA5E9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
            <div className="flex items-center gap-6">
              <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Top 10 hàng hóa bán chạy {topProductsTimeRange.toLowerCase()}
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-blue-600 font-bold uppercase cursor-pointer">
                Theo doanh thu <ChevronRight size={14} />
              </div>
            </div>
            <TimeRangeDropdown 
              selected={topProductsTimeRange} 
              onSelect={setTopProductsTimeRange} 
              options={timeRanges} 
            />
          </CardHeader>
          <CardContent className="h-[480px] p-0 pt-8 pb-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart layout="vertical" data={displayTopProductsData} margin={{ top: 0, right: 25, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis 
                  type="number" 
                  domain={[0, 'auto']}
                  padding={{ left: 0, right: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF', textAnchor: 'start' }}
                  tickFormatter={(value) => {
                    if (value === 0) return '0'
                    if (value < 1) return `${(value * 1000).toFixed(0)}k`
                    return `${value} tr`
                  }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
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
                  formatter={(value: any) => [`${(Number(value) * 1000000).toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}
                />
                <Bar dataKey="value" fill="#0EA5E9" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Right Column (Sidebar) */}
      <div className="space-y-6">
        {/* Export File Widget */}
        <Card 
          onClick={handleExport}
          className="rounded-xl overflow-hidden shadow-sm relative group cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 border-none min-h-[140px] flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <div className="text-center p-4">
            <div className="mb-3 flex justify-center">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-md">
                <FileDown size={32} />
              </div>
            </div>
            <div className="text-lg font-bold mb-1">Xuất file báo cáo</div>
            <p className="text-[11px] opacity-80 mb-3">Tải xuống dữ liệu doanh thu và hàng hóa</p>
            <Badge className="bg-white text-blue-600 hover:bg-white/90 border-none font-bold">
              XUẤT FILE NGAY
            </Badge>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="shadow-sm border-none bg-white flex flex-col h-[600px]">
          <CardHeader className="py-4 border-b sticky top-0 bg-white z-10">
            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Các hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="divide-y divide-border/50">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 flex gap-4 hover:bg-muted/5 transition-colors">
                  <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'sale' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'
                    }`}>
                    {activity.type === 'sale' ? <CircleDollarSign size={16} /> : <History size={16} />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-foreground leading-relaxed">
                      <span className="font-bold text-blue-600">{activity.user}</span> vừa {' '}
                      <span className="font-medium text-foreground">{activity.action}</span> {' '}
                      với giá trị <span className="font-bold">{activity.value}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 flex justify-center sticky bottom-0 bg-white border-t">
              <button className="text-[11px] text-blue-600 font-bold uppercase flex items-center gap-1 hover:underline">
                Xem thêm <ChevronRight size={14} />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scroll to Top button float (as seen in image) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center shadow-lg hover:bg-blue-500 transition-colors">
          <TrendingUp size={20} className="rotate-[-45deg]" />
        </button>
      </div>
    </div>
  )
}
