import { Link } from 'react-router-dom'

function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText,
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Background Subtle Gradient Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-100/60 blur-[100px]" />

      <div className="w-full max-w-5xl grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Side: Brand Visual & Social Proof with Royal Blue & Emerald Gradient */}
        <aside className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-emerald-700 p-8 sm:p-12 flex flex-col justify-between text-white">
          
          {/* Decorative Circle Accents */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-2xl" />

          <div className="relative z-10 space-y-6">
            <Link to="/login" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-0.5 shadow-lg">
                <span className="text-xl font-black text-blue-700">⚡</span>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">BRO ZONE</span>
                <span className="ml-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300">ARENA</span>
              </div>
            </Link>

            <div className="pt-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3.5 py-1 text-xs font-bold text-emerald-200 border border-white/20">
                🏆 Premier Turf & Court Network
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Book your court.<br />
                <span className="text-emerald-300">
                  Dominating the game starts here.
                </span>
              </h1>
              <p className="mt-3 text-sm text-blue-100 leading-relaxed max-w-md">
                Join over 10,000+ athletes and casual players reserving top-tier football turfs, badminton courts, and cricket boxes instantly.
              </p>
            </div>

            {/* Feature Value Props Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm">
                <div className="text-white text-base font-bold">⚡ Instant Lock</div>
                <div className="text-xs text-blue-100 mt-0.5">Real-time availability & zero collisions.</div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm">
                <div className="text-white text-base font-bold">🛡️ Verified Venues</div>
                <div className="text-xs text-blue-100 mt-0.5">Floodlights, synthetic turf & amenities.</div>
              </div>
            </div>
          </div>

          {/* Social Proof Counter Banner */}
          <div className="relative z-10 pt-8 border-t border-white/20 mt-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-white">50+</div>
                <div className="text-[11px] text-blue-100 uppercase tracking-wider font-semibold">Active Arenas</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="text-2xl font-black text-white">10,000+</div>
                <div className="text-[11px] text-blue-100 uppercase tracking-wider font-semibold">Slots Reserved</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="text-2xl font-black text-emerald-300">4.9 ★</div>
                <div className="text-[11px] text-blue-100 uppercase tracking-wider font-semibold">Player Rating</div>
              </div>
            </div>
          </div>

        </aside>

        {/* Right Side: Clean Form Container */}
        <section className="p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div className="w-full max-w-sm mx-auto my-auto py-4">
            
            <div className="mb-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600">
                Portal Access
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-sm text-slate-600">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Fields */}
            {children}

            {/* Footer Navigation */}
            {footerText && (
              <p className="mt-6 text-center text-xs text-slate-600">
                {footerText}{' '}
                <Link
                  to={footerLink}
                  className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
                >
                  {footerLinkText}
                </Link>
              </p>
            )}

          </div>
        </section>

      </div>
    </div>
  )
}

export default AuthLayout