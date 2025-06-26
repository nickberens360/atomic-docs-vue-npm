// lib/supabase.js
// This file exports functions only - no code execution at module level

let supabaseClient = null
let initPromise = null

export async function initializeSupabase() {
  // Return existing promise if initialization is in progress
  if (initPromise) {
    return initPromise
  }

  // Return existing client if already initialized
  if (supabaseClient) {
    return supabaseClient
  }

  // Only run in browser
  if (typeof window === 'undefined') {
    return null
  }

  initPromise = (async () => {
    try {
      // Dynamic import of Supabase
      const { createClient } = await import('@supabase/supabase-js')

      // Get environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables missing')
        return null
      }

      supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
      return supabaseClient
    } catch (error) {
      console.error('Supabase initialization failed:', error)
      return null
    } finally {
      initPromise = null
    }
  })()

  return initPromise
}

export function getSupabaseClient() {
  return supabaseClient
}

export function isInitialized() {
  return supabaseClient !== null
}