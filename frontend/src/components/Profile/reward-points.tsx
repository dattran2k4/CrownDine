import { useState } from 'react'
import { Gift, Award, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User, PointHistory } from '@/types/profile.type'
import voucherApi from '@/apis/voucher.api'
import userApi from '@/apis/user.api'
import { toast } from 'sonner'
import type { Voucher } from '@/types/voucher.type'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

interface RewardPointsProps {
  user: User
  onUpdateUser: (user: User) => void
}

const RewardPointsTab = ({ user, onUpdateUser }: RewardPointsProps) => {
  const queryClient = useQueryClient()
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [historyPage, setHistoryPage] = useState(1)

  // Fetch all vouchers from the system
  const { data: vouchersData, isLoading } = useQuery({
    queryKey: ['reward-vouchers'],
    queryFn: () => voucherApi.getVouchers({ size: 100 }),
  })

  // Fetch user's point history with pagination
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['point-history', historyPage],
    queryFn: () => userApi.getPointHistory(historyPage, 5),
  })

  const vouchers = vouchersData?.data?.data?.data || []
  const pointHistoryPage = historyData?.data?.data
  const pointHistory = pointHistoryPage?.data || []
  const historyTotalPages = pointHistoryPage?.totalPages || 1
  
  // Lọc ra các voucher là reward (có pointsRequired > 0)
  const rewardVouchers = vouchers.filter((v: Voucher) => v.pointsRequired && v.pointsRequired > 0)

  // Sắp xếp các voucher phổ biến/rẻ nhất lên trước
  rewardVouchers.sort((a: Voucher, b: Voucher) => (a.pointsRequired || 0) - (b.pointsRequired || 0))

  const exchangeMutation = useMutation({
    mutationFn: (voucherId: number) => voucherApi.exchangeVoucher(voucherId),
    onSuccess: (_, voucherId) => {
      toast.success('Đổi voucher thành công!')
      
      // Update local user points immediately
      const exchangedVoucher = rewardVouchers.find((v: Voucher) => v.id === voucherId)
      if (exchangedVoucher && user.rewardPoints !== undefined) {
        onUpdateUser({
          ...user,
          rewardPoints: user.rewardPoints - (exchangedVoucher.pointsRequired || 0)
        })
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['my-vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setSelectedVoucher(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đổi voucher thất bại. Vui lòng thử lại!')
    }
  })

  const handleExchange = (voucher: Voucher) => {
    if ((user.rewardPoints || 0) < (voucher.pointsRequired || 0)) {
      toast.error('Bạn không đủ điểm để đổi voucher này!')
      return
    }
    
    setSelectedVoucher(voucher)
  }

  const confirmExchange = () => {
    if (selectedVoucher) {
      exchangeMutation.mutate(selectedVoucher.id)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='bg-primary/10 rounded-lg p-6 flex items-center justify-between border border-primary/20'>
        <div>
          <h2 className='text-2xl font-bold flex items-center gap-2 text-primary'>
            <Award className='w-6 h-6' />
            Điểm Thuởng Của Bạn
          </h2>
          <p className='text-foreground/70 mt-1'>
            Dùng điểm thưởng để đổi lấy các siêu deal hấp dẫn từ CrownDine!
          </p>
        </div>
        <div className='text-right'>
          <span className='block text-4xl font-black text-primary'>{user.rewardPoints || 0}</span>
          <span className='text-sm text-foreground/60 font-medium uppercase'>Điểm</span>
        </div>
      </div>

      <div>
        <h3 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Gift className='w-5 h-5 text-primary' />
          Danh sách Quà Tặng
        </h3>
        
        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-32 bg-secondary rounded-lg animate-pulse'></div>
            ))}
          </div>
        ) : rewardVouchers.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-left'>
            {rewardVouchers.map((voucher: Voucher) => {
              const pts = voucher.pointsRequired || 0
              const canAfford = (user.rewardPoints || 0) >= pts

              return (
                <div 
                  key={voucher.id} 
                  className={`border rounded-lg p-5 flex flex-col justify-between transition border-border hover:border-primary/50 bg-card shadow-sm`}
                >
                  <div>
                    <div className='flex justify-between items-start mb-2'>
                      <h4 className='font-bold text-lg leading-tight'>{voucher.name}</h4>
                      <span className='bg-primary/20 text-primary font-bold px-2 py-1 rounded text-sm whitespace-nowrap'>
                        {pts} Điểm
                      </span>
                    </div>
                    <p className='text-xs text-primary/80 mt-1 font-medium'>
                      HSD: 1 tháng kể từ ngày đổi
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => handleExchange(voucher)}
                    disabled={!canAfford || (exchangeMutation.isPending && selectedVoucher?.id === voucher.id)}
                    variant="default"
                    className={`mt-4 w-full ${!canAfford ? 'bg-muted text-muted-foreground hover:bg-muted' : ''}`}
                  >
                    {exchangeMutation.isPending && selectedVoucher?.id === voucher.id ? 'Đang Đổi...' : (canAfford ? 'Đổi Ngay' : 'Không Đủ Điểm')}
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='text-center py-12 border rounded-lg bg-card/50'>
            <Gift className='w-12 h-12 text-foreground/20 mx-auto mb-3' />
            <p className='text-foreground/60'>Hiện chưa có voucher đổi điểm nào.</p>
          </div>
        )}
      </div>

      {/* Point History Section */}
      <div className='mt-10 border-t pt-8'>
        <h3 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Clock className='w-5 h-5 text-primary' />
          Lịch sử Tích / Tiêu điểm
        </h3>

        {isHistoryLoading ? (
          <div className='space-y-3'>
            {[1, 2, 3].map(i => <div key={i} className='h-12 bg-secondary rounded-lg animate-pulse'></div>)}
          </div>
        ) : pointHistory.length > 0 ? (
          <div className='bg-card border rounded-lg overflow-hidden'>
            <div className='divide-y divide-border'>
              {pointHistory.map((history: PointHistory) => {
                const isEarn = history.pointsChanged > 0
                return (
                  <div key={history.id} className='p-4 flex items-center justify-between hover:bg-secondary/20 transition'>
                    <div className='flex items-center gap-4'>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEarn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isEarn ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className='font-semibold'>
                          {history.reason === 'EARN_FROM_ORDER' ? 'Tích điểm từ hóa đơn' : 
                           history.reason === 'SPEND_ON_VOUCHER' ? 'Đổi điểm lấy quà' : 'Điều chỉnh điểm'}
                        </p>
                        <p className='text-sm text-foreground/60'>
                          {new Date(history.createdAt + 'Z').toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold text-lg ${isEarn ? 'text-green-600' : 'text-red-600'}`}>
                      {isEarn ? '+' : ''}{history.pointsChanged}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Pagination Controls */}
            {historyTotalPages > 1 && (
              <div className='p-4 border-t border-border bg-secondary/5'>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                        className={historyPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {[...Array(historyTotalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          isActive={historyPage === i + 1}
                          onClick={() => setHistoryPage(i + 1)}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))}
                        className={historyPage >= historyTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        ) : (
          <div className='text-center py-8 border rounded-lg bg-card/50'>
            <p className='text-foreground/60'>Bạn chưa có lịch sử tích điểm nào.</p>
          </div>
        )}
      </div>

      {/* Exchange Confirmation Modal */}
      <Modal 
        isOpen={!!selectedVoucher} 
        onClose={() => setSelectedVoucher(null)} 
        title="Xác nhận đổi phần thưởng"
      >
        <div className="space-y-4">
          <p className="text-foreground/80 leading-relaxed">
            Bạn có chắc chắn muốn dùng <strong className="text-primary">{selectedVoucher?.pointsRequired} điểm</strong> để đổi phần thưởng <strong>{selectedVoucher?.name}</strong> không?
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setSelectedVoucher(null)} disabled={exchangeMutation.isPending}>
              Hủy bỏ
            </Button>
            <Button 
              onClick={confirmExchange}
              disabled={exchangeMutation.isPending}
            >
              {exchangeMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Đổi'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RewardPointsTab
