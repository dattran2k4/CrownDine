'use client'

import * as React from 'react'
import clsx from 'clsx'

export type BadgeVariant =
  | 'default'
  | 'outline'
  | 'success'
  | 'warning'
  | 'danger'

type BadgeProps = {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  className
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
        {
          // default
          'bg-gray-100 text-gray-800 border border-gray-200':
            variant === 'default',

          // outline
          'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 cursor-pointer':
            variant === 'outline',

          // success (AVAILABLE)
          'bg-green-100 text-green-700 border border-green-200':
            variant === 'success',

          // warning (RESERVED)
          'bg-yellow-100 text-yellow-800 border border-yellow-200':
            variant === 'warning',

          // danger (OCCUPIED)
          'bg-red-100 text-red-700 border border-red-200':
            variant === 'danger'
        },
        className
      )}
    >
      {children}
    </span>
  )
}
