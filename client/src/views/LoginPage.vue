<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login, isLoading } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''

  if (!email.value || !password.value) {
    errorMsg.value = 'Email dan password harus diisi.'
    return
  }

  const result = await login({ email: email.value, password: password.value })

  if (result.success) {
    router.push('/dashboard')
  } else {
    errorMsg.value = result.error || 'Login gagal.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden px-4">
    <!-- Background Effects -->
    <div class="absolute inset-0">
      <div class="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px]"></div>
      <div class="absolute inset-0 opacity-[0.015]"
        style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 60px 60px;">
      </div>
    </div>

    <!-- Floating Particles -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        v-for="i in 6"
        :key="i"
        class="absolute w-1 h-1 bg-orange-400/20 rounded-full animate-float-particle"
        :style="{
          left: `${15 + i * 14}%`,
          top: `${10 + (i % 3) * 30}%`,
          animationDelay: `${i * 0.8}s`,
          animationDuration: `${5 + (i % 3)}s`,
        }"
      ></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Back to Home -->
      <router-link
        to="/"
        class="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors duration-300 group"
      >
        <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        <span class="text-sm font-medium">Kembali ke Beranda</span>
      </router-link>

      <!-- Login Card -->
      <div class="relative">
        <!-- Glow border -->
        <div class="absolute -inset-[1px] bg-gradient-to-br from-orange-500/30 via-orange-500/10 to-transparent rounded-3xl pointer-events-none"></div>
        
        <div class="relative bg-[#111111]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl">
          <!-- Logo -->
          <div class="flex items-center justify-center mb-8">
            <router-link to="/" class="flex items-center gap-3 group">
              <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-110">
                <svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 text-white" stroke="currentColor" stroke-width="2">
                  <path d="M9 17H7A5 5 0 0 1 7 7h2" stroke-linecap="round"/>
                  <path d="M15 7h2a5 5 0 0 1 0 10h-2" stroke-linecap="round"/>
                  <path d="M8 12h8" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="flex flex-col leading-none">
                <span class="font-black text-2xl text-white tracking-tight">2R Service</span>
                <span class="text-[10px] text-orange-400 font-medium tracking-widest uppercase">Bengkel Motor</span>
              </div>
            </router-link>
          </div>

          <!-- Title -->
          <div class="text-center mb-8">
            <h1 class="text-2xl font-black text-white mb-2">Selamat Datang Kembali</h1>
            <p class="text-gray-400 text-sm">Masuk ke akun Anda untuk mengambil antrian</p>
          </div>

          <!-- Error Message -->
          <Transition name="fade">
            <div v-if="errorMsg" class="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              {{ errorMsg }}
            </div>
          </Transition>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="space-y-5">
            <!-- Email -->
            <div>
              <label for="login-email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                  </svg>
                </div>
                <input
                  id="login-email"
                  v-model="email"
                  type="email"
                  placeholder="nama@email.com"
                  class="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label for="login-password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                  </svg>
                </div>
                <input
                  id="login-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan password"
                  class="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Remember & Forgot -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" class="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/20 focus:ring-offset-0 cursor-pointer"/>
                <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Ingat saya</span>
              </label>
              <a href="#" class="text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium">Lupa password?</a>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-base"
            >
              <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Memproses...' : 'Masuk' }}
            </button>
          </form>

          <!-- Divider -->
          <div class="my-8 flex items-center gap-4">
            <div class="flex-1 h-px bg-white/5"></div>
            <span class="text-xs text-gray-500 font-medium">atau</span>
            <div class="flex-1 h-px bg-white/5"></div>
          </div>

          <!-- Google Sign In (placeholder) -->
          <button class="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-sm">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Masuk dengan Google
          </button>

          <!-- Register Link -->
          <p class="mt-8 text-center text-sm text-gray-400">
            Belum punya akun?
            <router-link to="/register" class="text-orange-400 hover:text-orange-300 font-semibold transition-colors ml-1">
              Daftar Sekarang
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float-particle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
  50% { transform: translateY(-30px) scale(1.5); opacity: 0.5; }
}
.animate-float-particle {
  animation: float-particle 5s ease-in-out infinite;
}
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
