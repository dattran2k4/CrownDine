import path from '@/constants/path'
import paymentApi from '@/apis/payment.api'
import { formatCurrency } from '@/utils/utils'
import {
  getPaymentResultFromSession,
  setPaymentResultToSession,
  type PaymentResultStorageData
} from '@/utils/paymentResultStorage'
import { CheckCircle2, Home, Receipt, RefreshCw, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined
  return value === 'true'
}

export default function PaymentResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const callbackResult = useMemo<PaymentResultStorageData | null>(() => {
    if (!searchParams.toString()) {
      return null
    }

    return {
      code: searchParams.get('code') ?? undefined,
      paymentId: searchParams.get('id') ?? undefined,
      cancel: parseBoolean(searchParams.get('cancel')),
      status: searchParams.get('status') ?? undefined,
      orderCode: searchParams.get('orderCode') ?? undefined
    }
  }, [searchParams])

  const stateResult = (location.state as PaymentResultStorageData | null) ?? null
  const storedResult = typeof window !== 'undefined' ? getPaymentResultFromSession() : null
  const paymentResult = useMemo<PaymentResultStorageData | null>(() => {
    if (callbackResult) {
      return {
        ...storedResult,
        ...stateResult,
        ...callbackResult
      }
    }

    return stateResult ?? storedResult
  }, [callbackResult, stateResult, storedResult])

  const paymentCode = paymentResult?.orderCode
  const { data: paymentDetail } = useQuery({
    queryKey: ['payment-detail-by-code', paymentCode],
    queryFn: () => paymentApi.getPaymentByCode(paymentCode!),
    enabled: Boolean(paymentCode),
    select: (response) => response.data.data
  })

  useEffect(() => {
    if (!callbackResult) return

    setPaymentResultToSession({
      ...storedResult,
      ...stateResult,
      ...callbackResult
    })
    navigate(location.pathname, {
      replace: true,
      state: {
        ...storedResult,
        ...stateResult,
        ...callbackResult
      }
    })
  }, [callbackResult, location.pathname, navigate, stateResult, storedResult])

  const mergedPaymentResult = useMemo(() => {
    if (!paymentDetail) {
      return paymentResult
    }

    return {
      ...paymentResult,
      amount: paymentDetail.amount,
      paidAt: paymentDetail.createdAt,
      reservationCode: paymentDetail.reservationCode ?? paymentResult?.reservationCode,
      orderCode: String(paymentDetail.code),
      paymentId: paymentDetail.transactionCode ?? paymentResult?.paymentId,
      status: paymentDetail.status
    }
  }, [paymentDetail, paymentResult])

  useEffect(() => {
    if (!paymentDetail || !mergedPaymentResult) return

    setPaymentResultToSession(mergedPaymentResult)
  }, [mergedPaymentResult, paymentDetail])

  const isSuccessPath = location.pathname === path.paymentSuccess
  const isSuccess = isSuccessPath && mergedPaymentResult?.status === 'SUCCESS' && mergedPaymentResult?.cancel !== true

  const title = isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất'
  const description = isSuccess
    ? 'Cảm ơn bạn đã hoàn tất thanh toán tiền cọc. CrownDine đã ghi nhận giao dịch của bạn và sẽ chuẩn bị trải nghiệm tốt nhất cho buổi đặt bàn này.'
    : 'Thanh toán chưa hoàn tất hoặc đã bị hủy. Bạn có thể quay lại để thử lại hoặc chọn phương thức khác.'

  const displayStatus = isSuccess ? 'Đã thanh toán' : mergedPaymentResult?.cancel ? 'Đã hủy' : 'Chưa hoàn tất'
  const transactionDate = mergedPaymentResult?.paidAt
    ? new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'full',
        timeStyle: 'short'
      }).format(new Date(mergedPaymentResult.paidAt))
    : new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'full',
        timeStyle: 'short'
      }).format(new Date())

  return (
    <div className='bg-background text-foreground min-h-screen px-4 py-16'>
      <div className='mx-auto max-w-2xl'>
        <div className='overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm'>
          <div className={`px-8 py-10 ${isSuccess ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <div className='flex items-center gap-4'>
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${isSuccess ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
              >
                {isSuccess ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
              </div>
              <div>
                <h1 className='text-2xl font-bold text-neutral-900'>{title}</h1>
                <p className='mt-1 text-sm text-neutral-600'>{description}</p>
                {isSuccess && (
                  <p className='mt-3 text-sm font-medium text-emerald-700'>Cảm ơn bạn đã lựa chọn CrownDine.</p>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-4 px-8 py-8'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-2xl border border-neutral-200 bg-neutral-50 p-4'>
                <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>Trạng thái</span>
                <p className='mt-2 text-lg font-semibold text-neutral-900'>{displayStatus}</p>
              </div>

              <div className='rounded-2xl border border-neutral-200 bg-neutral-50 p-4'>
                <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>
                  Số tiền đã thanh toán
                </span>
                <p className='mt-2 text-lg font-semibold text-neutral-900'>
                  {mergedPaymentResult?.amount != null ? formatCurrency(mergedPaymentResult.amount) : 'Chưa có dữ liệu'}
                </p>
              </div>

              <div className='rounded-2xl border border-neutral-200 bg-neutral-50 p-4'>
                <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>Mã giao dịch</span>
                <p className='mt-2 text-sm font-medium break-all text-neutral-900'>
                  {mergedPaymentResult?.paymentId ?? 'Chưa có'}
                </p>
              </div>

              <div className='rounded-2xl border border-neutral-200 bg-neutral-50 p-4'>
                <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>Mã thanh toán</span>
                <p className='mt-2 text-lg font-semibold text-neutral-900'>{mergedPaymentResult?.orderCode ?? 'N/A'}</p>
              </div>
            </div>

            <div className='rounded-2xl border border-neutral-200 bg-neutral-50 p-4'>
              <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>
                Thời gian giao dịch
              </span>
              <p className='mt-2 text-base font-semibold text-neutral-900'>{transactionDate}</p>
            </div>

            {!isSuccess && (
              <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800'>
                Nếu bạn đã thanh toán nhưng chưa thấy cập nhật, hãy chờ thêm trong giây lát rồi kiểm tra lại lịch sử đặt
                bàn của bạn.
              </div>
            )}

            <div className='flex flex-col gap-3 pt-2 sm:flex-row'>
              <Link
                to={path.home}
                className='inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white transition hover:bg-neutral-800'
              >
                <Home size={18} />
                Về trang chủ
              </Link>

              <Link
                to={path.profile}
                className='inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 font-semibold text-neutral-900 transition hover:bg-neutral-50'
              >
                <Receipt size={18} />
                Xem hồ sơ
              </Link>

              {!isSuccess && (
                <Link
                  to={path.reservation}
                  className='inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 font-semibold text-rose-700 transition hover:bg-rose-100'
                >
                  <RefreshCw size={18} />
                  Thử lại
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
