import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  getProducts, deleteProduct, 
  getAllOrders, updateOrderStatus,
  getCategories, createCategory, deleteCategory 
} from '../../api/endpoints'
import type { Product, Category, OrderStatus } from '../../types'

export default function Dashboard() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories'>('products')
  const [newCategoryName, setNewCategoryName] = useState('')


  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const res = await getProducts()
      return res.data
    }
  })

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const res = await getAllOrders()
      return res.data
    }
  })

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const res = await getCategories()
      return res.data
    }
  })

  const extractData = (data: any, key: string) => {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data[key])) return data[key]
    if (data && Array.isArray(data.data)) return data.data
    if (data && data.data && Array.isArray(data.data.all)) return data.data.all
    return []
  }

  const products: Product[] = extractData(productsData, 'products')
  const orders: any[] = extractData(ordersData, 'orders')
  const categories: Category[] = extractData(categoriesData, 'categories')

  const delProductMut = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      toast.success('Product deleted')
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] })
    },
    onError: () => toast.error('Failed to delete product')
  })

  const updateOrderStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: number, status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated')
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] })
    },
    onError: () => toast.error('Failed to update status')
  })

  const createCategoryMut = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => {
      setNewCategoryName('')
      toast.success('Category created')
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] })
    },
    onError: () => toast.error('Failed to create category')
  })

  const deleteCategoryMut = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted')
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] })
    },
    onError: () => toast.error('Failed to delete category')
  })

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      delProductMut.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your storefront inventory, orders, and categories.</p>
          </div>
          <Link
            to="/admin/product/new"
            className="bg-gray-900 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold transition-all shadow-[0_8px_30px_rgb(0,0,0,0.1)] inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
            Add New Product
          </Link>
        </div>

        <div className="flex gap-4 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('products')} 
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'products' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'orders' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('categories')} 
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'categories' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Categories
          </button>
        </div>
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
          
          {activeTab === 'products' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Inventory Management</h2>
              {isLoadingProducts ? (
                <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Loading products...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm string text-gray-400 uppercase tracking-widest font-bold">
                        <th className="pb-4 px-4">Image</th>
                        <th className="pb-4 px-4 min-w-[200px]">Product Name</th>
                        <th className="pb-4 px-4">Brand</th>
                        <th className="pb-4 px-4">Price</th>
                        <th className="pb-4 px-4">Stock</th>
                        <th className="pb-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const firstImage = p.images?.[0];
                        const imageUrl = typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url || 'https://placehold.co/400x300';
                        return (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                            <td className="py-4 px-4">
                              <img src={imageUrl} className="w-12 h-12 rounded-xl object-contain bg-white shadow-sm border border-gray-100" />
                            </td>
                            <td className="py-4 px-4 font-bold text-gray-900">{(p as any).name || p.title}</td>
                            <td className="py-4 px-4 text-gray-500">{p.brand}</td>
                            <td className="py-4 px-4 font-bold text-gray-900">${(p.price || 0).toFixed(2)}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link to={`/admin/product/${p.id}`} className="text-gray-400 hover:text-blue-500 bg-white shadow-sm rounded-lg p-2 transition-colors">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </Link>
                                <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-400 hover:text-red-500 bg-white shadow-sm rounded-lg p-2 transition-colors disabled:opacity-50">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {products.length === 0 && <p className="text-center text-gray-500 py-10 font-bold">No products found. Start by creating one!</p>}
                </div>
              )}
            </div>
          )}


          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Orders</h2>
              {isLoadingOrders ? (
                <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Loading orders...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-400 uppercase tracking-widest font-bold">
                        <th className="pb-4 px-4">Order ID</th>
                        <th className="pb-4 px-4">Customer</th>
                        <th className="pb-4 px-4">Total</th>
                        <th className="pb-4 px-4">Date</th>
                        <th className="pb-4 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4 font-mono text-sm text-gray-500">#{o.id}</td>
                          <td className="py-4 px-4 font-bold text-gray-900">{o.customerName || 'N/A'}</td>
                          <td className="py-4 px-4 font-bold text-orange-600">${(o.total || 0).toFixed(2)}</td>
                          <td className="py-4 px-4 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-right">
                            <select 
                              value={o.status}
                              onChange={(e) => updateOrderStatusMut.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                              disabled={updateOrderStatusMut.isPending}
                              className={`text-sm font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                                o.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                                o.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-orange-50 text-orange-700 border-orange-200'
                              }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <p className="text-center text-gray-500 py-10 font-bold">No orders found.</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Product Categories</h2>
              
              <div className="flex gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <input 
                  type="text" 
                  placeholder="New category name..." 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                <button 
                  onClick={() => {
                    if (newCategoryName.trim()) createCategoryMut.mutate(newCategoryName)
                  }}
                  disabled={createCategoryMut.isPending || !newCategoryName.trim()}
                  className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl transition-all hover:bg-gray-800 disabled:opacity-50"
                >
                  Create
                </button>
              </div>

              {isLoadingCategories ? (
                <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Loading categories...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-300 transition-colors shadow-sm group">
                      <span className="font-bold text-gray-800">{c.name}</span>
                      <button 
                        onClick={() => {
                          if(window.confirm('Delete category?')) deleteCategoryMut.mutate(c.id)
                        }}
                        className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && <p className="col-span-full text-center text-gray-500 py-10 font-bold">No categories exist.</p>}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}