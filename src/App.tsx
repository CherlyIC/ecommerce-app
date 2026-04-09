import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserRoute, AdminRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Dashboard from './pages/admin/Dashboard'
import ProductForm from './pages/admin/ProductForm'
import ProductDetail from './pages/ProductDetail'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          <Route path="/cart" element={
            <UserRoute><Cart /></UserRoute>
          } />
          <Route path="/checkout" element={
            <UserRoute><Checkout /></UserRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute><Dashboard /></AdminRoute>
          } />
          <Route path="/admin/product/new" element={
            <AdminRoute><ProductForm /></AdminRoute>
          } />
          <Route path="/admin/product/:id" element={
            <AdminRoute><ProductForm /></AdminRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App