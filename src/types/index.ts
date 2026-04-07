export type UserRole = 'ADMIN' | 'USER'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Category {
  id: number
  name: string
}

export interface Product {
  id: number
  title: string
  description: string
  price: number
  stock: number
  brand: string
  images: string[]
  category: Category
}

export interface CreateProductInput {
  title: string
  description: string
  price: number
  stock: number
  brand: string
  images: string[]
  categoryId: number
}

export interface CartItem {
  id: number
  product: Product
  quantity: number
}

export interface Cart {
  id: number
  items: CartItem[]
  total: number
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'PAYPAL'
  | 'MOBILE_MONEY'
  | 'CASH_ON_DELIVERY'

export interface Order {
  id: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  total: number
  items: CartItem[]
  createdAt: string
  user?: User
}

export interface CreateOrderInput {
  fullName: string
  address: string
  city: string
  postalCode?: string
  phone: string
  email: string
  paymentMethod: PaymentMethod
}