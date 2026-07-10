export default function Header({ view, onBack, cartCount, cartTotal, onCheckout }) {
  const stepMap = { products: 0, checkout: 1, success: 2 }
  const activeStep = stepMap[view] ?? 0

  return (
    <header style={{ background: '#0f172a' }} className="sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          {view !== 'products' && (
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1 mr-1"
            >
              ← Back
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="bg-white rounded-lg px-2 py-1 flex items-center">
              <img src="/focas-logo.png" alt="FOCAS Edu" className="h-6 w-auto" />
            </div>
            <span className="text-slate-400 text-xs font-medium hidden sm:inline border-l border-slate-700 pl-2.5">
              Course Store
            </span>
          </div>
        </div>

        {/* Nav links — products page only */}
        {view === 'products' && (
          <nav className="hidden md:flex items-center gap-6">
            {['Courses', 'Kit Books', 'Bundles', 'About'].map((item) => {
              return (
                <a key={item} href="#" className="text-slate-300 hover:text-white text-sm transition-colors">
                  {item}
                </a>
              )
            })}
          </nav>
        )}

        {/* Stepper — checkout / success pages */}
        {(view === 'checkout' || view === 'success') && (
          <div className="flex items-center gap-2">
            {['Products', 'Checkout', 'Confirmed'].map((step, i) => {
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${i <= activeStep ? 'text-blue-400' : 'text-slate-600'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < activeStep ? 'bg-blue-600 text-white' :
                      i === activeStep ? 'bg-blue-600 text-white' :
                      'bg-slate-700 text-slate-500'
                    }`}>
                      {i < activeStep ? '✓' : i + 1}
                    </span>
                    <span className="hidden sm:inline">{step}</span>
                  </div>
                  {i < 2 && <span className="text-slate-700 text-xs">—</span>}
                </div>
              )
            })}
          </div>
        )}

        {/* Cart button — products page */}
        {view === 'products' && cartCount > 0 && (
          <button
            onClick={onCheckout}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <span>🛒</span>
            <span>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
            <span className="font-bold">· ₹{cartTotal.toLocaleString('en-IN')}</span>
            <span>→</span>
          </button>
        )}

      </div>
    </header>
  )
}