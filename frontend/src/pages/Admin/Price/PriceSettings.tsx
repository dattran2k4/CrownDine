import { useState, useEffect } from 'react'
import { Search, ChevronDown, FileText, ChevronRight, Save } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import categoryApi from '@/apis/category.api'
import itemApi from '@/apis/item.api'
import type { Item } from '@/types/item.type'

export default function PriceSettings() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const queryClient = useQueryClient()

  // Categories query for sidebar
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories()
  })

  const categories = categoriesData?.data.data || []
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  // Items query based on selected category or search
  const { data: itemsData, isLoading: isLoadingItems } = useQuery<Item[]>({
    queryKey: ['items', selectedCategoryId, searchTerm],
    queryFn: async () => {
      if (selectedCategoryId) {
        const res = await itemApi.getItemsByCategory(selectedCategoryId)
        return res.data.data.data // Access the array inside PageResponse
      }
      const res = await itemApi.getItems()
      // If getItems also returns PageResponse, adjust accordingly. 
      // Based on item.api.ts line 18, it returns Item[] directly after res.data.data
      return Array.isArray(res.data.data) ? res.data.data : (res.data.data as any).data
    }
  })

  // Update Item Price Mutation
  const updatePriceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => itemApi.updateItem(id, data),
    onSuccess: () => {
      toast.success('Cập nhật giá thành công')
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
    onError: () => {
      toast.error('Cập nhật giá thất bại')
    }
  })

  useEffect(() => {
    if (itemsData) {
      setItems(itemsData)
    }
  }, [itemsData])

  const handlePriceUpdate = (item: Item, newPriceStr: string) => {
    const newPrice = parseFloat(newPriceStr.replace(/\./g, '').replace(',', '.'))
    if (isNaN(newPrice) || newPrice === item.price) return

    const payload = {
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price: newPrice,
      status: item.status,
      categoryId: item.categoryId
    }

    updatePriceMutation.mutate({ id: item.id, data: payload })
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toString().includes(searchTerm)
  )

  return (
    <div className='relative flex gap-6'>
      {/* Sidebar Filters */}
      <aside className='w-64 shrink-0 space-y-6'>
        <div className='bg-card border-border rounded-xl border p-4 shadow-sm'>
          <h3 className='mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>Tìm kiếm</h3>
          <div className='relative'>
            <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Theo mã, tên hàng (F3)'
              className='pl-9 text-xs border-gray-200 focus:border-blue-400 focus:ring-blue-100 transition-all placeholder:text-gray-400'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className='bg-card border-border overflow-hidden rounded-xl border shadow-sm'>
          <div className='flex items-center justify-between border-b bg-muted/30 p-4'>
            <h3 className='text-sm font-bold uppercase tracking-wider text-[#003A8C]'>Nhóm hàng</h3>
            <ChevronDown className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='p-2'>
            <nav className='space-y-0.5'>
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-xs font-bold transition-all ${
                  selectedCategoryId === null
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>Tất cả</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                  selectedCategoryId === null ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {items.length}
                </span>
              </button>
              <div className='my-2 h-px bg-border/50'></div>
              {categories.map((category) => {
                const itemCount = items.filter(i => i.categoryId === category.id).length
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-xs font-medium transition-all ${
                      selectedCategoryId === category.id
                        ? 'bg-blue-50 text-blue-600 shadow-sm border-l-2 border-blue-600 rounded-l-none'
                        : 'text-gray-600 hover:bg-gray-50 hover:pl-5'
                    }`}
                  >
                    <span>{category.name}</span>
                    {itemCount > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                        selectedCategoryId === category.id ? 'bg-blue-100' : 'bg-gray-50'
                      }`}>
                        {itemCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className='flex-1 space-y-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {selectedCategoryId
              ? `Bảng giá: ${categories.find((c) => c.id === selectedCategoryId)?.name}`
              : 'Bảng giá chung'}
          </h1>
          <div className='flex items-center gap-2'>
            <Button size='sm' className='bg-green-600 border-none text-white hover:bg-green-700 gap-2'>
              <FileText className='h-4 w-4' />
              Xuất file
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className='bg-card border-border overflow-hidden rounded-xl border shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-[#E6F4FF] border-border border-b font-semibold text-[#003A8C]'>
                <tr>
                  <th className='px-6 py-4'>Mã món</th>
                  <th className='px-6 py-4'>Tên món</th>
                  <th className='px-6 py-4'>Nhóm hàng</th>
                  <th className='w-[150px] px-6 py-4 text-end'>Giá hiện tại</th>
                </tr>
              </thead>
              <tbody className='divide-border divide-y'>
                {isLoadingItems ? (
                  <tr>
                    <td colSpan={4} className='py-12 text-center'>
                      <div className='border-primary h-6 w-6 inline-block animate-spin rounded-full border-2 border-t-transparent'></div>
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className='hover:bg-muted/30 transition-colors'>
                      <td className='px-6 py-4 font-medium'>#{item.id}</td>
                      <td className='px-6 py-4'>{item.name}</td>
                      <td className='text-muted-foreground px-6 py-4'>{categoryMap[item.categoryId] || 'N/A'}</td>
                      <td className='px-6 py-4'>
                        <div className='group relative flex items-center justify-end gap-2'>
                          <input
                            type='text'
                            className='focus:ring-primary w-full rounded border-none bg-transparent px-2 py-1 text-end transition-all focus:ring-1'
                            defaultValue={item.price.toLocaleString('vi-VN')}
                            onBlur={(e) => handlePriceUpdate(item, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handlePriceUpdate(item, (e.target as HTMLInputElement).value)
                                  ; (e.target as HTMLInputElement).blur()
                              }
                            }}
                          />
                          <Save className='text-muted-foreground/30 h-3 w-3 opacity-0 transition-opacity group-focus-within:opacity-100' />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className='text-muted-foreground py-12 text-center'>
                      Không tìm thấy món ăn nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        <div className='flex items-center justify-between px-2 pt-4'>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='icon' className='h-8 w-8'>
              <ChevronRight className='h-4 w-4 rotate-180' />
            </Button>
            <Button size='sm' className='h-8 w-8 p-0'>
              1
            </Button>
            <Button variant='outline' size='icon' className='h-8 w-8'>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
          <span className='text-muted-foreground text-xs'>Hiển thị {filteredItems.length} món ăn</span>
        </div>
      </main>

      {/* Support Floating Button */}
      <div className='fixed bottom-6 right-6 flex flex-col items-end gap-3'>
        <button className='bg-[#1890FF] flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-lg transition-transform hover:scale-105'>
          <FileText className='h-4 w-4' />
          Trợ giúp
        </button>
      </div>
    </div>
  )
}
