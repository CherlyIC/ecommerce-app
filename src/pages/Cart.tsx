import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getCart, updateCartItem, removeCartItem, clearCart } from '../api/endpoints'
import type { Cart as CartType, CartItem } from '../types'

export default function Cart() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: cartResponse, isLoading, isError } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      try {
        const response = await getCart();
        return response.data;
      } catch (err) {
        throw err;
      }
    }
  })

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number, quantity: number }) => updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: () => toast.error('Failed to update quantity')
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onSuccess: () => {
      toast.success('Item removed')
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: () => toast.error('Failed to remove item')
  })

  const clearMutation = useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => {
      toast.success('Cart cleared')
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: () => toast.error('Failed to clear cart')
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-orange-500 font-bold bg-gray-50">Loading Cart...</div>
  
  if (isError) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h2 className="text-2xl font-bold bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center text-gray-800">
        Please log in to view your cart.
      </h2>
      <Link to="/login" className="mt-6 bg-orange-500 hover:bg-orange-600 transition-colors text-white px-8 py-3 rounded-full font-bold shadow-lg">
        Login Here
      </Link>
    </div>
  )

  const cart: CartType = cartResponse?.data || cartResponse || { items: [], total: 0 }
  const items = Array.isArray(cart.items) ? cart.items : []

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] pt-20 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-[3rem] p-16 text-center shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-gray-100/50">
          <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <span className="text-7xl filter grayscale opacity-40 select-none">🛒</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Your cart is empty</h2>
          <p className="text-gray-500 text-lg mb-10 max-w-sm mx-auto font-medium">Looks like you haven't added anything to your cart yet. Discover some amazing products!</p>
          <Link to="/" className="inline-block bg-gray-900 hover:bg-orange-600 text-white font-bold px-12 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(234,88,12,0.3)] text-lg">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  // Calculate actual total
  const subtotal = items.reduce((acc: number, item: any) => {
    const productPrice = item.product?.price || 0;
    return acc + (productPrice * item.quantity);
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-4 selection:bg-orange-200">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-10 flex items-center gap-4 tracking-tight">
          Shopping Cart <span className="bg-orange-100 text-orange-600 py-1.5 px-4 rounded-xl text-2xl drop-shadow-sm">{items.length}</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* CART ITEMS LIST */}
          <div className="flex-1 space-y-5">
            <div className="bg-white rounded-3xl py-4 px-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 mb-2 flex justify-between items-center">
              <span className="font-bold text-gray-400 text-sm tracking-widest uppercase">Products details</span>
              <button onClick={() => clearMutation.mutate()} className="text-red-500/80 hover:text-red-600 text-sm font-bold transition-colors">
                Clear All
              </button>
            </div>
            
            {items.map((item: any) => {
              const product = item.product;
              const firstImage = product?.images?.[0];
              const imageUrl = typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url || 'https://placehold.co/400x300?text=No+Image';

              return (
                <div key={item.id} className="bg-white rounded-[2.5rem] p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-6 lg:gap-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 group">
                  {/* IMAGE */}
                  <div className="w-full sm:w-36 h-36 bg-gray-50/50 rounded-[1.5rem] p-4 shrink-0 flex items-center justify-center relative overflow-hidden before:absolute before:inset-0 before:bg-black/0 group-hover:before:bg-black/5 before:transition-colors before:z-10">
                     <img src={imageUrl} alt={product?.name || product?.title || 'Product'} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  </div>
                  
                  {/* DETAIL */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="w-4 border-t border-gray-300 inline-block"></span>
                      {product?.category?.name || 'Item'}
                    </p>
                    <h3 className="text-2xl font-extrabold text-gray-900 line-clamp-1 mb-1">
                      {product?.name || product?.title || 'Unknown Product'}
                    </h3>
                    <p className="text-gray-500 font-medium text-sm mb-5">{product?.brand}</p>
                    <div className="text-3xl font-black text-gray-900 tracking-tight">
                      ${(product?.price || 0).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* ACTIONS */}
                  <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-4 h-full shrink-0">
                    {/* QUANTITY PICKER */}
                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-200/60 p-1 shadow-inner">
                      <button 
                        disabled={item.quantity <= 1 || updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                        className="w-10 h-10 flex items-center justify-center text-gray-700 bg-white shadow-sm rounded-full hover:text-orange-600 transition-colors disabled:opacity-30 disabled:hover:text-gray-700 focus:outline-none"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
                      </button>
                      <span className="w-12 text-center font-bold text-gray-900 text-lg">{item.quantity}</span>
                      <button 
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                        className="w-10 h-10 flex items-center justify-center text-gray-700 bg-white shadow-sm rounded-full hover:text-orange-600 transition-colors disabled:opacity-30 disabled:hover:text-gray-700 focus:outline-none"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeMutation.mutate(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-all duration-300 p-3 rounded-full hover:bg-red-50 sm:self-end"
                      title="Remove Item"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                </div>
              )
            })}
          </div>

          {/* ORDER SUMMARY */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white rounded-[3rem] p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-gray-100/50 sticky top-8">
              <h2 className="text-3xl font-black text-gray-900 mb-8 pb-6 border-b border-gray-100">Order Summary</h2>
              
              <div className="space-y-5 mb-8">
                <div className="flex justify-between text-gray-500 text-lg font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-lg font-medium">
                  <span>Estimated Tax</span>
                  <span className="text-gray-900 font-bold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-lg font-medium pb-6 border-b border-gray-100">
                  <span>Shipping</span>
                  <span className="text-green-500 font-bold bg-green-50 px-3 py-1 rounded-lg text-sm uppercase tracking-wide">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <span className="text-xl font-bold text-gray-600">Total</span>
                <span className="text-4xl font-black text-orange-600 tracking-tight">${total.toFixed(2)}</span>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold text-xl py-5 rounded-full shadow-[0_8px_30px_rgb(234,88,12,0.3)] hover:shadow-[0_15px_40px_rgb(234,88,12,0.4)] transition-all duration-300 transform hover:-translate-y-1 block text-center"
              >
                Proceed to Checkout
              </button>
              
              <p className="text-center text-gray-400 text-sm mt-6 font-medium flex items-center justify-center gap-2 bg-gray-50 py-2.5 rounded-xl">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Secure 256-bit SSL Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}