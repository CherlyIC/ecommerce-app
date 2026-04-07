import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProducts, getCategories } from '../api/endpoints'
import type { Product, Category } from '../types'

// ===========================
// PRODUCT CARD COMPONENT
// ===========================
function ProductCard({ product }: { product: Product }) {
  // Handle the image url extraction properly if the backend returns array of objects with .url
  const firstImage = product.images?.[0]
  const imageUrl = typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url || 'https://placehold.co/400x300?text=No+Image'

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-white rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden group border border-gray-100 flex flex-col h-full hover:-translate-y-1"
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden bg-gray-50 h-64 p-4 flex items-center justify-center before:absolute before:inset-0 before:bg-black/0 group-hover:before:bg-black/5 before:transition-colors before:z-10">
        <img
          src={imageUrl}
          alt={(product as any).name || product.title}
          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-in-out mix-blend-multiply"
          onError={(e) => {
            ; (e.target as HTMLImageElement).src =
              'https://placehold.co/400x300?text=No+Image'
          }}
        />
        {product.stock === 0 && (
          <div className="absolute top-4 left-4 z-20 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            Out of Stock
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-4 left-4 z-20 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping mr-1"></span>
            Only {product.stock} left
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-6 flex flex-col flex-1">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <span className="w-4 border-t border-gray-300 inline-block"></span>
          {product.category?.name || 'Uncategorized'}
        </p>
        <h3 className="text-gray-900 font-extrabold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
          {(product as any).name || product.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">{product.description}</p>

        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-gray-400 text-xs font-medium mb-0.5">{product.brand}</p>
            <span className="text-gray-900 font-black text-2xl tracking-tight">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <div className="bg-gray-900 group-hover:bg-orange-500 text-white w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 shadow-md">
            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ===========================
// SKELETON LOADER
// ===========================
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-52 w-full" />
      <div className="p-4 flex flex-col gap-3">
        <div className="bg-gray-200 h-3 w-1/3 rounded-full" />
        <div className="bg-gray-200 h-4 w-3/4 rounded-full" />
        <div className="bg-gray-200 h-3 w-1/4 rounded-full" />
        <div className="flex justify-between items-center mt-2">
          <div className="bg-gray-200 h-5 w-16 rounded-full" />
          <div className="bg-gray-200 h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ===========================
// ERROR STATE
// ===========================
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="text-6xl">😕</div>
      <h2 className="text-xl font-bold text-gray-700">Failed to load products</h2>
      <p className="text-gray-400 text-sm">Something went wrong. Please try again.</p>
      <button
        onClick={onRetry}
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

// ===========================
// EMPTY STATE
// ===========================
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm col-span-full">
      <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-6xl filter grayscale opacity-50">🧭</span>
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">No products found</h2>
      <p className="text-gray-500 text-base max-w-sm mb-6">We couldn't find anything matching your current filters. Try adjusting your search or categories.</p>
    </div>
  )
}

// ===========================
// HOME PAGE
// ===========================
export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // FETCH PRODUCTS
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const response = await getProducts()
        return response.data
      } catch (error: unknown) {
        console.error('Failed to fetch products:', error)
        toast.error('Failed to load products. Please refresh.')
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  // FETCH CATEGORIES
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await getCategories()
        return response.data
      } catch (error: unknown) {
        console.error('Failed to fetch categories:', error)
        return []
      }
    },
    staleTime: 10 * 60 * 1000,
  })

  // FILTER PRODUCTS
  const extractData = (data: any, key: string) => {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data[key])) return data[key]
    if (data && Array.isArray(data.data)) return data.data
    if (data && data.data && Array.isArray(data.data.all)) return data.data.all
    return []
  }

  const allProducts: Product[] = extractData(productsData, 'products')
  const categories: Category[] = extractData(categoriesData, 'categories')

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = selectedCategory
      ? product.category?.id === selectedCategory || (product as any).categoryId === selectedCategory
      : true
    const productName = (product as any).name || product.title || ''
    const matchesSearch = searchQuery
      ? productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#FDFDFD] selection:bg-orange-200">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white min-h-[400px] flex flex-col justify-center">
        {/* Floating background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-amber-300/20 rounded-full blur-3xl animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 py-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl transform transition-all duration-700 hover:scale-[1.02]">
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-semibold tracking-wider uppercase mb-6 shadow-sm">
              ✨ The New Standard
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight drop-shadow-md">
              Shop Smart,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-white">
                Live Better
              </span>
            </h1>
            <p className="text-white/90 text-xl font-medium mb-10 max-w-lg leading-relaxed mix-blend-screen">
              Discover thousands of premium products at unbeatable prices. Curated just for you.
            </p>

            <a
              href="#products"
              className="group relative inline-flex items-center justify-center bg-white text-orange-600 font-bold px-10 py-4 rounded-full overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(234,88,12,0.3)] transition-all duration-300 hover:-translate-y-1"
            >
              <span className="absolute inset-0 bg-orange-50 translate-y-full transition-transform duration-300 group-hover:translate-y-0"></span>
              <span className="relative flex items-center gap-2">
                Start Exploring
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </span>
            </a>
          </div>
          <div className="hidden md:flex relative group">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full transform group-hover:scale-110 transition-transform duration-500"></div>
            <div className="text-[12rem] leading-none select-none drop-shadow-2xl floating-animation transform group-hover:-rotate-6 transition-transform duration-500 rotate-3">
              🛍️
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 p-3 flex items-center gap-4 transition-all duration-300 focus-within:shadow-[0_8px_30px_rgb(234,88,12,0.15)] focus-within:bg-white">
          <div className="bg-orange-100 p-3 rounded-full text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            placeholder="Search for premium products, brands, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400 text-lg font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors flex items-center justify-center group"
              title="Clear search"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div id="products" className="max-w-7xl mx-auto px-4 py-10">

        {/* CATEGORIES FILTER */}
        {categories.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-10 scrollbar-hide snap-x">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5
                ${selectedCategory === null
                  ? 'bg-gray-900 text-white shadow-md hover:shadow-xl hover:bg-gray-800'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
            >
              All Products
            </button>
            {categories.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5
                  ${selectedCategory === cat.id
                    ? 'bg-gray-900 text-white shadow-md hover:shadow-xl hover:bg-gray-800'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* RESULTS COUNT */}
        {!productsLoading && !productsError && (
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <h2 className="text-gray-800 font-bold text-xl flex items-center gap-2">
              <span className="bg-orange-100 text-orange-600 py-1 px-2.5 rounded-md text-sm">{filteredProducts.length}</span>
              Products Found
            </h2>
            {searchQuery && (
              <p className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                Results for: <span className="text-gray-900">"{searchQuery}"</span>
              </p>
            )}
          </div>
        )}

        {/* LOADING */}
        {productsLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ERROR */}
        {productsError && <ErrorState onRetry={refetchProducts} />}

        {/* PRODUCTS GRID */}
        {!productsLoading && !productsError && (
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 mt-16 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 text-white font-bold text-lg px-3 py-1 rounded-lg">
              Z
            </div>
            <span className="text-orange-500 font-bold text-lg">ZuriShop</span>
          </div>
          <p className="text-gray-400 text-sm">
            2026 ZuriShop. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>Free Delivery</span>
            <span>Secure Payment</span>
            <span>Easy Returns</span>
          </div>
        </div>
      </footer>

    </div>
  )
}