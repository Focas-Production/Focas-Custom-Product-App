import { useState, useEffect } from 'react'
import ProductsPage from './pages/ProductsPage'
import CheckoutPage from './pages/CheckoutPage'
import SuccessPage from './pages/SuccessPage'
import Header from './components/Header'
import Footer from './components/Footer'
import { api } from './api'

function priceForCombo(p) {
  return p.comboPrice ?? p.price ?? 0
}

/**
 * Read product id(s) from the shareable URL so a direct link opens the
 * checkout form straight away. Supported formats:
 *   /product/<id>                (pretty path)
 *   /checkout/<id>               (pretty path)
 *   ?product=<id>                (single)
 *   ?products=<id1>,<id2>        (multiple, comma-separated)
 */
function productIdsFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const qs = params.get('products') || params.get('product')
  if (qs) return qs.split(',').map((s) => s.trim()).filter(Boolean)

  const m = window.location.pathname.match(/\/(?:product|checkout)\/([^/?#]+)/i)
  return m ? [decodeURIComponent(m[1])] : []
}

export default function App() {
  const [view, setView] = useState('products')
  const [cartProducts, setCartProducts] = useState([])
  const [order, setOrder] = useState(null)

  // Direct-link state: when the URL carries product id(s) we fetch them and
  // jump straight to the checkout form.
  const [directLoading, setDirectLoading] = useState(() => productIdsFromUrl().length > 0)
  const [directError, setDirectError] = useState('')

  useEffect(() => {
    const ids = productIdsFromUrl()
    if (ids.length === 0) return

    let cancelled = false
    ;(async () => {
      try {
        const results = await Promise.all(ids.map((id) => api.getProduct(id)))
        if (cancelled) return
        const products = results.map((r) => r.product).filter(Boolean)
        if (products.length === 0) throw new Error('Product not found')
        setCartProducts(products)
        setView('checkout')
      } catch (err) {
        if (!cancelled) setDirectError(err.message || 'Could not load this product')
      } finally {
        if (!cancelled) setDirectLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [])

  const cartTotal = cartProducts.reduce((sum, p) => sum + priceForCombo(p), 0)

  function handleCheckout(selectedProducts) {
    setCartProducts(selectedProducts)
    setView('checkout')
  }

  function handleSuccess(orderInfo) {
    setOrder(orderInfo)
    setView('success')
  }

  function goToProducts() {
    // Drop any product id from the URL so the store list is a clean landing.
    if (window.location.pathname !== '/' || window.location.search) {
      window.history.replaceState({}, '', '/')
    }
    setCartProducts([])
    setOrder(null)
    setDirectError('')
    setView('products')
  }

  // Loading screen while a direct product link is being resolved.
  if (directLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading your order…</p>
      </div>
    )
  }

  // The direct product link could not be resolved.
  if (directError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl">!</div>
        <div>
          <p className="font-semibold text-gray-900">This product link is invalid or unavailable</p>
          <p className="text-sm text-gray-500 mt-1">{directError}</p>
        </div>
        <button
          onClick={goToProducts}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Browse all products
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        view={view}
        onBack={goToProducts}
        cartCount={cartProducts.length}
        cartTotal={cartTotal}
        onCheckout={() => setView('checkout')}
      />

      <main className="flex-1">
        {view === 'checkout' && (
          <CheckoutPage
            cartProducts={cartProducts}
            onSuccess={handleSuccess}
            onBack={goToProducts}
          />
        )}
        {view === 'success' && (
          <SuccessPage
            order={order}
            onContinue={goToProducts}
          />
        )}
        {view === 'products' && (
          <ProductsPage
            onCheckout={handleCheckout}
            // pass cart state down so the header cart button works too
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
