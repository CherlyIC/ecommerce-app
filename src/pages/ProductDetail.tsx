import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getProductById, addToCart } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  const [quantity, setQuantity] = useState(1)

  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID')
      const res = await getProductById(id)
      return res.data
    }
  })

  const cartMut = useMutation({
    mutationFn: () => {
      // Check if product has variants and use the first one, otherwise pass null
      const variantId = product?.variants?.length > 0 ? product.variants[0].id : null
      console.log('Using variantId:', variantId)
      return addToCart(id!, quantity, variantId)
    },
    onSuccess: () => {
      toast.success('Added to cart!')
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error: any) => {
      console.error('Add to cart error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add to cart. Please try again.'
      toast.error(errorMessage)
    }
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-orange-500 font-bold bg-gray-50">Loading product...</div>
  }

  if (isError || !productData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found.</h2>
        <Link to="/" className="text-orange-500 hover:underline font-bold">Return to home</Link>
      </div>
    )
  }

  const productRaw = productData?.data?.product || productData?.product || productData?.data || productData
  const product = productRaw as any
  
  console.log('Product data:', product) // Debug: check product structure
  console.log('Product variants:', product?.variants) // Debug: check if variants exist
  
  const firstImage = product?.images?.[0]
  const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url || 'https://placehold.co/800x600?text=No+Image'

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.')
      navigate('/login')
      return
    }
    
    if (!id) {
      toast.error('Product ID is missing')
      return
    }
    
    if (quantity <= 0) {
      toast.error('Please select a valid quantity')
      return
    }
    
    if (!product || !product.id) {
      toast.error('Product data is not available')
      return
    }
    
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`)
      return
    }
    
    cartMut.mutate()
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-4 selection:bg-orange-200">
      <div className="max-w-6xl mx-auto">
        
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 font-bold mb-8 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Catalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          <div className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center justify-center h-[500px]">
            <img src={imageUrl} alt={(product as any).name || product.title} className="max-w-full max-h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-700" />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-orange-500 text-sm font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span className="w-8 border-t-2 border-orange-200"></span>
              {product.category?.name || 'Uncategorized'}
            </p>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              {(product as any).name || product.title}
            </h1>
            <p className="text-xl text-gray-500 font-medium mb-8 p-1">Brand: {product.brand}</p>
            
            <div className="text-4xl lg:text-5xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-8 tracking-tighter">
              ${(product.price || 0).toFixed(2)}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-10 min-h-[100px]">
              {product.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="bg-white border border-gray-200 rounded-full flex items-center justify-between px-2 w-full sm:w-40 h-16 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors bg-gray-50 hover:bg-orange-50 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
                </button>
                <span className="font-bold text-xl text-gray-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors bg-gray-50 hover:bg-orange-50 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={cartMut.isPending || product.stock <= 0}
                className="flex-1 bg-gray-900 hover:bg-orange-600 text-white font-bold text-lg h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_15px_40px_rgb(234,88,12,0.3)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock <= 0 ? 'Out of Stock' : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    {cartMut.isPending ? 'Adding...' : 'Add to Cart'}
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-sm font-bold text-gray-500">
              <span className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}></span>
              {product.stock > 0 ? `${product.stock} units available` : 'Currently unavailable'}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
