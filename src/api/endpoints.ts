import api from './axios'
import type {
  LoginCredentials,
  RegisterCredentials,
  CreateProductInput,
  CreateOrderInput,
  OrderStatus,
} from '../types'
export const loginUser = (credentials: LoginCredentials) =>
  api.post('/api/auth/users/login', credentials)

export const registerUser = (credentials: RegisterCredentials) =>
  api.post('/api/auth/users/register', credentials)

export const getCurrentUser = () =>
  api.get('/api/auth/users/me')


export const getProducts = () =>
  api.get('/api/public/products')

export const getProductById = (id: number | string) =>
  api.get(`/api/public/products/${id}`)

export const getProductsByCategory = (categoryId: number) =>
  api.get(`/api/public/products/category/${categoryId}`)


export const createProduct = (data: CreateProductInput) =>
  api.post('/api/admin/products', data)

export const updateProduct = (id: number | string, data: CreateProductInput) =>
  api.patch(`/api/admin/products/${id}`, data)

export const deleteProduct = (id: number | string) =>
  api.delete(`/api/admin/products/${id}`)


export const getCategories = () =>
  api.get('/api/categories')

export const createCategory = (name: string) =>
  api.post('/api/categories', { name })

export const updateCategory = (id: number, name: string) =>
  api.put(`/api/categories/${id}`, { name })

export const deleteCategory = (id: number) =>
  api.delete(`/api/categories/${id}`)

export const getCart = () =>
  api.get('/api/auth/cart')

export const addToCart = (productId: number | string, quantity: number) =>
  api.post('/api/auth/cart/items', { productId, quantity })

export const updateCartItem = (itemId: number, quantity: number) =>
  api.patch(`/api/auth/cart/items/${itemId}`, { quantity })

export const removeCartItem = (itemId: number) =>
  api.delete(`/api/auth/cart/items/${itemId}`)

export const clearCart = () =>
  api.delete('/api/auth/cart')


export const placeOrder = (data: CreateOrderInput) =>
  api.post('/api/auth/orders', data)

export const getMyOrders = () =>
  api.get('/api/auth/orders')

export const getOrderById = (id: number) =>
  api.get(`/api/auth/orders/${id}`)


export const getAllOrders = () =>
  api.get('/api/auth/orders/admin/all')

export const updateOrderStatus = (id: number, status: OrderStatus) =>
  api.patch(`/api/auth/orders/${id}/status`, { status })