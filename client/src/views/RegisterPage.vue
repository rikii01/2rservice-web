<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { register, isLoading } = useAuth()

const nama = ref('')
const email = ref('')
const noHp = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  errorMsg.value = ''
  if (!nama.value || !email.value || !noHp.value || !password.value || !confirmPassword.value) {
    errorMsg.value = 'Semua field harus diisi.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Password dan konfirmasi password tidak cocok.'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = 'Password minimal 6 karakter.'
    return
  }

  const result = await register({
    nama: nama.value,
    email: email.value,
    noHp: noHp.value,
    password: password.value
  })

  if (result.success) {
    router.push('/dashboard')
  } else {
    errorMsg.value = result.error || 'Registrasi gagal.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden px-4 py-12">
    <!-- Background -->
    <div class="absolute inset-0">
      <div class="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px]"></div>
      <div class="absolute inset-0 opacity-[0.015]" style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 60px 60px;"></div>
    </div>

    <!-- Particles -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div v-for="i in 6" :key="i" class="absolute w-1 h-1 bg-orange-400/20 rounded-full animate-float-particle"
        :style="{ left: `${10 + i * 15}%`, top: `${15 + (i % 3) * 25}%`, animationDelay: `${i * 0.9}s`, animationDuration: `${4 + (i % 3)}s` }">
      </div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Back -->
      <router-link to="/" class="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors duration-300 group">
        <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        <span class="text-sm font-medium">Kembali ke Beranda</span>
      </router-link>

      <!-- Card -->
      <div class="relative">
        <div class="absolute -inset-[1px] bg-gradient-to-br from-orange-500/30 via-orange-500/10 to-transparent rounded-3xl pointer-events-none"></div>
        <div class="relative bg-[#111111]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl">
          <!-- Logo -->
          <div class="flex items-center justify-center mb-6">
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
          <div class="text-center mb-6">
            <h1 class="text-2xl font-black text-white mb-2">Buat Akun Baru</h1>
            <p class="text-gray-400 text-sm">Daftar untuk mulai menggunakan sistem antrian digital</p>
          </div>

          <!-- Error -->
          <Transition name="fade">
            <div v-if="errorMsg" class="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              {{ errorMsg }}
            </div>
          </Transition>

          <!-- Form -->
          <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- Nama -->
            <div>
              <label for="reg-nama" class="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                  </svg>
                </div>
                <input id="reg-nama" v-model="nama" type="text" placeholder="John Doe"
                  class="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"/>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="reg-email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                  </svg>
                </div>
                <input id="reg-email" v-model="email" type="email" placeholder="nama@email.com"
                  class="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"/>
              </div>
            </div>

            <!-- No HP -->
            <div>
              <label for="reg-hp" class="block text-sm font-medium text-gray-300 mb-2">Nomor HP</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
                  </svg>
                </div>
                <input id="reg-hp" v-model="noHp" type="tel" placeholder="08xxxxxxxxxx"
                  class="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"/>
              </div>
            </div>

            <!-- Password -->
            <div>
              <label for="reg-password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                  </svg>
                </div>
                <input id="reg-password" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Minimal 6 karakter"
                  class="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"/>
                <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="reg-confirm" class="block text-sm font-medium text-gray-300 mb-2">Konfirmasi Password</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                  </svg>
                </div>
                <input id="reg-confirm" v-model="confirmPassword" :type="showConfirm ? 'text' : 'password'" placeholder="Ulangi password"
                  class="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"/>
                <button type="button" @click="showConfirm = !showConfirm" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  <svg v-if="!showConfirm" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button type="submit" :disabled="isLoading"
              class="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-base mt-6">
              <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Memproses...' : 'Daftar Sekarang' }}
            </button>
          </form>

          <!-- Login Link -->
          <p class="mt-8 text-center text-sm text-gray-400">
            Sudah punya akun?
            <router-link to="/login" class="text-orange-400 hover:text-orange-300 font-semibold transition-colors ml-1">Masuk</router-link>
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
.animate-float-particle { animation: float-particle 5s ease-in-out infinite; }
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
