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
      toast.success('Feedback sent successfully!')
      setIsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['reservation-history'] })
      // Reset state
      setRating(5)
      setComment('')
      setCurrentTarget(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send feedback')
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

  if (isLoading) {
    return (
      <div className='bg-card border-border rounded-lg border p-8'>
        <h2 className='mb-8 text-2xl font-bold'>Order & Reservation History</h2>
        <div className='flex items-center justify-center py-12'>
          <p className='text-foreground/60 animate-pulse'>Loading your history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-card border-border rounded-lg border p-8'>
      {/* Header */}
      <h2 className='mb-8 text-2xl font-bold'>Order & Reservation History</h2>

      {/* Reservations List */}
      <div className='space-y-4'>
        {reservations.length === 0 ? (
          <div className='py-12 text-center'>
            <p className='text-foreground/60'>No reservations yet</p>
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
                          <>Walk-in Order • {reservation.tableName}</>
                        )}
                      </h3>
                      <p className='text-foreground/60 mt-1 text-sm'>
                        {formatDate(reservation.date)} • {reservation.startTime.slice(0, 5)} 
                        {reservation.reservationId && <> - {reservation.endTime.slice(0, 5)}</>}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-4'>
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
                        <h4 className='mb-3 font-semibold'>Reservation Information</h4>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div className='flex items-start gap-2'>
                            <Table className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
                            <div>
                              <p className='text-foreground/60 text-sm'>Table</p>
                              <p className='font-medium'>{reservation.tableName}</p>
                            </div>
                          </div>
                          <div className='flex items-start gap-2'>
                            <Clock className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
                            <div>
                              <p className='text-foreground/60 text-sm'>Time Slot</p>
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
                          <h4 className='font-semibold'>Order Summary</h4>
                          <div className='flex items-center gap-3'>
                            {reservation.orderStatus === 'COMPLETED' && !reservation.hasFeedback && (
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8 gap-1.5'
                                onClick={() => handleOpenFeedback(reservation.orderId!)}
                              >
                                <MessageSquare className='h-3.5 w-3.5' />
                                Feedback Order
                              </Button>
                            )}
                            {reservation.hasFeedback && (
                              <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
                                Reviewed
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
                                  {reservation.orderStatus === 'COMPLETED' && !reservation.hasFeedback && (
                                    <button
                                      onClick={() => handleOpenFeedback(reservation.orderId!, item)}
                                      className='text-primary hover:text-primary/80 ml-2 text-xs font-semibold'
                                    >
                                      Rate dish
                                    </button>
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
                            Final Bill
                          </span>
                          <span className='text-primary text-xl font-bold'>
                            {formatCurrency(Number(reservation.finalPrice || 0))}
                          </span>
                        </div>
                        <p className='text-foreground/60 text-center text-xs'>
                          Visit the counter to see full invoice details
                        </p>
                      </div>
                    ) : (
                      <div className='bg-card/50 border-border/50 rounded-lg border border-dashed p-6 text-center italic'>
                        <p className='text-foreground/40 text-sm'>No order created for this reservation yet</p>
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
                ? `How was the ${currentTarget.itemName}? Your feedback helps other food lovers.`
                : 'How was your experience with CrownDine?'}
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
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent!'}
            </p>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Your comment (optional)</label>
            <textarea
              className='border-border bg-foreground/[0.02] focus:ring-primary/20 w-full rounded-lg border p-4 text-sm focus:outline-none focus:ring-2'
              rows={4}
              placeholder='Add a comment...'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <p className='text-foreground/40 text-right text-xs'>{comment.length}/200</p>
          </div>

          <div className='flex gap-3'>
            <Button variant='outline' className='flex-1' onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className='flex-1' onClick={handleSubmitFeedback} disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
          
          <p className='text-foreground/40 mt-4 text-center text-xs'>
            * Each order can only be reviewed once. Once submitted, you cannot change your rating.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default ReservationHistory
