// Utility function to get user profile
import { createClient } from '@/lib/supabase/client'

export async function getUserProfile() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function getUserRole() {
  const profile = await getUserProfile()
  return profile?.role || null
}

export function getDashboardPath(role: string | null) {
  if (role === 'hr') return '/hr/dashboard'
  if (role === 'candidate') return '/candidate/dashboard'
  return '/dashboard'
}
