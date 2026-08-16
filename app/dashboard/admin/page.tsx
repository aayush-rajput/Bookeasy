import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Home, DollarSign, Calendar, MapPin, Clock, ShieldCheck, ChevronDown } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export default async function AdminPortalPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams
  const activeTab = searchParams.tab === 'customers' ? 'customers' : 'vendors'
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check admin role
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center">
        <ShieldCheck className="h-16 w-16 text-[#1E0D73]/20 mb-4" />
        <h2 className="text-xl font-bold text-[#1E0D73] mb-2">Access Restricted</h2>
        <p className="text-[#050315]/60">This panel is only accessible to admins.</p>
      </div>
    )
  }

  // Platform stats
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user')
  const { count: vendorCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'vendor')
  const { count: spaceCount } = await supabase.from('spaces').select('*', { count: 'exact', head: true })

  let tabContent = null

  if (activeTab === 'vendors') {
    // Fetch all spaces with their bookings
    const { data: spaces } = await supabase
      .from('spaces')
      .select(`
        *,
        users!spaces_vendor_id_fkey (full_name, email),
        bookings (
          id, start_time, end_time, status, total_price, guests,
          users!bookings_user_id_fkey (full_name, email)
        )
      `)
      .order('created_at', { ascending: false })

    tabContent = (
      <div className="space-y-6">
        {spaces?.map((space) => {
          const bookings = (space.bookings as any[]) || []
          return (
            <details key={space.id} className="group bg-white rounded-2xl border border-[#B7BDB7]/20 shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#F4F1EB]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {space.images?.[0] ? (
                      <img src={space.images[0]} alt={space.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-2xl">🏛️</div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#050315] text-lg">{space.name}</h3>
                      <span className="bg-[#1E0D73]/10 text-[#1E0D73] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {space.category}
                      </span>
                    </div>
                    <p className="text-sm text-[#050315]/60 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {space.location}
                    </p>
                    <p className="text-xs text-[#050315]/50 mt-1">Vendor: {(space.users as any)?.full_name || (space.users as any)?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1E0D73]">{bookings.length} Bookings</p>
                    <p className="text-xs text-[#050315]/50">Click to expand</p>
                  </div>
                  <ChevronDown className="h-5 w-5 text-[#050315]/40 group-open:rotate-180 transition-transform" />
                </div>
              </summary>
              <div className="border-t border-[#B7BDB7]/20 bg-[#F4F1EB]/30 p-5">
                {bookings.length === 0 ? (
                  <p className="text-sm text-[#050315]/50 italic">No bookings for this space.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[#050315]/60">
                          <th className="pb-2 font-medium">Customer</th>
                          <th className="pb-2 font-medium">Date & Time</th>
                          <th className="pb-2 font-medium">Guests</th>
                          <th className="pb-2 font-medium">Amount</th>
                          <th className="pb-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#B7BDB7]/10">
                        {bookings.map(booking => (
                          <tr key={booking.id}>
                            <td className="py-3 font-medium text-[#050315]">{booking.users?.full_name || booking.users?.email}</td>
                            <td className="py-3 text-[#050315]/70">
                              {new Date(booking.start_time).toLocaleDateString()} · {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3 text-[#050315]/70">{booking.guests}</td>
                            <td className="py-3 font-bold text-[#1E0D73]">${booking.total_price}</td>
                            <td className="py-3">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${statusColors[booking.status]}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </details>
          )
        })}
      </div>
    )
  } else {
    // Fetch customers and their bookings
    const { data: customers } = await supabase
      .from('users')
      .select(`
        id, full_name, email,
        bookings (
          id, start_time, end_time, status, total_price, guests,
          spaces (name, category, location)
        )
      `)
      .eq('role', 'user')
      .order('created_at', { ascending: false })

    tabContent = (
      <div className="space-y-6">
        {customers?.map((customer) => {
          const bookings = (customer.bookings as any[]) || []
          return (
            <details key={customer.id} className="group bg-white rounded-2xl border border-[#B7BDB7]/20 shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#F4F1EB]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1E0D73]/10 text-[#1E0D73] flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {customer.full_name?.charAt(0) || customer.email?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#050315] text-lg">{customer.full_name || 'Unnamed Customer'}</h3>
                    <p className="text-sm text-[#050315]/60">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1E0D73]">{bookings.length} Bookings</p>
                    <p className="text-xs text-[#050315]/50">Click to expand</p>
                  </div>
                  <ChevronDown className="h-5 w-5 text-[#050315]/40 group-open:rotate-180 transition-transform" />
                </div>
              </summary>
              <div className="border-t border-[#B7BDB7]/20 bg-[#F4F1EB]/30 p-5">
                {bookings.length === 0 ? (
                  <p className="text-sm text-[#050315]/50 italic">This customer hasn't made any bookings.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[#050315]/60">
                          <th className="pb-2 font-medium">Space</th>
                          <th className="pb-2 font-medium">Category</th>
                          <th className="pb-2 font-medium">Date & Time</th>
                          <th className="pb-2 font-medium">Amount</th>
                          <th className="pb-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#B7BDB7]/10">
                        {bookings.map(booking => (
                          <tr key={booking.id}>
                            <td className="py-3 font-medium text-[#050315]">{booking.spaces?.name}</td>
                            <td className="py-3 text-[#050315]/70">{booking.spaces?.category}</td>
                            <td className="py-3 text-[#050315]/70">
                              {new Date(booking.start_time).toLocaleDateString()}
                            </td>
                            <td className="py-3 font-bold text-[#1E0D73]">${booking.total_price}</td>
                            <td className="py-3">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${statusColors[booking.status]}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </details>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-futura font-bold text-[#1E0D73]">Admin Portal</h1>
        <p className="text-[#050315]/70 mt-1">Full platform overview — manage vendors and customers</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: userCount || 0, icon: <Users className="h-5 w-5 text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Total Vendors', value: vendorCount || 0, icon: <Home className="h-5 w-5 text-[#FF9800]" />, color: 'bg-orange-50' },
          { label: 'Total Spaces', value: spaceCount || 0, icon: <MapPin className="h-5 w-5 text-purple-600" />, color: 'bg-purple-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#B7BDB7]/20 p-5 shadow-sm">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-[#1E0D73]">{stat.value}</p>
            <p className="text-sm text-[#050315]/60">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[#B7BDB7]/30">
        <Link
          href="/dashboard/admin?tab=vendors"
          className={`px-6 py-3 rounded-t-xl font-bold transition-colors whitespace-nowrap ${
            activeTab === 'vendors'
              ? 'bg-[#1E0D73] text-white'
              : 'bg-white text-[#050315]/60 hover:text-[#1E0D73] hover:bg-[#1E0D73]/5'
          }`}
        >
          Vendor Spaces
        </Link>
        <Link
          href="/dashboard/admin?tab=customers"
          className={`px-6 py-3 rounded-t-xl font-bold transition-colors whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-[#1E0D73] text-white'
              : 'bg-white text-[#050315]/60 hover:text-[#1E0D73] hover:bg-[#1E0D73]/5'
          }`}
        >
          Customers
        </Link>
      </div>

      {/* Tab Content */}
      {tabContent}
    </div>
  )
}
