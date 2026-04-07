import { useEffect, useState } from 'react'
import { getProducts } from '../api/endpoints'

function Home() {
  const [status, setStatus] = useState('Testing API...')

  useEffect(() => {
    getProducts()
      .then(() => setStatus('✅ API is connected and working!'))
      .catch((err) => {
        console.error(err)
        setStatus('❌ API connection failed')
      })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🏠 Home</h1>
      <p className="text-lg">{status}</p>
    </div>
  )
}

export default Home