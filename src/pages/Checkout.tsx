import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { getCart, placeOrder } from '../api/endpoints'
import type { Cart as CartType, CreateOrderInput } from '../types'

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  address: z.string().min(1, 'Shipping Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  email: z.string().email('Must be a valid email address'),
  paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'MOBILE_MONEY', 'CASH_ON_DELIVERY']),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function Checkout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: cartResponse, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await getCart();
      return response.data;
    }
  })

  const orderMutation = useMutation({
    mutationFn: (data: CreateOrderInput) => placeOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('🎉 Order placed successfully!')
      navigate('/profile')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to place order')
    }
  })

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: {
      paymentMethod: 'CREDIT_CARD'
    }
  })

  const { register, handleSubmit, formState: { errors }, watch } = form

  const onSubmit = (data: CheckoutFormValues) => {
    orderMutation.mutate(data)
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-orange-500 font-bold">Loading Checkout...</div>

  const cart: CartType = cartResponse?.data || cartResponse || { items: [], total: 0 }
  const items = Array.isArray(cart.items) ? cart.items : []

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-3xl font-black text-gray-900 mb-4">Your cart is empty</h2>
        <Link to="/cart" className="text-orange-500 hover:text-orange-600 font-bold underline">Go back to Cart</Link>
      </div>
    )
  }

  const subtotal = items.reduce((acc: number, item: any) => acc + ((item.product?.price || 0) * item.quantity), 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
        
        <div className="flex-1">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Secure Checkout</h1>
            <p className="text-gray-500">Please complete the details below to finalize your order.</p>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input
                    {...register('fullName')}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'} outline-none transition-all`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.fullName.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'} outline-none transition-all`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.email.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input
                    {...register('phone')}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'} outline-none transition-all`}
                    placeholder="1234567890"
                  />
                  {errors.phone && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.phone.message}</span>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                  <input
                    {...register('address')}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'} outline-none transition-all`}
                    placeholder="123 Main St"
                  />
                  {errors.address && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.address.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                  <input
                    {...register('city')}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'} outline-none transition-all`}
                    placeholder="New York"
                  />
                  {errors.city && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.city.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Postal Code</label>
                  <input
                    {...register('postalCode')}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.postalCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'} outline-none transition-all`}
                    placeholder="10001"
                  />
                  {errors.postalCode && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.postalCode.message}</span>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['CREDIT_CARD', 'PAYPAL', 'MOBILE_MONEY', 'CASH_ON_DELIVERY'].map((method) => (
                  <label 
                    key={method} 
                    className={`border rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all ${watch('paymentMethod') === method ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      value={method}
                      {...register('paymentMethod')}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="font-bold text-gray-800 text-sm tracking-wide">
                      {method.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
              {errors.paymentMethod && <span className="text-red-500 text-xs font-bold mt-2 block">{errors.paymentMethod.message}</span>}
            </div>

          </form>
        </div>

        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-white rounded-[3rem] p-8 lg:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.05)] border border-gray-100/50 sticky top-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 pb-6 border-b border-gray-100">Review Order</h2>

            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item: any) => {
                const product = item.product;
                const firstImage = product?.images?.[0];
                const imageUrl = typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url || 'https://placehold.co/400x300?text=No+Image';

                return (
                  <div key={item.id} className="flex gap-4">
                    <img src={imageUrl} className="w-16 h-16 rounded-xl object-contain bg-gray-50 border border-gray-100 mix-blend-multiply flex-shrink-0 p-1" alt="" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{(product as any).name || product?.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-black text-gray-900 mt-1">${((product?.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-4 mb-8 border-t border-gray-100 pt-6">
              <div className="flex justify-between text-gray-500 text-sm font-bold">
                <span>Subtotal</span>
                <span className="text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm font-bold">
                <span>Estimated Tax</span>
                <span className="text-gray-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm font-bold pb-6 border-b border-gray-100">
                <span>Shipping</span>
                <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-md">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-gray-600 font-bold">Total</span>
              <span className="text-3xl font-black text-orange-600 tracking-tight">${total.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={orderMutation.isPending}
              className="w-full bg-gray-900 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_15px_40px_rgb(234,88,12,0.3)] transition-all duration-300 transform hover:-translate-y-1 block text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {orderMutation.isPending ? 'Processing...' : 'Place Order Now'}
            </button>
            <Link to="/cart" className="block text-center text-sm text-gray-500 font-bold hover:text-orange-500 mt-4 underline decoration-gray-300 underline-offset-4">
              Return to Cart
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}