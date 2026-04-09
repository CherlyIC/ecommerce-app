import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { getProductById, createProduct, updateProduct, getCategories } from '../../api/endpoints'
import type { Category } from '../../types'

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().min(20, 'Description must be at least 20 characters').trim(),
  brand: z.string().min(1, 'Brand is required').trim(),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int('Stock must be a whole number').nonnegative('Stock cannot be negative'),
  categoryId: z.number().positive('Category is required'),
  image: z.string().url('Must provide a valid image URL'),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id && id !== 'new')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const res = await getCategories()
      return res.data
    }
  })

  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getProductById(id)
      return res.data
    },
    enabled: isEditMode
  })

  const categories: Category[] = (() => {
    if (Array.isArray(categoriesData)) return categoriesData
    if (categoriesData && Array.isArray(categoriesData.categories)) return categoriesData.categories
    if (categoriesData?.data && Array.isArray(categoriesData.data.all)) return categoriesData.data.all
    if (categoriesData?.data && Array.isArray(categoriesData.data)) return categoriesData.data
    return []
  })()

  const createMut = useMutation({
    mutationFn: (data: any) => createProduct(data),
    onSuccess: () => {
      toast.success('Product created successfully!')
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] })
      navigate('/admin')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create product')
  })

  const updateMut = useMutation({
    mutationFn: (data: any) => updateProduct(id as string, data),
    onSuccess: () => {
      toast.success('Product updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] })
      navigate('/admin')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update product')
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (isEditMode && productData) {
      const prod = productData.product || productData.data || productData
      
      const firstImg = prod.images?.[0]
      const imgUrl = typeof firstImg === 'string' ? firstImg : (firstImg as any)?.url || ''

      reset({
        title: (prod as any).name || prod.title || '',
        description: prod.description || '',
        brand: prod.brand || '',
        price: prod.price || 0,
        stock: prod.stock || 0,
        categoryId: prod.category?.id || (prod as any).categoryId || 0,
        image: imgUrl
      })
    }
  }, [productData, isEditMode, reset])

  const onSubmit = (data: ProductFormValues) => {
    const payload = {
      title: data.title,
      description: data.description,
      brand: data.brand,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
      images: [data.image], 
    }

    if (isEditMode) {
      updateMut.mutate(payload)
    } else {
      createMut.mutate(payload)
    }
  }

  if (isEditMode && isLoadingProduct) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-orange-500 bg-gray-50">Loading product details...</div>
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-4 selection:bg-orange-200">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center gap-4 mb-10">
          <Link to="/admin" className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {isEditMode ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              {isEditMode ? 'Update product inventory details and descriptions' : 'Add a new product to your marketplace'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Title</label>
                  <input
                    {...register('title')}
                    className={`w-full px-5 py-4 rounded-2xl border ${errors.title ? 'border-red-500 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500 bg-gray-50/50'} outline-none transition-all font-medium`}
                    placeholder="E.g. Apple iPhone 15 Pro Max"
                  />
                  {errors.title && <span className="text-red-500 text-xs font-bold mt-2 block">{errors.title.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                  <input
                    {...register('brand')}
                    className={`w-full px-5 py-4 rounded-2xl border ${errors.brand ? 'border-red-500 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500 bg-gray-50/50'} outline-none transition-all font-medium`}
                    placeholder="E.g. Apple"
                  />
                  {errors.brand && <span className="text-red-500 text-xs font-bold mt-2 block">{errors.brand.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  {isLoadingCategories ? (
                    <div className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse text-gray-400 font-medium">Loading...</div>
                  ) : (
                    <select
                      {...register('categoryId', { valueAsNumber: true })}
                      className={`w-full px-5 py-4 rounded-2xl border cursor-pointer appearance-none ${errors.categoryId ? 'border-red-500 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500 bg-gray-50/50'} outline-none transition-all font-medium`}
                    >
                      <option value="">Select a category...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                  {errors.categoryId && <span className="text-red-500 text-xs font-bold mt-2 block">{errors.categoryId.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={`w-full px-5 py-4 rounded-2xl border ${errors.description ? 'border-red-500 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500 bg-gray-50/50'} outline-none transition-all font-medium resize-none`}
                  placeholder="Detailed description of the product... (At least 20 characters)"
                />
                {errors.description && <span className="text-red-500 text-xs font-bold mt-2 block">{errors.description.message}</span>}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mt-4">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className={`w-full px-5 py-4 rounded-2xl border ${errors.price ? 'border-red-500 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500 bg-gray-50/50'} outline-none transition-all font-medium`}
                    placeholder="0.00"
                  />
                  {errors.price && <span className="text-red-500 text-xs font-bold mt-2 block">{errors.price.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    className={`w-full px-5 py-4 rounded-2xl border ${errors.stock ? 'border-red-500 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500 bg-gray-50/50'} outline-none transition-all font-medium`}
                    placeholder="E.g. 50"
                  />
                  {errors.stock && <span className="text-red-500 text-xs font-bold mt-2 block">{errors.stock.message}</span>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mt-4">Media</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      {...register('image')}
                      className={`w-full px-5 py-4 rounded-2xl border ${errors.image ? 'border-red-500 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500 bg-gray-50/50'} outline-none transition-all font-medium`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.image && <span className="text-red-500 text-xs font-bold mt-2 block">{errors.image.message}</span>}
                    <p className="text-gray-400 text-xs font-medium mt-3">Provide at least one valid, publicly accessible HTTP/HTTPS image URL.</p>
                  </div>
                </div>
              </div>
            </div>

           
            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-lg py-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_15px_40px_rgb(234,88,12,0.3)] transition-all duration-300 transform hover:-translate-y-1 block text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(createMut.isPending || updateMut.isPending) ? 'Processing...' : (isEditMode ? 'Save Changes' : 'Create Product')}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}