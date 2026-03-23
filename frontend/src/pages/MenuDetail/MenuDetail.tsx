import comboApi from '@/apis/combo.api'
import feedbackApi from '@/apis/feedback.api'
import categoryApi from '@/apis/category.api'
import itemApi from '@/apis/item.api'
import RatingStart from '@/components/RatingStart'
import type { Category } from '@/types/category.type'
import type { Feedback } from '@/types/feedback.type'
import { formatCurrency, getImageUrl } from '@/utils/utils'
import { formatDate } from '@/utils/date'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import path from '@/constants/path'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFavoriteStore } from '@/stores/useFavoriteStore'
import { ArrowLeft, ShoppingCart, Star, Heart } from 'lucide-react'
import { toast } from 'react-toastify'

type TabType = 'description' | 'comboItems' | 'reviews'

export default function MenuDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const isCombo = location.pathname.includes('/combo/')
  const [activeTab, setActiveTab] = useState<TabType>(isCombo ? 'comboItems' : 'reviews')

  const {
    isFavoriteItem,
    isFavoriteCombo,
    addFavoriteItem,
    addFavoriteCombo,
    removeFavoriteItem,
    removeFavoriteCombo
  } = useFavoriteStore()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const isFavorite = isCombo ? isFavoriteCombo(Number(id)) : isFavoriteItem(Number(id))

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để sử dụng tính năng này')
      return
    }

    if (isFavorite) {
      if (isCombo) {
        await removeFavoriteCombo(Number(id))
      } else {
        await removeFavoriteItem(Number(id))
      }
    } else {
      if (isCombo) {
        await addFavoriteCombo(Number(id))
      } else {
        await addFavoriteItem(Number(id))
      }
    }
  }

  const itemId = isCombo ? undefined : id
  const comboId = isCombo ? id : undefined

  const { data: itemData } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => itemApi.getItemById(itemId!),
    enabled: !!itemId
  })

  const { data: comboData } = useQuery({
    queryKey: ['combo', comboId],
    queryFn: () => comboApi.getComboById(comboId!),
    enabled: !!comboId
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
    enabled: !!itemId
  })

  const { data: feedbacksItemData } = useQuery({
    queryKey: ['feedbacks-item', itemId],
    queryFn: () => feedbackApi.getFeedbacksByItem(itemId!),
    enabled: !!itemId
  })

  const { data: feedbacksComboData } = useQuery({
    queryKey: ['feedbacks-combo', comboId],
    queryFn: () => feedbackApi.getFeedbacksByCombo(comboId!),
    enabled: !!comboId
  })

  const categories: Category[] = categoriesData?.data?.data ?? []
  const item = itemData?.data?.data
  const combo = comboData?.data?.data
  const feedbacks: Feedback[] = isCombo
    ? (feedbacksComboData?.data?.data ?? [])
    : (feedbacksItemData?.data?.data ?? [])

  const categoryMap = useMemo(() => {
    const map: Record<number, string> = {}
    categories.forEach((c) => {
      map[c.id] = c.name
    })
    return map
  }, [categories])

  const name = item?.name ?? combo?.name ?? ''
  const description = item?.description ?? combo?.description ?? ''
  const imageUrl = item?.imageUrl ?? combo?.imageUrl ?? ''
  const price = item ? Number(item.price) : combo ? Number(combo.price) : 0
  const priceAfterDiscount =
    item?.priceAfterDiscount != null
      ? Number(item.priceAfterDiscount)
      : combo?.priceAfterDiscount != null
        ? Number(combo.priceAfterDiscount)
        : null
  const displayPrice = priceAfterDiscount ?? price
  const categoryName = item ? (categoryMap[item.categoryId] ?? 'ĐỒ UỐNG').toUpperCase() : 'COMBO'
  const soldCount = (combo as { soldCount?: number })?.soldCount ?? 0
  const comboItems = combo?.items ?? []

  const avgRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
      : null

  if (!id) {
    return (
      <div className='bg-background text-foreground flex min-h-screen items-center justify-center'>
        <p className='text-muted-foreground'>Không tìm thấy món/combo.</p>
      </div>
    )
  }

  if (!item && !combo) {
    return (
      <div className='bg-background text-foreground flex min-h-screen items-center justify-center'>
        <p className='text-muted-foreground'>Đang tải...</p>
      </div>
    )
  }

  return (
    <div className='bg-background text-foreground min-h-screen px-4 py-8 md:px-8'>
      <div className='mx-auto max-w-6xl'>
        {/* Phần trên: Ảnh + Thông tin - một khung card */}
        <div className='bg-card border-border mb-10 overflow-hidden rounded-2xl border shadow-sm'>
          <div className='grid grid-cols-1 gap-0 md:grid-cols-[0.4fr_0.6fr]'>
            {/* Ảnh */}
            <div className='relative min-h-[240px] md:min-h-[320px]'>
              <img
                src={getImageUrl(imageUrl)}
                alt={name}
                className='absolute inset-0 h-full w-full object-cover'
              />
            </div>

            {/* Thông tin bên phải */}
            <div className='flex flex-col p-6 md:p-8'>
            <h1 className='text-foreground mb-2 text-3xl font-bold md:text-4xl'>{name}</h1>
            <p className='text-primary mb-4 text-2xl font-bold'>
              {formatCurrency(displayPrice)}
              {priceAfterDiscount != null && (
                <span className='text-muted-foreground ml-2 text-base font-normal line-through'>
                  {formatCurrency(price)}
                </span>
              )}
            </p>

            <div className='text-muted-foreground mb-4 flex flex-wrap items-center gap-4 text-sm'>
              <span className='font-medium'>{categoryName}</span>
              {isCombo && comboItems.length > 0 && (
                <span className='font-medium'>= {comboItems.length} món</span>
              )}
              <span className='flex items-center gap-1'>
                <RatingStart rating={avgRating ?? undefined} size={18} />
                {avgRating != null && (
                  <span className='font-medium'>
                    {avgRating.toFixed(1)} ({feedbacks.length})
                  </span>
                )}
              </span>
              {soldCount > 0 && (
                <span className='flex items-center gap-1'>
                  <ShoppingCart size={16} />
                  {soldCount} đã bán
                </span>
              )}
            </div>

            <div className='mb-6'>
              <span className='bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium'>
                <Star size={14} />
                Phổ biến
              </span>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Link
                to='/menu'
                className='border-primary text-primary hover:bg-primary/10 inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 font-medium transition-colors'
              >
                <ArrowLeft size={18} />
                Quay lại menu
              </Link>
              <Link
                to={path.reservation}
                className='bg-foreground text-background hover:bg-foreground/90 inline-flex items-center rounded-lg px-5 py-2.5 font-medium transition-colors'
              >
                Đặt bàn ngay
              </Link>
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium transition-all duration-300 ${
                  isFavorite
                    ? 'bg-primary text-white'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-red-500 border-2'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'Đã thích' : 'Yêu thích'}
              </button>
            </div>

            <p className='text-muted-foreground mt-6 text-sm'>
              Khung giờ mở cửa: 09:00-22:00.
            </p>
            </div>
          </div>
        </div>

        {/* Tab Mô tả / Món trong set (combo) / Đánh giá - khung card */}
        <div className='bg-card border-border overflow-hidden rounded-2xl border shadow-sm'>
          <div className='border-border flex flex-wrap border-b bg-muted/20'>
            <button
              type='button'
              onClick={() => setActiveTab('description')}
              className={`min-w-[100px] px-5 py-4 text-sm font-medium transition-colors md:min-w-[120px] md:px-6 ${
                activeTab === 'description'
                  ? 'border-primary text-primary border-b-2 bg-card'
                  : 'text-muted-foreground hover:bg-muted/30'
              }`}
            >
              Mô tả
            </button>
            {isCombo && (
              <button
                type='button'
                onClick={() => setActiveTab('comboItems')}
                className={`min-w-[120px] px-5 py-4 text-sm font-medium transition-colors md:min-w-[140px] md:px-6 ${
                  activeTab === 'comboItems'
                    ? 'border-primary text-primary border-b-2 bg-card'
                    : 'text-muted-foreground hover:bg-muted/30'
                }`}
              >
                Món trong combo
              </button>
            )}
            <button
              type='button'
              onClick={() => setActiveTab('reviews')}
              className={`min-w-[100px] px-5 py-4 text-sm font-medium transition-colors md:min-w-[120px] md:px-6 ${
                activeTab === 'reviews'
                  ? 'border-primary text-primary border-b-2 bg-card'
                  : 'text-muted-foreground hover:bg-muted/30'
              }`}
            >
              Đánh giá
            </button>
          </div>

          <div className='min-h-[140px] p-6'>
            {activeTab === 'description' && (
              <div className='text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed'>
                {description || 'Chưa có mô tả.'}
              </div>
            )}

            {activeTab === 'comboItems' && isCombo && (
              <div className='space-y-5'>
                {comboItems.length === 0 ? (
                  <p className='text-muted-foreground py-4 italic'>Combo chưa có món nào.</p>
                ) : (
                  comboItems.map((comboItem, index) => (
                    <div
                      key={`${comboItem.itemId}-${index}`}
                      className='border-border flex flex-wrap items-start gap-4 border-b border-dashed pb-5 last:border-0 last:pb-0'
                    >
                      <div className='bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                        {index + 1}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h4 className='text-foreground font-semibold'>{comboItem.itemName}</h4>
                      </div>
                      <span className='bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium'>
                        SL: {comboItem.quantity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className='space-y-6'>
                {feedbacks.length === 0 ? (
                  <p className='text-muted-foreground py-4 italic'>Chưa có đánh giá nào.</p>
                ) : (
                  feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className='border-border flex flex-col gap-2 border-b border-dashed pb-6 last:border-0'
                    >
                      <div className='flex items-center justify-between gap-4'>
                        <span className='font-semibold'>{fb.fullName || 'Khách hàng'}</span>
                        <span className='text-muted-foreground text-sm'>
                          {formatDate(fb.createdAt)}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <RatingStart rating={fb.rating} size={16} />
                        <span className='text-muted-foreground text-sm font-medium'>
                          {fb.rating}.0
                        </span>
                      </div>
                      <p className='text-foreground text-sm'>{fb.comment || '-'}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
