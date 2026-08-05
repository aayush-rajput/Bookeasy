import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Home, DollarSign, Calendar, MapPin, Clock, ShieldCheck } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export default async function AdminPortalPage() {
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
        <p className="text-[#050315]/60">This panel is only accessible to admins. Use the role switcher on the Overview page.</p>
      </div>
    )
  }

  // Fetch ALL bookings with customer, space, and vendor info
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      users!bookings_user_id_fkey (id, full_name, email, role),
      spaces (
        id, name, location, price_per_hour,
        users!spaces_vendor_id_fkey (id, full_name, email)
      )
    `)
    .order('created_at', { ascending: false })

  // Platform stats
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user')
  const { count: vendorCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'vendor')
  const { count: spaceCount } = await supabase.from('spaces').select('*', { count: 'exact', head: true })

  const totalRevenue = bookings?.filter(b => b.status === 'confirmed').reduce((s, b) => s + Number(b.total_price), 0) || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-futura font-bold text-[#1E0D73]">Admin Portal</h1>
        <p className="text-[#050315]/70 mt-1">Full platform overview — all bookings, vendors, and customers</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: userCount || 0, icon: <Users className="h-5 w-5 text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Total Vendors', value: vendorCount || 0, icon: <Home className="h-5 w-5 text-[#FF9800]" />, color: 'bg-orange-50' },
          { label: 'Total Spaces', value: spaceCount || 0, icon: <MapPin className="h-5 w-5 text-purple-600" />, color: 'bg-purple-50' },
          { label: 'Platform Revenue', value: `$${totalRevenue}`, icon: <DollarSign className="h-5 w-5 text-green-600" />, color: 'bg-green-50' },
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

      {/* All Bookings Table */}
      <div className="bg-white rounded-2xl border border-[#B7BDB7]/20 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#B7BDB7]/20 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-[#1E0D73]" />
          <h2 className="text-lg font-bold text-[#050315]">All Bookings ({bookings?.length || 0})</h2>
        </div>

        {!bookings || bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <h3 className="font-bold text-[#1E0D73] mb-2">No bookings yet</h3>
            <p className="text-sm text-[#050315]/60">Bookings will appear here once customers start reserving spaces.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F4F1EB]">
                <tr>
                  <th className="text-left px-6 py-3 text-[#050315]/60 font-medium">Customer</th>
                  <th className="text-left px-6 py-3 text-[#050315]/60 font-medium">Space</th>
                  <th className="text-left px-6 py-3 text-[#050315]/60 font-medium">Vendor</th>
                  <th className="text-left px-6 py-3 text-[#050315]/60 font-medium">Date & Time</th>
                  <th className="text-left px-6 py-3 text-[#050315]/60 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 text-[#050315]/60 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B7BDB7]/10">
                {bookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-[#F4F1EB]/50 transition-colors">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {booking.users?.full_name?.charAt(0) || booking.users?.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-[#050315]">{booking.users?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-[#050315]/50">{booking.users?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Space */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#050315]">{booking.spaces?.name}</p>
                      <div className="flex items-center gap-1 text-xs text-[#050315]/50 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {booking.spaces?.location}
                      </div>
                    </td>

                    {/* Vendor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#FF9800]/20 text-[#FF9800] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(booking.spaces?.users as any)?.full_name?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <p className="font-medium text-[#050315]">{(booking.spaces?.users as any)?.full_name || 'Vendor'}</p>
                          <p className="text-xs text-[#050315]/50">{(booking.spaces?.users as any)?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[#050315]/70">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(booking.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <p className="text-xs text-[#050315]/50 mt-0.5">
                        {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1E0D73]">${booking.total_price}</p>
                      <p className="text-xs text-[#050315]/50">${booking.spaces?.price_per_hour}/hr</p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${statusColors[booking.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
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
    </div>
  )
}
