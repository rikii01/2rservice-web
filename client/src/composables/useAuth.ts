import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = 'http://localhost:3000/api'

export interface User {
  id: string
  nama: string
  email: string
  noHp: string
  role: 'ADMIN' | 'PELANGGAN'
  avatar?: string | null
  createdAt: string
}

// Global reactive state (shared across components)
const user = ref<User | null>(null)
const token = ref<string | null>(null)
const isLoading = ref(false)

// Initialize from localStorage
function initAuth() {
  const savedToken = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')
  if (savedToken && savedUser) {
    token.value = savedToken
    try {
      user.value = JSON.parse(savedUser)
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }
}

// Run on import
initAuth()

export function useAuth() {
  const router = useRouter()

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  async function register(data: {
    nama: string
    email: string
    noHp: string
    password: string
  }): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error || 'Registrasi gagal.' }
      }

      // Auto-login after register
      token.value = json.token
      user.value = json.user
      localStorage.setItem('token', json.token)
      localStorage.setItem('user', JSON.stringify(json.user))

      return { success: true }
    } catch (err) {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  async function login(data: {
    email: string
    password: string
  }): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error || 'Login gagal.' }
      }

      token.value = json.token
      user.value = json.user
      localStorage.setItem('token', json.token)
      localStorage.setItem('user', JSON.stringify(json.user))

      return { success: true }
    } catch (err) {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithGoogle(idToken: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error || 'Login Google gagal.' }
      }

      token.value = json.token
      user.value = json.user
      localStorage.setItem('token', json.token)
      localStorage.setItem('user', JSON.stringify(json.user))

      return { success: true }
    } catch (err) {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(data: {
    nama: string
    noHp: string
    avatar?: string | null
  }): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error || 'Gagal memperbarui profil.' }
      }

      user.value = json.user
      localStorage.setItem('user', JSON.stringify(json.user))

      return { success: true }
    } catch (err) {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  async function updatePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error || 'Gagal mengubah password.' }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMe(): Promise<void> {
    if (!token.value) return
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      if (res.ok) {
        const json = await res.json()
        user.value = json.user
        localStorage.setItem('user', JSON.stringify(json.user))
      } else {
        logout()
      }
    } catch {
      // Silent fail
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    register,
    login,
    loginWithGoogle,
    updateProfile,
    updatePassword,
    logout,
    fetchMe,
  }
}
