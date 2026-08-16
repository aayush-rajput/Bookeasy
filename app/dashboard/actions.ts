'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateUserRole(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const newRole = formData.get('role') as string
  
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', user.id)
    
  if (error) {
    console.error('Failed to update role', error)
  }

  revalidatePath('/dashboard', 'layout')
}

export async function bookSpace(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const spaceId = formData.get('space_id') as string
  const price = Number(formData.get('price'))
  const guests = Number(formData.get('guests') || 1)
  const dateStr = formData.get('date') as string
  const timeStr = formData.get('time') as string
  const duration = Number(formData.get('duration') || 2)

  // Combine date and time
  const startDateTime = new Date(`${dateStr}T${timeStr}`)
  const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000)

  const { error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      space_id: spaceId,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      guests: guests,
      status: 'pending',
      total_price: price * duration
    })

  if (error) {
    console.error('Failed to book space', error)
    return redirect(`/dashboard/spaces/${spaceId}?error=BookingFailed`)
  }

  revalidatePath('/dashboard')
  redirect('/dashboard/bookings')
}

export async function seedDemoData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Temporarily make the user a vendor to own the spaces
  await supabase.from('users').update({ role: 'vendor' }).eq('id', user.id)

  const dummySpaces = [
    // Restaurants
    {
      vendor_id: user.id,
      category: 'Restaurant',
      name: 'The Golden Plate',
      description: 'Experience fine dining with a panoramic view of the city skyline. Perfect for romantic dinners or VIP corporate lunches.',
      price_per_hour: 120,
      capacity: 50,
      location: 'Downtown Skyscraper, 45th Floor',
      amenities: ['Wi-Fi', 'Bar Area', 'Valet Parking'],
      images: ['https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop']
    },
    {
      vendor_id: user.id,
      category: 'Restaurant',
      name: 'Rustic Hearth',
      description: 'A cozy, farm-to-table restaurant featuring an open wood-fired oven and intimate seating arrangements.',
      price_per_hour: 85,
      capacity: 40,
      location: 'Westside Arts District',
      amenities: ['Outdoor Seating', 'Heaters', 'Wi-Fi'],
      images: ['https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2000&auto=format&fit=crop']
    },
    // Events / Shows
    {
      vendor_id: user.id,
      category: 'Event',
      name: 'Neon Underground',
      description: 'A vibrant, multi-room event space equipped with state-of-the-art sound and lighting systems. Best for DJ sets and launch parties.',
      price_per_hour: 300,
      capacity: 350,
      location: 'Warehouse District',
      amenities: ['Sound System', 'Stage', 'Bar Area', 'Valet Parking'],
      images: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop']
    },
    {
      vendor_id: user.id,
      category: 'Event',
      name: 'The Comedy Cellar',
      description: 'An intimate, brick-walled basement venue perfect for stand-up comedy, acoustic gigs, or small theatrical performances.',
      price_per_hour: 150,
      capacity: 100,
      location: 'Midtown East',
      amenities: ['Stage', 'Sound System', 'Bar Area'],
      images: ['https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=2000&auto=format&fit=crop']
    },
    // Banquet Halls
    {
      vendor_id: user.id,
      category: 'Banquet Hall',
      name: 'Crystal Grand Banquet',
      description: 'A luxurious hall featuring magnificent crystal chandeliers, marble floors, and a dedicated catering kitchen. The ultimate wedding destination.',
      price_per_hour: 500,
      capacity: 500,
      location: 'North Hills Estate',
      amenities: ['Stage', 'Catering Kitchen', 'Valet Parking', 'Sound System'],
      images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop']
    },
    {
      vendor_id: user.id,
      category: 'Banquet Hall',
      name: 'Lakeside Pavilion',
      description: 'A beautiful indoor/outdoor banquet space right on the water. Features floor-to-ceiling windows and a sprawling lawn.',
      price_per_hour: 350,
      capacity: 250,
      location: 'Silver Lake Marina',
      amenities: ['Outdoor Seating', 'Catering Kitchen', 'Natural Light', 'Wi-Fi'],
      images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2000&auto=format&fit=crop']
    }
  ]

  // Insert spaces
  const { data: insertedSpaces, error: spacesError } = await supabase
    .from('spaces')
    .insert(dummySpaces)
    .select('id, price_per_hour')

  if (spacesError) {
    console.error('Failed to seed spaces', spacesError)
    return
  }

  // Create some dummy bookings using the current user as the customer
  if (insertedSpaces && insertedSpaces.length > 0) {
    const dummyBookings = [
      {
        user_id: user.id,
        space_id: insertedSpaces[0].id,
        start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours
        guests: 4,
        status: 'confirmed',
        total_price: insertedSpaces[0].price_per_hour * 3
      },
      {
        user_id: user.id,
        space_id: insertedSpaces[2].id,
        start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
        guests: 150,
        status: 'pending',
        total_price: insertedSpaces[2].price_per_hour * 4
      },
      {
        user_id: user.id,
        space_id: insertedSpaces[4].id,
        start_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (past booking)
        end_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // 6 hours
        guests: 300,
        status: 'confirmed',
        total_price: insertedSpaces[4].price_per_hour * 6
      }
    ]

    await supabase.from('bookings').insert(dummyBookings as any)
  }

  revalidatePath('/dashboard')
}
