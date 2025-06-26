<template>
  <div class="atomic-docs-home">
    <!-- Authentication component at the top -->
    <div class="auth-container">
      <DocsAuth />
    </div>

    <!-- Only show documentation when authenticated -->
    <div v-if="isAuthenticated" class="docs-content">
      <RouterView />
    </div>

    <!-- Show sign-in prompt when not authenticated -->
    <div v-else class="not-authenticated">
      <div class="text-center p-8">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">
          Access Required
        </h2>
        <p class="text-gray-600">
          Please sign in above to access the Atomic component documentation.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DocsAuth from '../components/DocsAuth.vue'

const isAuthenticated = ref(false)
let authSubscription: any = null

onMounted(async () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return

  try {
    // Dynamic import to avoid any build-time execution
    const supabaseModule = await import('../lib/supabase')
    const supabase = await supabaseModule.initializeSupabase()

    if (supabase) {
      // Check initial authentication state
      const { data: { user } } = await supabase.auth.getUser()
      isAuthenticated.value = !!user

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          isAuthenticated.value = !!session?.user
        }
      )

      authSubscription = subscription
    }
  } catch (error) {
    console.error('Authentication setup failed:', error)
  }
})

onUnmounted(() => {
  if (authSubscription) {
    authSubscription.unsubscribe()
  }
})
</script>

<style scoped>
.atomic-docs-home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.auth-container {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.docs-content {
  flex: 1;
  overflow-y: auto;
}

.not-authenticated {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
}

.text-center {
  text-align: center;
}

.p-8 {
  padding: 2rem;
}

.text-xl {
  font-size: 1.25rem;
}

.font-semibold {
  font-weight: 600;
}

.text-gray-700 {
  color: #374151;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-gray-600 {
  color: #4b5563;
}
</style>