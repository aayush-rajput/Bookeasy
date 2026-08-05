import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LogOut, Home, Calendar, Settings, LayoutDashboard } from 'lucide-react'
import { signOut } from '../login/actions'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the user's role from the public.users table
  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'user'
  const name = profile?.full_name || user.email

  return (
    <div className="min-h-screen bg-[#F4F1EB] flex flex-col md:flex-row font-poppins">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#B7BDB7]/20 flex flex-col shadow-sm hidden md:flex">
        <div className="p-6 border-b border-[#B7BDB7]/20">
          <Link href="/" className="font-futura text-2xl font-bold text-[#1E0D73]">
            BookEasy
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E0D73] text-white flex items-center justify-center font-bold">
              {name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-[#050315] truncate">{name}</span>
              <span className="text-xs text-[#050315]/60 uppercase tracking-wider">{role}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#1E0D73] bg-[#1E0D73]/5 font-medium">
            <LayoutDashboard className="h-5 w-5" />
            Overview
          </Link>
          
          <Link href="/dashboard/bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#050315]/70 hover:bg-[#1E0D73]/5 hover:text-[#1E0D73] transition-colors">
            <Calendar className="h-5 w-5" />
            {role === 'vendor' ? 'Space Bookings' : 'My Bookings'}
          </Link>

          {role === 'vendor' && (
            <Link href="/dashboard/spaces" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#050315]/70 hover:bg-[#1E0D73]/5 hover:text-[#1E0D73] transition-colors">
              <Home className="h-5 w-5" />
              My Spaces
            </Link>
          )}

          {role === 'admin' && (
             <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#050315]/70 hover:bg-[#1E0D73]/5 hover:text-[#1E0D73] transition-colors">
             <Settings className="h-5 w-5" />
             Admin Panel
           </Link>
          )}
        </nav>

        <div className="p-4 border-t border-[#B7BDB7]/20">
          <form action={signOut}>
            <Button variant="ghost" className="w-full flex items-center justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-3 rounded-xl">
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center border-b border-[#B7BDB7]/20">
          <Link href="/" className="font-futura text-xl font-bold text-[#1E0D73]">
            BookEasy
          </Link>
          <form action={signOut}>
             <Button variant="ghost" size="sm" className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" /> Out
             </Button>
          </form>
        </div>
        
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
