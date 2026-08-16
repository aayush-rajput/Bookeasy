import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { seedDemoData } from './actions'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Wifi, Star, Zap } from 'lucide-react'

const amenityIcons: Record<string, string> = {
  'Wi-Fi': '📶',
  'Stage': '🎭',
  'Catering Kitchen': '🍽️',
  'Valet Parking': '🚗',
  'Natural Light': '☀️',
  'Whiteboard': '📋',
  'Coffee Machine': '☕',
  'Projector': '📽️',
  'Outdoor Seating': '🌿',
  'Bar Area': '🍹',
  'Heaters': '🔥',
  'Sound System': '🎵',
}

const CATEGORIES = ['Restaurant', 'Event', 'Banquet Hall']

// Note: Next.js 15 searchParams in server components are asynchronous!
export default async function CustomerDashboard(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const activeCategory = searchParams.category || 'Restaurant'

  // Fetch spaces filtered by category
  const { data: spaces, error } = await supabase
    .from('spaces')
    .select('*, users(full_name, email)')
    .eq('category', activeCategory)
    .order('created_at', { ascending: false })

  // Check if we have ANY spaces at all (to show the load demo button)
  const { count: totalSpaces } = await supabase.from('spaces').select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-futura font-bold text-[#1E0D73]">Explore Spaces</h1>
          <p className="text-[#050315]/70 mt-1">Discover and book the perfect space for your next event</p>
        </div>
        {totalSpaces === 0 && (
          <form action={seedDemoData}>
            <Button type="submit" className="bg-[#FF9800] hover:bg-[#e68900] text-white font-bold gap-2">
              <Zap className="h-4 w-4" />
              Load Demo Data
            </Button>
          </form>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[#B7BDB7]/30">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/dashboard?category=${category}`}
            className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors whitespace-nowrap ${
              activeCategory === category
                ? 'bg-[#1E0D73] text-white'
                : 'bg-white text-[#050315]/60 hover:text-[#1E0D73] hover:bg-[#1E0D73]/5'
            }`}
          >
            {category}s
          </Link>
        ))}
      </div>

      {spaces && spaces.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#B7BDB7]/20">
          <p className="text-5xl mb-4">
            {activeCategory === 'Restaurant' ? '🍽️' : activeCategory === 'Event' ? '🎪' : '🏰'}
          </p>
          <h3 className="text-xl font-bold text-[#1E0D73] mb-2">No {activeCategory}s found</h3>
          <p className="text-[#050315]/60 max-w-sm mx-auto">There are currently no listings in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {spaces?.map((space) => {
            const amenities = Array.isArray(space.amenities)
              ? space.amenities
              : (space.amenities ? Object.values(space.amenities) : [])

            return (
              <div key={space.id} className="bg-white rounded-2xl border border-[#B7BDB7]/20 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                {/* Image */}
                <div className="relative h-48 shrink-0 overflow-hidden bg-gradient-to-br from-[#1E0D73]/10 to-[#FF9800]/10">
                  {space.images?.[0] ? (
                    <img
                      src={space.images[0]}
                      alt={space.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-6xl">🏛️</div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-[#1E0D73]">
                    ${space.price_per_hour}/hr
                  </div>
                  <div className="absolute top-3 left-3 bg-[#1E0D73]/80 backdrop-blur-sm text-white rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {space.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-[#050315] mb-1">{space.name}</h3>
                  <div className="flex items-center gap-1 text-[#050315]/60 text-sm mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    {space.location}
                  </div>
                  <p className="text-sm text-[#050315]/70 mb-4 line-clamp-2">{space.description}</p>

                  {/* Vendor */}
                  <div className="flex items-center gap-2 mb-4 p-2 bg-[#F4F1EB] rounded-lg mt-auto">
                    <div className="w-7 h-7 rounded-full bg-[#1E0D73] text-white text-xs flex items-center justify-center font-bold">
                      {(space.users as any)?.full_name?.charAt(0) || 'V'}
                    </div>
                    <span className="text-xs text-[#050315]/70">by <span className="font-medium text-[#050315]">{(space.users as any)?.full_name || 'Vendor'}</span></span>
                    <div className="ml-auto flex items-center gap-1 text-[#FF9800]">
                      <Star className="h-3 w-3 fill-[#FF9800]" />
                      <span className="text-xs font-bold">4.8</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Link href={`/dashboard/spaces/${space.id}`} className="block mt-2">
                    <Button
                      className="w-full font-bold bg-gradient-to-r from-[#1E0D73] to-[#3D2A9C] hover:opacity-90 text-white transition-opacity"
                    >
                      View Details & Book
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
