import { login, signup } from './actions'
import Link from 'next/link'
import { ArrowLeft, Building2, User, ShieldCheck, CalendarCheck, Star, MapPin } from 'lucide-react'

const roleConfig = {
  user: {
    label: 'Customer',
    icon: User,
    color: 'from-[#1E0D73] to-[#3D2A9C]',
    accent: '#1E0D73',
    lightBg: 'bg-[#1E0D73]/10',
    badge: 'text-[#1E0D73] bg-[#1E0D73]/10',
    description: 'Find and book the perfect space for your next event',
    perks: ['Browse 1000+ venues', 'Instant booking', 'Best price guarantee'],
    illustration: '🏛️',
  },
  vendor: {
    label: 'Vendor',
    icon: Building2,
    color: 'from-[#FF9800] to-[#F57C00]',
    accent: '#FF9800',
    lightBg: 'bg-[#FF9800]/10',
    badge: 'text-[#FF9800] bg-[#FF9800]/10',
    description: 'List your spaces and reach thousands of customers',
    perks: ['Easy space listing', 'Real-time bookings', 'Revenue analytics'],
    illustration: '🏢',
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    color: 'from-[#7B2D8B] to-[#4A1460]',
    accent: '#7B2D8B',
    lightBg: 'bg-[#7B2D8B]/10',
    badge: 'text-[#7B2D8B] bg-[#7B2D8B]/10',
    description: 'Manage the entire BookEasy platform',
    perks: ['Full platform access', 'User management', 'Analytics & reports'],
    illustration: '⚙️',
  },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; role?: string }>
}) {
  const { message, role: roleParam } = await searchParams
  const role = (roleParam && roleParam in roleConfig ? roleParam : 'user') as keyof typeof roleConfig
  const config = roleConfig[role]
  const Icon = config.icon

  return (
    <div className="min-h-screen flex font-poppins">
      {/* LEFT PANEL — Branding */}
      <div className={`hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br ${config.color} p-12 text-white relative overflow-hidden`}>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <Link href="/" className="font-futura text-3xl font-bold tracking-tight">
          BookEasy
        </Link>

        {/* Role Illustration */}
        <div className="text-center">
          <div className="text-9xl mb-8 drop-shadow-2xl">{config.illustration}</div>
          <h2 className="text-4xl font-futura font-bold mb-4 leading-tight">
            {role === 'user' && 'Find Your Perfect Space'}
            {role === 'vendor' && 'Grow Your Business'}
            {role === 'admin' && 'Platform Control Center'}
          </h2>
          <p className="text-white/80 text-lg mb-8">{config.description}</p>
          <div className="space-y-3">
            {config.perks.map(perk => (
              <div key={perk} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                <Star className="h-4 w-4 fill-white flex-shrink-0" />
                <span className="font-medium">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
          <p className="text-white/90 italic text-sm mb-3">
            "BookEasy transformed how we manage our venue bookings. 10x better than before!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">R</div>
            <div>
              <p className="font-bold text-sm">Rahul Sharma</p>
              <p className="text-white/60 text-xs">Event Manager, Mumbai</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-[#F4F1EB]">
        <div className="w-full max-w-md">

          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#050315]/60 hover:text-[#1E0D73] mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Role Tabs */}
          <div className="bg-white rounded-2xl border border-[#B7BDB7]/20 shadow-sm p-1.5 flex gap-1 mb-8">
            {(Object.entries(roleConfig) as [keyof typeof roleConfig, typeof roleConfig[keyof typeof roleConfig]][]).map(([key, cfg]) => {
              const TabIcon = cfg.icon
              const isActive = role === key
              return (
                <Link
                  key={key}
                  href={`/login?role=${key}`}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${cfg.color} text-white shadow-sm`
                      : 'text-[#050315]/60 hover:text-[#050315] hover:bg-[#F4F1EB]'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{cfg.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-[#B7BDB7]/20 shadow-sm p-8">
            {/* Header */}
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${config.badge}`}>
                <Icon className="h-3.5 w-3.5" />
                {config.label} Portal
              </div>
              <h1 className="text-2xl font-futura font-bold text-[#1E0D73]">Welcome Back</h1>
              <p className="text-[#050315]/60 text-sm mt-1">Sign in or create your {config.label.toLowerCase()} account</p>
            </div>

            {/* Error message */}
            {message && (
              <div className="mb-5 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-start gap-2">
                <span className="text-lg leading-none">⚠️</span>
                <span>{message}</span>
              </div>
            )}

            <form className="space-y-4">
              {/* Hidden role field */}
              <input type="hidden" name="role" value={role} />

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#050315] mb-1.5" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#B7BDB7]/50 bg-[#F4F1EB]/50 focus:outline-none focus:ring-2 focus:ring-[#1E0D73] focus:border-transparent text-[#050315] placeholder:text-[#050315]/40 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#050315] mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#B7BDB7]/50 bg-[#F4F1EB]/50 focus:outline-none focus:ring-2 focus:ring-[#1E0D73] focus:border-transparent text-[#050315] placeholder:text-[#050315]/40 transition-all"
                />
              </div>

              {/* Full Name (signup) */}
              <div>
                <label className="block text-sm font-medium text-[#050315] mb-1.5" htmlFor="full_name">
                  Full name <span className="text-[#050315]/40 text-xs">(only for sign up)</span>
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Aayush Rajput"
                  className="w-full px-4 py-3 rounded-xl border border-[#B7BDB7]/50 bg-[#F4F1EB]/50 focus:outline-none focus:ring-2 focus:ring-[#1E0D73] focus:border-transparent text-[#050315] placeholder:text-[#050315]/40 transition-all"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  formAction={login}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${config.color} hover:opacity-90 transition-opacity shadow-sm`}
                >
                  Sign In
                </button>
                {role !== 'admin' && (
                  <button
                    formAction={signup}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm border-2 border-[#B7BDB7]/50 text-[#050315]/70 hover:border-[#1E0D73] hover:text-[#1E0D73] transition-colors bg-white"
                  >
                    Sign Up
                  </button>
                )}
              </div>

              {role === 'admin' && (
                <p className="text-xs text-center text-[#050315]/50 pt-2">
                  Admin accounts are created by the platform. Contact support if you need access.
                </p>
              )}
            </form>
          </div>

          {/* Role hint */}
          <p className="text-center text-xs text-[#050315]/50 mt-6">
            Not a {config.label.toLowerCase()}?{' '}
            {role !== 'user' && <Link href="/login?role=user" className="text-[#1E0D73] font-medium hover:underline">Login as Customer</Link>}
            {role !== 'vendor' && role !== 'user' && ' · '}
            {role !== 'vendor' && <Link href="/login?role=vendor" className="text-[#FF9800] font-medium hover:underline">{role === 'user' ? 'List your space as a Vendor' : 'Login as Vendor'}</Link>}
          </p>
        </div>
      </div>
    </div>
  )
}
