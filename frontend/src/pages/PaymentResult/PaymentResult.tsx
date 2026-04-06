import path from '@/constants/path'
import { PAYMENT_RESULT_QUERY_PARAM_KEYS } from '@/constants/queryParams'
import paymentApi from '@/apis/payment.api'
import useQueryParams from '@/hooks/useQueryParams'
import { formatCurrency } from '@/utils/utils'
import {
  getPaymentResultFromSession,
  setPaymentResultToSession,
  type PaymentResultStorageData
} from '@/utils/paymentResultStorage'
import { CheckCircle2, Home, Receipt, RefreshCw, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function parseBoolean(value?: string): boolean | undefined {
  if (!value) return undefined
  return value === 'true'
}

type PaymentUiOutcome = 'success' | 'failed' | 'cancelled' | 'verifying'

function getCallbackOutcome(result: PaymentResultStorageData | null): PaymentUiOutcome {
  if (!result) return 'verifying'
  if (result.cancel) return 'cancelled'

  const callbackCode = result.code?.trim()
  const callbackStatus = result.status?.trim()

  // PayOS status: PAID, PENDING, PROCESSING, CANCELLED
  if (callbackStatus === 'PAID') {
    return 'success'
  }

  if (callbackStatus === 'CANCELLED') {
    return 'cancelled'
  }

  if (callbackStatus === 'PENDING' || callbackStatus === 'PROCESSING') {
    return 'verifying'
  }

  // PayOS code: 00 success, 01 invalid params
  if (callbackCode === '00') {
    return 'verifying'
  }

  if (callbackCode === '01') {
    return 'failed'
  }

  if (callbackCode) {
    return 'failed'
  }

  return 'verifying'
}

function getDbOutcome(status?: string): PaymentUiOutcome | null {
  if (!status) return null
  if (status === 'SUCCESS') return 'success'
  if (status === 'FAILED') return 'failed'
  if (status === 'PENDING') return 'verifying'
  return null
}

export default function PaymentResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = useQueryParams()

  const callbackResult = useMemo<PaymentResultStorageData | null>(() => {
    if (Object.keys(queryParams).length === 0) {
      return null
    }

    return {
      code: queryParams[PAYMENT_RESULT_QUERY_PARAM_KEYS.code],
      paymentId: queryParams[PAYMENT_RESULT_QUERY_PARAM_KEYS.paymentId],
      cancel: parseBoolean(queryParams[PAYMENT_RESULT_QUERY_PARAM_KEYS.cancel]),
      status: queryParams[PAYMENT_RESULT_QUERY_PARAM_KEYS.status],
      orderCode: queryParams[PAYMENT_RESULT_QUERY_PARAM_KEYS.orderCode]
    }
  }, [queryParams])

  const storedResult = typeof window !== 'undefined' ? getPaymentResultFromSession() : null
  const paymentResult = useMemo<PaymentResultStorageData | null>(() => {
    if (callbackResult) {
      const isSamePayment =
        !!storedResult &&
        ((callbackResult.orderCode && storedResult.orderCode === callbackResult.orderCode) ||
          (callbackResult.code && storedResult.code === callbackResult.code))

      return isSamePayment ? { ...storedResult, ...callbackResult } : callbackResult
    }

    return storedResult
  }, [callbackResult, storedResult])

  const paymentCode = paymentResult?.orderCode
  const { data: paymentDetail, isFetching: isPaymentDetailFetching } = useQuery({
    queryKey: ['payment-detail-by-code', paymentCode],
    queryFn: () => paymentApi.getPaymentByCode(paymentCode!),
    enabled: Boolean(paymentCode),
    refetchInterval: location.pathname === path.paymentSuccess ? 1500 : false,
    refetchIntervalInBackground: false,
    select: (response) => response.data.data
  })

  useEffect(() => {
    if (!callbackResult) return

    const isSamePayment =
      !!storedResult &&
      ((callbackResult.orderCode && storedResult.orderCode === callbackResult.orderCode) ||
        (callbackResult.code && storedResult.code === callbackResult.code))
    const nextResult = isSamePayment ? { ...storedResult, ...callbackResult } : callbackResult

    setPaymentResultToSession(nextResult)
    navigate(location.pathname, { replace: true })
  }, [callbackResult, location.pathname, navigate, storedResult])

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

  const isFailurePath = location.pathname === path.paymentFailure

  const callbackOutcome = useMemo(() => getCallbackOutcome(paymentResult), [paymentResult])
  const dbOutcome = useMemo(() => getDbOutcome(paymentDetail?.status), [paymentDetail?.status])

  const optimisticOutcome: PaymentUiOutcome =
    callbackOutcome === 'verifying' && isFailurePath ? 'failed' : callbackOutcome

  const uiOutcome: PaymentUiOutcome = dbOutcome && dbOutcome !== 'verifying' ? dbOutcome : optimisticOutcome

  const isSuccess = uiOutcome === 'success'
  const isVerifying = uiOutcome === 'verifying' || (dbOutcome === 'verifying' && isPaymentDetailFetching)
  const isCancelled = uiOutcome === 'cancelled'

  const title = isVerifying
    ? 'Đang xác nhận thanh toán'
    : isSuccess
      ? 'Thanh toán thành công'
      : 'Thanh toán chưa hoàn tất'
  const description = isSuccess
    ? 'Cảm ơn bạn đã hoàn tất thanh toán tiền cọc. CrownDine đã ghi nhận giao dịch của bạn và sẽ chuẩn bị trải nghiệm tốt nhất cho buổi đặt bàn này.'
    : isVerifying
      ? 'Hệ thống đang đồng bộ kết quả thanh toán từ cổng thanh toán. Vui lòng đợi trong giây lát.'
      : 'Thanh toán chưa hoàn tất hoặc đã bị hủy. Bạn có thể quay lại để thử lại hoặc chọn phương thức khác.'

  const displayStatus = isVerifying
    ? 'Đang xác nhận'
    : isSuccess
      ? 'Đã thanh toán'
      : isCancelled
        ? 'Đã hủy'
        : 'Chưa hoàn tất'

  const hasMismatchBetweenCallbackAndDb =
    dbOutcome !== null && dbOutcome !== 'verifying' && callbackOutcome !== 'verifying' && callbackOutcome !== dbOutcome
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
          <div className={`px-8 py-10 ${isSuccess ? 'bg-emerald-50' : isVerifying ? 'bg-amber-50' : 'bg-rose-50'}`}>
            <div className='flex items-center gap-4'>
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${isSuccess ? 'bg-emerald-500 text-white' : isVerifying ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}
              >
                {isSuccess ? (
                  <CheckCircle2 size={28} />
                ) : isVerifying ? (
                  <RefreshCw size={28} className='animate-spin' />
                ) : (
                  <XCircle size={28} />
                )}
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

            {hasMismatchBetweenCallbackAndDb && (
              <div className='rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800'>
                Kết quả trả về từ cổng thanh toán khác với dữ liệu hệ thống. Giao diện đang ưu tiên trạng thái trong DB
                để đảm bảo chính xác.
              </div>
            )}

            {!isSuccess && !isVerifying && (
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

              {!isSuccess && !isVerifying && !isFailurePath && (
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
