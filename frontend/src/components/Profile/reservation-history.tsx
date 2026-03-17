'use client'

import { useState } from 'react'
import type { ReservationHistoryResponse } from '@/types/reservation.type'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Clock, Table, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/utils'

interface ReservationHistoryProps {
  reservations: ReservationHistoryResponse[]
  isLoading?: boolean
}

const ReservationHistory = ({ reservations, isLoading }: ReservationHistoryProps) => {
  const [expandedId, setExpandedId] = useState<number | string | null>(null)

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
                          <Badge variant='outline' className={getOrderStatusColor(reservation.orderStatus || '')}>
                            Order #{reservation.orderId} • {reservation.orderStatus}
                          </Badge>
                        </div>

                        {reservation.items && reservation.items.length > 0 && (
                          <div className='border-border/50 space-y-2 border-b border-t py-4'>
                            {reservation.items.map((item, idx) => (
                              <div key={idx} className='flex justify-between text-sm'>
                                <div className='flex items-center gap-2'>
                                  <Badge
                                    variant='outline'
                                    className='flex h-5 min-w-[24px] items-center justify-center px-1 py-0 text-[10px]'
                                  >
                                    x{item.quantity}
                                  </Badge>
                                  <span className='font-medium'>{item.name}</span>
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
    </div>
  )
}

export default ReservationHistory
