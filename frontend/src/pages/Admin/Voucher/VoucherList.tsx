import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { VoucherForm } from '@/components/form/voucher-form'
import { VoucherToolbar } from './components/VoucherToolbar'
import { VoucherTable } from './components/VoucherTable'
import { AssignUsersModal } from './components/AssignUsersModal'
import voucherApi from '@/apis/voucher.api'
import type { Voucher } from '@/types/voucher.type'
import type { VoucherFormData } from '@/types/voucher.type'
import type { VoucherType } from '@/types/voucher.type'

const PAGE_SIZE = 10

export default function VoucherList() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<VoucherType | ''>('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [assignVoucher, setAssignVoucher] = useState<Voucher | null>(null)

  const { data: vouchersResponse, isLoading } = useQuery({
    queryKey: ['vouchers', searchTerm, typeFilter, page],
    queryFn: () =>
      voucherApi.getVouchers({
        search: searchTerm.trim() || undefined,
        type: typeFilter || undefined,
        page,
        size: PAGE_SIZE
      })
  })

  const pageData = vouchersResponse?.data?.data
  const vouchers = pageData?.data ?? []
  const totalPages = pageData?.totalPages ?? 0
  const totalItems = pageData?.totalItems ?? 0

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string
      code: string
      type: 'PERCENTAGE' | 'FIXED_AMOUNT'
      discountValue: number
      maxDiscountValue?: number | null
      description?: string | null
    }) => voucherApi.createVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      toast.success('Tạo voucher thành công')
      setIsModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: {
        name: string
        code: string
        type: 'PERCENTAGE' | 'FIXED_AMOUNT'
        discountValue: number
        maxDiscountValue?: number | null
        description?: string | null
      }
    }) => voucherApi.updateVoucher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      toast.success('Cập nhật voucher thành công')
      setIsModalOpen(false)
    }
  })

  const assignMutation = useMutation({
    mutationFn: ({
      voucherId,
      userIds,
      usageLimit,
      expiredAt
    }: {
      voucherId: number
      userIds: number[]
      usageLimit: number
      expiredAt: string
    }) => voucherApi.assignUsers(voucherId, { userIds, usageLimit, expiredAt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      toast.success('Gán voucher cho khách hàng thành công')
      setAssignVoucher(null)
    }
  })

  const handleCreate = () => {
    setEditingVoucher(null)
    setIsModalOpen(true)
  }

  const handleEdit = (e: React.MouseEvent, voucher: Voucher) => {
    e.stopPropagation()
    setEditingVoucher(voucher)
    setIsModalOpen(true)
  }

  const handleAssign = (e: React.MouseEvent, voucher: Voucher) => {
    e.stopPropagation()
    setAssignVoucher(voucher)
  }

  const handleSaveVoucher = (data: VoucherFormData) => {
    const discountValue = parseFloat(data.discountValue)
    if (Number.isNaN(discountValue) || discountValue <= 0) return
    const maxDiscountValue = data.maxDiscountValue.trim()
      ? parseFloat(data.maxDiscountValue)
      : undefined
    if (maxDiscountValue !== undefined && (Number.isNaN(maxDiscountValue) || maxDiscountValue <= 0))
      return

    const payload = {
      name: data.name.trim(),
      code: data.code.trim(),
      type: data.type,
      discountValue,
      maxDiscountValue: maxDiscountValue ?? null,
      description: data.description?.trim() || null
    }

    if (editingVoucher) {
      updateMutation.mutate({ id: editingVoucher.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleAssignSubmit = (voucherId: number, userIds: number[], usageLimit: number, expiredAt: string) => {
    assignMutation.mutate({ voucherId, userIds, usageLimit, expiredAt })
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý Voucher</h1>
          <p className='text-muted-foreground mt-1'>Tạo và quản lý mã giảm giá.</p>
        </div>
      </div>

      <VoucherToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Danh sách voucher</h2>
          <button
            onClick={handleCreate}
            className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
          >
            <Plus className='mr-2 h-4 w-4' />
            Thêm voucher
          </button>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          </div>
        ) : (
          <>
            <VoucherTable
              vouchers={vouchers}
              onEdit={handleEdit}
              onAssign={handleAssign}
            />
            {totalPages > 1 && (
              <div className='flex items-center justify-between border-t border-border pt-4'>
                <p className='text-muted-foreground text-sm'>
                  Trang {page} / {totalPages} • Tổng {totalItems} voucher
                </p>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className='border-input hover:bg-accent inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium disabled:opacity-50'
                  >
                    Trước
                  </button>
                  <button
                    type='button'
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className='border-input hover:bg-accent inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium disabled:opacity-50'
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVoucher ? 'Chỉnh sửa voucher' : 'Thêm voucher mới'}
      >
        <VoucherForm
          key={editingVoucher ? editingVoucher.id : 'new'}
          initialData={editingVoucher}
          onSubmit={handleSaveVoucher}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <AssignUsersModal
        isOpen={!!assignVoucher}
        onClose={() => setAssignVoucher(null)}
        voucher={assignVoucher}
        onAssign={handleAssignSubmit}
        isSubmitting={assignMutation.isPending}
      />
    </div>
  )
}
