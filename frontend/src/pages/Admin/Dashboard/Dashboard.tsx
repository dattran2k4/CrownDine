import { useState, useEffect } from 'react'
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
  const [revenueViewMode, setRevenueViewMode] = useState('Theo giờ')
  const [revenueTimeRange, setRevenueTimeRange] = useState('7 ngày qua')
  const [customerTimeRange, setCustomerTimeRange] = useState('Tháng này')
  const [topProductsTimeRange, setTopProductsTimeRange] = useState('7 ngày qua')

  const timeRanges = ['Hôm nay', 'Hôm qua', '7 ngày qua', 'Tháng này', 'Tháng trước']

  useEffect(() => {
    if ((revenueTimeRange === 'Hôm nay' || revenueTimeRange === 'Hôm qua') && revenueViewMode !== 'Theo giờ') {
      setRevenueViewMode('Theo giờ')
    }
  }, [revenueTimeRange, revenueViewMode])

  const { data: salesResults } = useQuery({
    queryKey: ['dashboard-sales', revenueViewMode, revenueTimeRange],
    queryFn: () => dashboardApi.getSalesResults(revenueViewMode, revenueTimeRange)
  })

  const results = salesResults?.data.data

  const displaySalesData = results?.revenueChart?.map(item => ({
    time: item.label,
    value: item.value
  })) || []

  const displayCustomerData = results?.customerChart?.map(item => ({
    time: item.label,
    value: item.value
  })) || []

  const displayTopProductsData = results?.topProducts?.map(item => ({
    name: item.label,
    value: item.value
  })) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-1 bg-muted/5 min-h-screen">
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
                <p className="text-xs font-semibold text-muted-foreground">{results?.completedOrdersToday || 0} đơn đã xong</p>
                <div className="flex items-end gap-2">
                  <div className="text-blue-500 font-bold text-2xl leading-none">
                    {(results?.completedTotalAmount || 0).toLocaleString('vi-VN')}
                  </div>
                  <div className={`flex items-center gap-0.5 text-[13px] font-bold mb-0.5 ${
                    (results?.completedGrowthPercentage || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(results?.completedGrowthPercentage || 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(results?.completedGrowthPercentage || 0).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Hôm qua {(results?.completedOrdersYesterday || 0).toLocaleString('vi-VN')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-r md:last:border-r-0 border-border/50 pr-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Utensils size={24} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-muted-foreground">{results?.servingOrdersToday || 0} đơn đang phục vụ</p>
                <div className="text-green-500 font-bold text-2xl leading-none">
                  {(results?.servingTotalAmount || 0).toLocaleString('vi-VN')}
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
                    {results?.totalCustomersToday || 0}
                  </div>
                  <div className={`flex items-center gap-0.5 text-[13px] font-bold mb-0.5 ${
                    (results?.customersGrowthPercentage || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(results?.customersGrowthPercentage || 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(results?.customersGrowthPercentage || 0).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Hôm qua {(results?.totalCustomersYesterday || 0).toLocaleString('vi-VN')}</p>
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
                {(results?.rangeTotalAmount || 0).toLocaleString('vi-VN')}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-muted/30 rounded-full p-1 border">
                {['Theo ngày', 'Theo giờ', 'Theo thứ']
                  .filter((tab) => {
                    if (revenueTimeRange === 'Hôm nay' || revenueTimeRange === 'Hôm qua') {
                      return tab === 'Theo giờ'
                    }
                    return true
                  })
                  .map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setRevenueViewMode(tab)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                        tab === revenueViewMode 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
              </div>
              
              <TimeRangeDropdown 
                selected={revenueTimeRange} 
                onSelect={setRevenueTimeRange} 
                options={timeRanges} 
              />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
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
                  tickFormatter={(value) => `${value} tr`}
                />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
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
                102
              </Badge>
            </div>
            <TimeRangeDropdown 
              selected={customerTimeRange} 
              onSelect={setCustomerTimeRange} 
              options={timeRanges} 
            />
          </CardHeader>
          <CardContent className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayCustomerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6B7280' }} 
                  interval={1}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
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
          <CardContent className="h-[400px] pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={displayTopProductsData} margin={{ top: 0, right: 30, left: 150, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#4B5563' }}
                  width={150}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Bar dataKey="value" fill="#0EA5E9" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-8 mt-2 overflow-x-auto pb-2">
               {['0', '500k', '1 tr', '1.5 tr', '2 tr', '2.5 tr', '3 tr', '3.5 tr', '4 tr', '4.5 tr', '5 tr'].map((val, idx) => (
                 <span key={idx} className="text-[9px] text-muted-foreground">{val}</span>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column (Sidebar) */}
      <div className="space-y-6">
        {/* Export File Widget */}
        <Card className="rounded-xl overflow-hidden shadow-sm relative group cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 border-none min-h-[140px] flex items-center justify-center text-white">
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
                  <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    activity.type === 'sale' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'
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
