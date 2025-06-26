<template>
  <div class="auth-wrapper">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <!-- Authenticated User -->
    <div v-else-if="user" class="user-authenticated">
      <img
        :src="user.user_metadata.avatar_url"
        :alt="user.user_metadata.full_name"
        class="user-avatar"
      />
      <div class="user-info">
        <p class="user-name">
          Welcome, {{ user.user_metadata.full_name || user.email }}!
        </p>
        <p class="user-provider">Authenticated via GitHub</p>
      </div>
      <button @click="handleSignOut" class="sign-out-btn">
        Sign Out
      </button>
    </div>

    <!-- Sign In Prompt -->
    <div v-else class="sign-in-container">
      <p class="sign-in-text">
        Sign in to access component documentation
      </p>
      <button @click="handleSignIn" class="sign-in-btn">
        <svg class="github-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
        </svg>
        Sign in with GitHub
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const user = ref(null)
const loading = ref(true)
let authSubscription = null
let supabase = null

const handleSignIn = async () => {
  if (!supabase) return

  loading.value = true

  // Inline the GitHub sign-in logic to avoid SSR issues
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/atomic-docs`
    }
  })

  if (error) {
    console.error('Error signing in:', error)
    loading.value = false
  }
}

const handleSignOut = async () => {
  if (!supabase) return

  loading.value = true
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
  }
  loading.value = false
}

onMounted(async () => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    loading.value = false
    return
  }

  try {
    // Dynamic import to avoid any build-time execution
    const supabaseModule = await import('../lib/supabase')
    supabase = await supabaseModule.initializeSupabase()

    if (supabase) {
      // Get initial user
      const { data: { user: initialUser } } = await supabase.auth.getUser()
      user.value = initialUser

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          user.value = session?.user ?? null
          loading.value = false
        }
      )

      authSubscription = subscription
    }
  } catch (error) {
    console.error('Auth component initialization failed:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (authSubscription) {
    authSubscription.unsubscribe()
  }
})
</script>

<style scoped>
.auth-wrapper {
  width: 100%;
}

/* Loading State */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Authenticated User */
.user-authenticated {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #14532d;
  margin: 0 0 0.25rem 0;
}

.user-provider {
  font-size: 0.75rem;
  color: #16a34a;
  margin: 0;
}

.sign-out-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sign-out-btn:hover {
  background-color: #fecaca;
}

/* Sign In Prompt */
.sign-in-container {
  padding: 1rem;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
}

.sign-in-text {
  font-size: 0.875rem;
  color: #1e3a8a;
  margin: 0 0 0.75rem 0;
}

.sign-in-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #111827;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
}

.sign-in-btn:hover {
  background-color: #1f2937;
}

.github-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
</style>