'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const role = formData.get('role') as string || 'user'
    return redirect(`/login?message=${encodeURIComponent(error.message)}&role=${role}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as string || 'user'

  // Admin cannot self-register
  if (role === 'admin') {
    return redirect(`/login?message=${encodeURIComponent('Admin accounts cannot be self-registered. Contact platform support.')}&role=admin`)
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role }
    }
  })

  if (error) {
    console.error("Signup error:", error)
    return redirect(`/login?message=${encodeURIComponent(error.message)}&role=${role}`)
  }

  // If email not confirmed yet, update role immediately in public.users if user was created
  if (authData.user) {
    await supabase
      .from('users')
      .upsert({ id: authData.user.id, email, full_name, role })
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/')
}
