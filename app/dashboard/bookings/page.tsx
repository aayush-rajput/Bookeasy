import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar, MapPin, Clock, DollarSign } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export default async function MyBookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  const isVendor = profile?.role === 'vendor'

  // For vendors: bookings for their spaces. For users: their own bookings
  let bookings: any[] = []

  if (isVendor) {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        users!bookings_user_id_fkey (full_name, email),
        spaces (name, location, price_per_hour, images)
      `)
      .order('created_at', { ascending: false })

    // Filter to only this vendor's spaces
    const { data: mySpaces } = await supabase.from('spaces').select('id').eq('vendor_id', user.id)
    const mySpaceIds = new Set(mySpaces?.map(s => s.id) || [])
    bookings = (data || []).filter(b => mySpaceIds.has(b.space_id))
  } else {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        spaces (name, location, price_per_hour, images,
          users!spaces_vendor_id_fkey (full_name, email)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    bookings = data || []
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-futura font-bold text-[#1E0D73]">
          {isVendor ? 'Space Bookings' : 'My Bookings'}
        </h1>
        <p className="text-[#050315]/70 mt-1">
          {isVendor ? 'All customer reservations for your spaces' : 'Your upcoming and past reservations'}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#B7BDB7]/20">
          <p className="text-5xl mb-4">📅</p>
          <h3 className="text-xl font-bold text-[#1E0D73] mb-2">No bookings yet</h3>
          <p className="text-[#050315]/60">
            {isVendor ? 'Bookings will appear here once customers reserve your spaces.' : 'Head back to the Overview to browse and book spaces!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white rounded-2xl border border-[#B7BDB7]/20 shadow-sm overflow-hidden">
              {/* Space Image Header */}
              <div className="h-36 overflow-hidden relative bg-gradient-to-br from-[#1E0D73]/10 to-[#FF9800]/10">
                {booking.spaces?.images?.[0] && (
                  <img src={booking.spaces.images[0]} alt={booking.spaces?.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                  <h3 className="text-white font-bold text-lg">{booking.spaces?.name}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColors[booking.status]}`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-[#050315]/70">
                  <MapPin className="h-4 w-4 text-[#1E0D73]" />
                  {booking.spaces?.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#050315]/70">
                  <Clock className="h-4 w-4 text-[#1E0D73]" />
                  {new Date(booking.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} &nbsp;·&nbsp;
                  {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#1E0D73]">
                  <DollarSign className="h-4 w-4" />
                  ${booking.total_price} total
                </div>

                {/* Show customer info for vendors, vendor info for customers */}
                <div className="pt-3 border-t border-[#B7BDB7]/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E0D73]/10 text-[#1E0D73] flex items-center justify-center text-xs font-bold">
                    {isVendor
                      ? (booking.users?.full_name?.charAt(0) || '?')
                      : ((booking.spaces?.users as any)?.full_name?.charAt(0) || 'V')}
                  </div>
                  <div>
                    <p className="text-xs text-[#050315]/50">{isVendor ? 'Customer' : 'Vendor'}</p>
                    <p className="text-sm font-medium text-[#050315]">
                      {isVendor
                        ? (booking.users?.full_name || booking.users?.email)
                        : ((booking.spaces?.users as any)?.full_name || 'Vendor')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
