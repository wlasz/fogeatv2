import { supabase } from '../lib/supabase.js'

export const authService = {
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  onSessionChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session, event)
    })

    return () => subscription.unsubscribe()
  },

  signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  },

  signUp(email, password) {
    return supabase.auth.signUp({ email, password })
  },

  signOut() {
    return supabase.auth.signOut()
  },
}
