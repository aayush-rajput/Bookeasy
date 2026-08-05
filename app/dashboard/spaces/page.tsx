import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapPin, Users, Calendar, DollarSign, Clock } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export default async function VendorSpacesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch vendor's own spaces with their bookings
  const { data: spaces } = await supabase
    .from('spaces')
    .select(`
      *,
      bookings (
        id,
        start_time,
        end_time,
        status,
        total_price,
        users (full_name, email)
      )
    `)
    .eq('vendor_id', user.id)
    .order('created_at', { ascending: false })

  const totalRevenue = spaces?.reduce((sum, space) => {
    const spaceRevenue = (space.bookings as any[])?.reduce((s: number, b: any) => {
      return b.status === 'confirmed' ? s + Number(b.total_price) : s
    }, 0) || 0
    return sum + spaceRevenue
  }, 0) || 0

  const totalBookings = spaces?.reduce((sum, space) => sum + ((space.bookings as any[])?.length || 0), 0) || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-futura font-bold text-[#1E0D73]">My Spaces</h1>
        <p className="text-[#050315]/70 mt-1">Manage your listed spaces and view incoming bookings</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#B7BDB7]/20 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1E0D73]/10 rounded-lg"><MapPin className="h-5 w-5 text-[#1E0D73]" /></div>
            <div>
              <p className="text-sm text-[#050315]/60">Total Spaces</p>
              <p className="text-2xl font-bold text-[#1E0D73]">{spaces?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#B7BDB7]/20 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF9800]/10 rounded-lg"><Calendar className="h-5 w-5 text-[#FF9800]" /></div>
            <div>
              <p className="text-sm text-[#050315]/60">Total Bookings</p>
              <p className="text-2xl font-bold text-[#1E0D73]">{totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#B7BDB7]/20 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-[#050315]/60">Total Revenue</p>
              <p className="text-2xl font-bold text-[#1E0D73]">${totalRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spaces List */}
      {!spaces || spaces.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#B7BDB7]/20">
          <p className="text-5xl mb-4">🏢</p>
          <h3 className="text-xl font-bold text-[#1E0D73] mb-2">No spaces listed yet</h3>
          <p className="text-[#050315]/60">Go to the Customer view and click "Load Demo Spaces" to seed demo data.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {spaces.map((space) => {
            const bookings = (space.bookings as any[]) || []
            const amenities = Array.isArray(space.amenities)
              ? space.amenities
              : (space.amenities ? Object.values(space.amenities) : [])

            return (
              <div key={space.id} className="bg-white rounded-2xl border border-[#B7BDB7]/20 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Space Image */}
                  <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#1E0D73]/10 to-[#FF9800]/10">
                    {space.images?.[0] ? (
                      <img src={space.images[0]} alt={space.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-5xl">🏛️</div>
                    )}
                  </div>

                  {/* Space Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-[#050315]">{space.name}</h3>
                      <span className="text-lg font-bold text-[#1E0D73]">${space.price_per_hour}/hr</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#050315]/60 mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {space.location}
                    </div>
                    <p className="text-sm text-[#050315]/70 mb-4">{space.description}</p>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {amenities.map((a: string) => (
                        <span key={a} className="text-xs bg-[#1E0D73]/5 text-[#1E0D73] rounded-full px-2 py-1">{a}</span>
                      ))}
                    </div>

                    {/* Bookings for this space */}
                    <div className="border-t border-[#B7BDB7]/20 pt-4">
                      <h4 className="text-sm font-bold text-[#050315] mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Bookings ({bookings.length})
                      </h4>
                      {bookings.length === 0 ? (
                        <p className="text-sm text-[#050315]/50 italic">No bookings yet for this space.</p>
                      ) : (
                        <div className="space-y-2">
                          {bookings.map((booking: any) => (
                            <div key={booking.id} className="flex items-center justify-between bg-[#F4F1EB] rounded-lg p-3">
                              <div>
                                <p className="text-sm font-medium text-[#050315]">{booking.users?.full_name || booking.users?.email || 'Customer'}</p>
                                <div className="flex items-center gap-1 text-xs text-[#050315]/60 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  {new Date(booking.start_time).toLocaleDateString()} · {2}hrs
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColors[booking.status]}`}>
                                  {booking.status}
                                </span>
                                <p className="text-sm font-bold text-[#1E0D73] mt-1">${booking.total_price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
