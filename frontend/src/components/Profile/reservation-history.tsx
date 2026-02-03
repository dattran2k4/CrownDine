'use client'

import { useState } from 'react'
import type { Reservation } from '@/types/profile.type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, Clock, Users, DollarSign } from 'lucide-react'

interface ReservationHistoryProps {
  reservations: Reservation[]
}

const ReservationHistory = ({ reservations }: ReservationHistoryProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  return (
    <div className='bg-card border-border rounded-lg border p-8'>
      {/* Header */}
      <h2 className='mb-8 text-2xl font-bold'>Reservation History</h2>

      {/* Reservations List */}
      <div className='space-y-4'>
        {reservations.length === 0 ? (
          <div className='py-12 text-center'>
            <p className='text-foreground/60'>No reservations yet</p>
          </div>
        ) : (
          reservations.map((reservation) => {
            const isExpanded = expandedId === reservation.id

            return (
              <div key={reservation.id} className='border-border overflow-hidden rounded-lg border'>
                {/* Summary */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : reservation.id)}
                  className='hover:bg-foreground/5 flex w-full items-center justify-between p-6 transition-colors'
                >
                  <div className='flex flex-1 items-center gap-6'>
                    <div>
                      <h3 className='text-lg font-semibold'>
                        Table {reservation.table.tableNumber} • {reservation.guestNumber} Guest
                        {reservation.guestNumber !== 1 ? 's' : ''}
                      </h3>
                      <p className='text-foreground/60 mt-1 text-sm'>
                        {formatDate(reservation.date)} at {reservation.startTime}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-4'>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </Badge>
                    <ChevronDown
                      className={`text-foreground/60 h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Details */}
                {isExpanded && (
                  <div className='border-border/50 bg-foreground/5 border-t p-6'>
                    {/* Restaurant Info */}
                    <div className='border-border/50 mb-6 border-b pb-6'>
                      <h4 className='mb-3 font-semibold'>Restaurant Information</h4>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='flex items-start gap-2'>
                          <Users className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
                          <div>
                            <p className='text-foreground/60 text-sm'>Location</p>
                            <p className='font-medium'>{reservation.table.location}</p>
                          </div>
                        </div>
                        <div className='flex items-start gap-2'>
                          <Clock className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
                          <div>
                            <p className='text-foreground/60 text-sm'>Duration</p>
                            <p className='font-medium'>
                              {reservation.startTime} - {reservation.endTime}
                            </p>
                          </div>
                        </div>
                      </div>
                      {reservation.note && (
                        <div className='mt-4'>
                          <p className='text-foreground/60 text-sm'>Special Notes</p>
                          <p className='text-foreground font-medium'>{reservation.note}</p>
                        </div>
                      )}
                    </div>

                    {/* Order Details */}
                    {reservation.order ? (
                      <div className='border-border/50 mb-6 border-b pb-6'>
                        <h4 className='mb-4 font-semibold'>Order Details</h4>
                        <div className='space-y-3'>
                          {reservation.order.items.map((item) => (
                            <div
                              key={item.id}
                              className='bg-card border-border/50 flex items-center justify-between rounded-lg border p-3'
                            >
                              <div className='flex-1'>
                                <p className='font-medium'>{item.menuItemName}</p>
                                <p className='text-foreground/60 text-sm'>
                                  ${item.price} × {item.quantity}
                                </p>
                              </div>
                              <p className='text-primary font-semibold'>${item.subtotal.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>

                        {/* Order Notes */}
                        {reservation.order.notes && (
                          <div className='mt-4'>
                            <p className='text-foreground/60 text-sm'>Order Notes</p>
                            <p className='text-foreground font-medium'>{reservation.order.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Price Summary */}
                    {reservation.order && (
                      <div className='bg-card border-border/50 space-y-2 rounded-lg border p-4'>
                        <div className='flex items-center justify-between'>
                          <span className='text-foreground/60'>Subtotal</span>
                          <span className='font-medium'>${reservation.order.subtotal.toFixed(2)}</span>
                        </div>
                        {reservation.order.discount > 0 && (
                          <div className='text-primary flex items-center justify-between'>
                            <span className='text-foreground/60'>Discount</span>
                            <span className='font-medium'>-${reservation.order.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className='flex items-center justify-between'>
                          <span className='text-foreground/60'>Tax</span>
                          <span className='font-medium'>${reservation.order.tax.toFixed(2)}</span>
                        </div>
                        <div className='border-border/50 flex items-center justify-between border-t pt-2'>
                          <span className='flex items-center gap-2 font-semibold'>
                            <DollarSign className='text-primary h-4 w-4' />
                            Total
                          </span>
                          <span className='text-primary text-lg font-bold'>${reservation.order.total.toFixed(2)}</span>
                        </div>
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
