import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Users, Star, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { bookSpace } from '../../actions'

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

export default async function SpaceDetailsPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }) {
  const params = await props.params
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: space } = await supabase
    .from('spaces')
    .select('*, users(full_name, email)')
    .eq('id', params.id)
    .single()

  if (!space) {
    notFound()
  }

  const amenities = Array.isArray(space.amenities)
    ? space.amenities
    : (space.amenities ? Object.values(space.amenities) : [])

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-[#050315]/60 hover:text-[#1E0D73]">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#1E0D73]/10 text-[#1E0D73] px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                {space.category}
              </span>
              <div className="flex items-center gap-1 text-[#FF9800]">
                <Star className="h-4 w-4 fill-[#FF9800]" />
                <span className="font-bold">4.8</span>
                <span className="text-[#050315]/50">(124 reviews)</span>
              </div>
            </div>
            <h1 className="text-4xl font-futura font-bold text-[#050315] mb-4">{space.name}</h1>
            <div className="flex items-center gap-4 text-[#050315]/70">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {space.location}
              </div>
              {space.capacity && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Up to {space.capacity} guests
                </div>
              )}
            </div>
          </div>

          {/* Main Image */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E0D73]/10 to-[#FF9800]/10">
            {space.images?.[0] ? (
              <img src={space.images[0]} alt={space.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-8xl">🏛️</div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white p-8 rounded-2xl border border-[#B7BDB7]/20 shadow-sm">
            <h2 className="text-2xl font-bold font-futura mb-4 text-[#1E0D73]">About this space</h2>
            <p className="text-[#050315]/80 leading-relaxed whitespace-pre-wrap">{space.description}</p>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="bg-white p-8 rounded-2xl border border-[#B7BDB7]/20 shadow-sm">
              <h2 className="text-2xl font-bold font-futura mb-6 text-[#1E0D73]">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-3 text-[#050315]/80">
                    <span className="text-xl">{amenityIcons[amenity] || '✅'}</span>
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-[#B7BDB7]/30 shadow-lg sticky top-8">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-[#1E0D73]">${space.price_per_hour}</span>
              <span className="text-[#050315]/60">/ hour</span>
            </div>

            {searchParams.error === 'BookingFailed' && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
                Failed to create booking. Please try again.
              </div>
            )}

            <form action={bookSpace} className="space-y-5">
              <input type="hidden" name="space_id" value={space.id} />
              <input type="hidden" name="price" value={space.price_per_hour} />
              
              <div>
                <label className="block text-sm font-bold text-[#050315] mb-2">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  className="w-full p-3 rounded-xl border border-[#B7BDB7]/50 focus:border-[#1E0D73] focus:ring-1 focus:ring-[#1E0D73] outline-none transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#050315] mb-2">Start Time</label>
                  <input 
                    type="time" 
                    name="time" 
                    required 
                    className="w-full p-3 rounded-xl border border-[#B7BDB7]/50 focus:border-[#1E0D73] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#050315] mb-2">Duration (hrs)</label>
                  <select name="duration" className="w-full p-3 rounded-xl border border-[#B7BDB7]/50 focus:border-[#1E0D73] outline-none">
                    <option value="1">1 Hour</option>
                    <option value="2" selected>2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="6">6 Hours</option>
                    <option value="8">8 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#050315] mb-2">Guests</label>
                <input 
                  type="number" 
                  name="guests" 
                  min="1" 
                  max={space.capacity || 1000} 
                  defaultValue="2"
                  required 
                  className="w-full p-3 rounded-xl border border-[#B7BDB7]/50 focus:border-[#1E0D73] outline-none"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-[#B7BDB7]/20">
                <Button type="submit" className="w-full py-6 text-lg font-bold bg-gradient-to-r from-[#1E0D73] to-[#3D2A9C] hover:opacity-90 text-white rounded-xl shadow-md">
                  Request to Book
                </Button>
                <p className="text-center text-xs text-[#050315]/50 mt-3">You won't be charged yet</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
