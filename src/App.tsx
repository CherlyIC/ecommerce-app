import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Dashboard from './pages/admin/Dashboard'
import ProductForm from './pages/admin/ProductForm'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/product/new" element={<ProductForm />} />
          <Route path="/admin/product/:id" element={<ProductForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App