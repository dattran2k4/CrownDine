'use client'

import { useState } from 'react'
import type { ReservationHistoryResponse, OrderLineResponse } from '@/types/reservation.type'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Clock, Table, DollarSign, Star, MessageSquare } from 'lucide-react'
import { formatCurrency } from '@/utils/utils'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import feedbackApi from '@/apis/feedback.api'
import paymentApi from '@/apis/payment.api'
import { toast } from 'react-toastify'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface ReservationHistoryProps {
  reservations: ReservationHistoryResponse[]
  isLoading?: boolean
}

const ReservationHistory = ({ reservations, isLoading }: ReservationHistoryProps) => {
  const [expandedId, setExpandedId] = useState<number | string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [currentTarget, setCurrentTarget] = useState<{
    orderId: number
    orderDetailId?: number
    itemName?: string
  } | null>(null)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: {
      rating: number
      comment: string
      orderId: number
      orderDetailId?: number
      itemId?: number
      comboId?: number
    }) => feedbackApi.createFeedback(data),
    onSuccess: () => {
      toast.success('Gửi đánh giá thành công!')
      setIsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['reservation-history'] })
      // Reset state
      setRating(5)
      setComment('')
      setCurrentTarget(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gửi đánh giá thất bại')
    }
  })

  const continuePaymentMutation = useMutation({
    mutationFn: async (reservationCode: string) => {
      const response = await paymentApi.createPayment({
        reservationCode,
        method: 'PAYOS'
      })

      return response.data.data
    },
    onSuccess: (checkoutUrl) => {
      if (!checkoutUrl) {
        toast.error('Không nhận được liên kết thanh toán')
        return
      }

      window.location.href = checkoutUrl
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tạo liên kết thanh toán')
    }
  })

  const handleOpenFeedback = (orderId: number, item?: any) => {
    setCurrentTarget({
      orderId,
      orderDetailId: item?.orderDetailId,
      itemName: item?.name
    })
    setIsModalOpen(true)
  }

  const handleSubmitFeedback = () => {
    if (!currentTarget) return

    const reservation = reservations.find((r) => r.orderId === currentTarget.orderId)
    const item = reservation?.items?.find((i: OrderLineResponse) => i.orderDetailId === currentTarget.orderDetailId)

    mutation.mutate({
      rating,
      comment,
      orderId: currentTarget.orderId,
      orderDetailId: currentTarget.orderDetailId,
      itemId: item?.type === 'ITEM' ? item?.productId : undefined,
      comboId: item?.type === 'COMBO' ? item?.productId : undefined
    })
  }

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 font-bold'
      case 'CANCELLED':
        return 'text-red-600 font-bold'
      default:
        return 'text-primary font-bold'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleContinuePayment = (reservationCode?: string | null) => {
    if (!reservationCode) {
      toast.error('Không tìm thấy mã đặt bàn để tiếp tục thanh toán')
      return
    }

    continuePaymentMutation.mutate(reservationCode)
  }

  if (isLoading) {
    return (
      <div className='bg-card border-border rounded-lg border p-8'>
        <h2 className='mb-8 text-2xl font-bold'>Lịch Sử Đặt Bàn & Đơn Hàng</h2>
        <div className='flex items-center justify-center py-12'>
          <p className='text-foreground/60 animate-pulse'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-card border-border rounded-lg border p-8'>
      {/* Header */}
      <h2 className='mb-8 text-2xl font-bold'>Lịch Sử Đặt Bàn & Đơn Hàng</h2>

      {/* Reservations List */}
      <div className='space-y-4'>
        {reservations.length === 0 ? (
          <div className='py-12 text-center'>
            <p className='text-foreground/60'>Chưa có đặt bàn nào</p>
          </div>
        ) : (
          reservations.map((reservation) => {
            const itemId = reservation.reservationId || `order-${reservation.orderId}`
            const isExpanded = expandedId === itemId

            return (
              <div key={itemId} className='border-border overflow-hidden rounded-lg border'>
                {/* Summary */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : itemId)}
                  className='hover:bg-foreground/5 flex w-full items-center justify-between p-6 transition-colors'
                >
                  <div className='flex flex-1 items-center gap-6'>
                    <div>
                      <h3 className='text-lg font-semibold'>
                        {reservation.reservationId ? (
                          <>
                            {reservation.tableName} • {reservation.guestNumber} Guest
                            {reservation.guestNumber !== 1 ? 's' : ''}
                          </>
                        ) : (
                          <> Khách vãng lai • {reservation.tableName}</>
                        )}
                      </h3>
                      <p className='text-foreground/60 mt-1 text-sm'>
                        {formatDate(reservation.date)} • {reservation.startTime.slice(0, 5)} 
                        {reservation.reservationId && <> - {reservation.endTime.slice(0, 5)}</>}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-4'>
                    {reservation.reservationStatus === 'PENDING' && reservation.reservationCode && (
                      <Button
                        size='sm'
                        onClick={(event) => {
                          event.stopPropagation()
                          handleContinuePayment(reservation.reservationCode)
                        }}
                        disabled={continuePaymentMutation.isPending}
                      >
                        {continuePaymentMutation.isPending ? 'Đang tạo link...' : 'Tiếp tục thanh toán'}
                      </Button>
                    )}
                    <Badge className={getReservationStatusColor(reservation.reservationStatus)}>
                      {reservation.reservationStatus}
                    </Badge>
                    <ChevronDown
                      className={`text-foreground/60 h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Details */}
                {isExpanded && (
                  <div className='border-border/50 bg-foreground/5 border-t p-6'>
                    {/* General Info */}
                    {reservation.reservationId && (
                      <div className='border-border/50 mb-6 border-b pb-6'>
                        <h4 className='mb-3 font-semibold'>Thông Tin Đặt Bàn</h4>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div className='flex items-start gap-2'>
                            <Table className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
                            <div>
                              <p className='text-foreground/60 text-sm'>Bàn</p>
                              <p className='font-medium'>{reservation.tableName}</p>
                            </div>
                          </div>
                          <div className='flex items-start gap-2'>
                            <Clock className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
                            <div>
                              <p className='text-foreground/60 text-sm'>Khung Giờ</p>
                              <p className='font-medium'>
                                {reservation.startTime.slice(0, 5)} - {reservation.endTime.slice(0, 5)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Order Details */}
                    {reservation.orderId ? (
                      <div className='bg-card border-border/50 space-y-4 rounded-lg border p-6'>
                        <div className='flex items-center justify-between'>
                          <h4 className='font-semibold'>Tóm Tắt Đơn Hàng</h4>
                          <div className='flex items-center gap-3'>
                            {reservation.orderStatus === 'COMPLETED' && !reservation.hasGeneralFeedback && (
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8 gap-1.5'
                                onClick={() => handleOpenFeedback(reservation.orderId!)}
                              >
                                <MessageSquare className='h-3.5 w-3.5' />
                                Đánh Giá Đơn Hàng
                              </Button>
                            )}
                            {reservation.hasGeneralFeedback && (
                              <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
                                <Star className='mr-1 h-3 w-3 fill-current' />
                              Đã Đánh Giá
                              </Badge>
                            )}
                            <Badge variant='outline' className={getOrderStatusColor(reservation.orderStatus || '')}>
                              Order #{reservation.orderId} • {reservation.orderStatus}
                            </Badge>
                          </div>
                        </div>

                        {reservation.items && reservation.items.length > 0 && (
                          <div className='border-border/50 space-y-2 border-b border-t py-4'>
                            {reservation.items.map((item: OrderLineResponse, idx: number) => (
                              <div key={idx} className='flex justify-between text-sm'>
                                <div className='flex items-center gap-2'>
                                  <Badge
                                    variant='outline'
                                    className='flex h-5 min-w-[24px] items-center justify-center px-1 py-0 text-[10px]'
                                  >
                                    x{item.quantity}
                                  </Badge>
                                  <span className='font-medium'>{item.name}</span>
                                  {reservation.orderStatus === 'COMPLETED' && !item.hasFeedback && (
                                    <button
                                      onClick={() => handleOpenFeedback(reservation.orderId!, item)}
                                      className='text-primary hover:text-primary/80 ml-2 text-xs font-semibold underline underline-offset-2'
                                    >
                                      Đánh giá món
                                    </button>
                                  )}
                                  {item.hasFeedback && (
                                    <span className='text-green-600 ml-2 text-[10px] italic font-medium'>
                                      (Đã đánh giá)
                                    </span>
                                  )}
                                </div>
                                <span className='text-foreground/80'>{formatCurrency(item.totalPrice)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className='flex items-center justify-between'>
                          <span className='flex items-center gap-2 font-semibold'>
                            <DollarSign className='text-primary h-4 w-4' />
                            Hóa Đơn Cuối
                          </span>
                          <span className='text-primary text-xl font-bold'>
                            {formatCurrency(Number(reservation.finalPrice || 0))}
                          </span>
                        </div>
                        <p className='text-foreground/60 text-center text-xs'>
                          Vui lòng đến quầy thu ngân để xem hóa đơn chi tiết
                        </p>
                      </div>
                    ) : (
                      <div className='bg-card/50 border-border/50 rounded-lg border border-dashed p-6 text-center italic'>
                        <p className='text-foreground/40 text-sm'>Chưa có đơn hàng nào cho lần đặt bàn này</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTarget?.itemName ? `Rate: ${currentTarget.itemName}` : 'Rate your overall experience'}
      >
        <div className='space-y-6'>
          <div className='flex flex-col items-center gap-3 py-4 text-center'>
            <p className='text-foreground/60 text-sm'>
              {currentTarget?.itemName 
                ? `Món ${currentTarget.itemName} có ngon không? Đánh giá của bạn giúp những thực khách khác biết thêm.`
                : 'Trải nghiệm của bạn tại CrownDine hôm nay thế nào?'}
            </p>
            <div className='flex gap-2'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className='hover:scale-110 transition-transform focus:outline-none'
                >
                  <Star
                    className={cn(
                      'h-10 w-10',
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'
                    )}
                  />
                </button>
              ))}
            </div>
            <p className='text-sm font-semibold text-yellow-600 capitalize'>
              {rating === 1 && 'Rất tệ'}
              {rating === 2 && 'Tạmực'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Tốt'}
              {rating === 5 && 'Xuất sắc!'}
            </p>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Nhận xét của bạn (tùy chọn)</label>
            <textarea
              className='border-border bg-foreground/[0.02] focus:ring-primary/20 w-full rounded-lg border p-4 text-sm focus:outline-none focus:ring-2'
              rows={4}
              placeholder='Viết nhận xét...'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <p className='text-foreground/40 text-right text-xs'>{comment.length}/200</p>
          </div>

          <div className='flex gap-3'>
            <Button variant='outline' className='flex-1' onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button className='flex-1' onClick={handleSubmitFeedback} disabled={mutation.isPending}>
              {mutation.isPending ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </Button>
          </div>
          
          <p className='text-foreground/40 mt-4 text-center text-xs italic'>
            * Mỗi món ăn hoặc đơn hàng chỉ được đánh giá một lần.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default ReservationHistory
