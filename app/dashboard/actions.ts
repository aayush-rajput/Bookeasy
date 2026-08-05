'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
  const hours = Number(formData.get('hours') || 2)

  // Start time is now, end time is now + hours
  const startTime = new Date()
  const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000)

  const { error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      space_id: spaceId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      total_price: price * hours
    })

  if (error) {
    console.error('Failed to book space', error)
  }

  revalidatePath('/dashboard')
}

export async function seedDemoData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Make the current user a vendor for the dummy spaces
  await supabase.from('users').update({ role: 'vendor' }).eq('id', user.id)

  const dummySpaces = [
    {
      vendor_id: user.id,
      name: 'The Grand Ballroom',
      description: 'A luxurious ballroom perfect for weddings and corporate galas. Features crystal chandeliers and a built-in stage.',
      price_per_hour: 250,
      location: 'Downtown Metro',
      amenities: ['Wi-Fi', 'Stage', 'Catering Kitchen', 'Valet Parking'],
      images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop']
    },
    {
      vendor_id: user.id,
      name: 'Creative Studio 4B',
      description: 'Bright, airy studio with natural light. Ideal for photo shoots, workshops, and small team offsites.',
      price_per_hour: 75,
      location: 'Arts District',
      amenities: ['Natural Light', 'Whiteboard', 'Coffee Machine', 'Projector'],
      images: ['https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2012&auto=format&fit=crop']
    },
    {
      vendor_id: user.id,
      name: 'Rooftop Garden Oasis',
      description: 'Stunning outdoor space with city views, lush greenery, and lounge seating. Best for evening mixers.',
      price_per_hour: 150,
      location: 'Uptown Skydeck',
      amenities: ['Outdoor Seating', 'Bar Area', 'Heaters', 'Sound System'],
      images: ['https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1974&auto=format&fit=crop']
    }
  ]

  const { error } = await supabase.from('spaces').insert(dummySpaces)
  if (error) console.error('Failed to seed spaces', error)

  revalidatePath('/dashboard')
}
