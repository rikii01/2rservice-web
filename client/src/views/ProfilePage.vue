<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import DashboardLayout from '@/components/DashboardLayout.vue'

const router = useRouter()
const { user, isAuthenticated, fetchMe, updateProfile, updatePassword, isLoading } = useAuth()

// Profile form
const namaForm = ref('')
const noHpForm = ref('')
const avatarForm = ref('')
const profileSuccess = ref('')
const profileError = ref('')

// Password form
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const showCurrentPw = ref(false)
const showNewPw = ref(false)
const showConfirmPw = ref(false)
const passwordSuccess = ref('')
const passwordError = ref('')

const isGoogleUser = computed(() => {
  // Google users registered with noHp = "-"
  return user.value?.noHp === '-'
})

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  await fetchMe()
  // Pre-fill form
  namaForm.value = user.value?.nama || ''
  noHpForm.value = user.value?.noHp === '-' ? '' : (user.value?.noHp || '')
  avatarForm.value = user.value?.avatar || ''
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const avatarInitials = computed(() => {
  const name = user.value?.nama || ''
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
})

async function handleUpdateProfile() {
  profileSuccess.value = ''
  profileError.value = ''

  if (!namaForm.value.trim()) {
    profileError.value = 'Nama tidak boleh kosong.'
    return
  }
  if (!noHpForm.value.trim() && !isGoogleUser.value) {
    profileError.value = 'Nomor HP tidak boleh kosong.'
    return
  }

  const result = await updateProfile({
    nama: namaForm.value.trim(),
    noHp: noHpForm.value.trim() || '-',
    avatar: avatarForm.value.trim() || null
  })

  if (result.success) {
    profileSuccess.value = 'Profil berhasil diperbarui!'
    setTimeout(() => { profileSuccess.value = '' }, 4000)
  } else {
    profileError.value = result.error || 'Gagal memperbarui profil.'
  }
}

async function handleUpdatePassword() {
  passwordSuccess.value = ''
  passwordError.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmNewPassword.value) {
    passwordError.value = 'Semua kolom password harus diisi.'
    return
  }
  if (newPassword.value !== confirmNewPassword.value) {
    passwordError.value = 'Password baru dan konfirmasi tidak cocok.'
    return
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'Password baru minimal 6 karakter.'
    return
  }

  const result = await updatePassword({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value
  })

  if (result.success) {
    passwordSuccess.value = 'Password berhasil diubah!'
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    setTimeout(() => { passwordSuccess.value = '' }, 4000)
  } else {
    passwordError.value = result.error || 'Gagal mengubah password.'
  }
}
</script>

<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-black text-white mb-1">Profil Saya</h1>
      <p class="text-gray-400 text-sm">Kelola informasi akun dan keamanan Anda</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Left column: avatar & info summary -->
      <div class="lg:col-span-1 space-y-4">
        <!-- Avatar Card -->
        <div class="bg-[#111111] border border-white/5 rounded-2xl p-6 text-center hover:border-orange-500/20 transition-all duration-300">
          <!-- Avatar Display -->
          <div class="flex justify-center mb-4">
            <div class="relative">
              <img
                v-if="user?.avatar"
                :src="user.avatar"
                :alt="user?.nama"
                class="w-24 h-24 rounded-full object-cover ring-2 ring-orange-500/30 ring-offset-2 ring-offset-[#111111]"
              />
              <div
                v-else
                class="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center ring-2 ring-orange-500/30 ring-offset-2 ring-offset-[#111111] shadow-xl shadow-orange-500/20"
              >
                <span class="text-white text-3xl font-black">{{ avatarInitials }}</span>
              </div>
              <!-- Online indicator -->
              <div class="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#111111]"></div>
            </div>
          </div>
          <h2 class="text-white font-bold text-lg">{{ user?.nama }}</h2>
          <p class="text-gray-500 text-sm mt-0.5">{{ user?.email }}</p>
          <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <div class="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
            <span class="text-orange-400 text-xs font-bold uppercase tracking-wider">
              {{ user?.role === 'ADMIN' ? 'Administrator' : 'Pelanggan' }}
            </span>
          </div>
        </div>

        <!-- Account Info Card -->
        <div class="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-orange-500/20 transition-all duration-300">
          <h3 class="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
            </svg>
            Info Akun
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-gray-500 text-xs">Bergabung</span>
              <span class="text-white text-xs font-medium">{{ user?.createdAt ? formatDate(user.createdAt) : '-' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-gray-500 text-xs">Nomor HP</span>
              <span class="text-white text-xs font-medium">{{ user?.noHp === '-' ? 'Belum diisi' : user?.noHp }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-gray-500 text-xs">Metode Login</span>
              <span class="text-xs font-medium" :class="isGoogleUser ? 'text-blue-400' : 'text-orange-400'">
                {{ isGoogleUser ? '🔗 Google' : '🔑 Email' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Edit forms -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Edit Profile Form -->
        <div class="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all duration-300">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-9 h-9 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
              </svg>
            </div>
            <div>
              <h2 class="text-white font-bold">Edit Data Pribadi</h2>
              <p class="text-gray-500 text-xs">Perbarui nama, nomor HP, dan foto profil</p>
            </div>
          </div>

          <!-- Success / Error banners -->
          <Transition name="fade">
            <div v-if="profileSuccess" class="mb-5 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ profileSuccess }}
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="profileError" class="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              {{ profileError }}
            </div>
          </Transition>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <!-- Email (read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                  </svg>
                </div>
                <input
                  :value="user?.email"
                  type="email"
                  disabled
                  class="w-full pl-12 pr-4 py-3.5 bg-white/3 border border-white/5 rounded-xl text-gray-600 text-sm cursor-not-allowed"
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2">
                  <span class="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full font-medium">Tidak dapat diubah</span>
                </div>
              </div>
            </div>

            <!-- Nama -->
            <div>
              <label for="profile-nama" class="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                  </svg>
                </div>
                <input
                  id="profile-nama"
                  v-model="namaForm"
                  type="text"
                  placeholder="Nama lengkap Anda"
                  class="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"
                />
              </div>
            </div>

            <!-- No HP -->
            <div>
              <label for="profile-nohp" class="block text-sm font-medium text-gray-300 mb-2">Nomor HP</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
                  </svg>
                </div>
                <input
                  id="profile-nohp"
                  v-model="noHpForm"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  class="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"
                />
              </div>
            </div>

            <!-- Avatar URL -->
            <div>
              <label for="profile-avatar" class="block text-sm font-medium text-gray-300 mb-2">
                URL Foto Profil
                <span class="text-gray-500 font-normal ml-1">(opsional)</span>
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                  </svg>
                </div>
                <input
                  id="profile-avatar"
                  v-model="avatarForm"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  class="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"
                />
              </div>
              <!-- Preview -->
              <div v-if="avatarForm" class="mt-3 flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                <img :src="avatarForm" alt="Preview" class="w-10 h-10 rounded-full object-cover border border-white/10" @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" />
                <span class="text-gray-400 text-xs">Preview foto profil</span>
              </div>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
            >
              <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </form>
        </div>

        <!-- Change Password Form -->
        <div class="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all duration-300">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-white font-bold">Ubah Password</h2>
              <p class="text-gray-500 text-xs">Pastikan password baru Anda kuat dan aman</p>
            </div>
          </div>

          <!-- Google OAuth user notice -->
          <div v-if="isGoogleUser" class="mb-4 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm flex items-start gap-2">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
            </svg>
            <span>Akun Anda terhubung dengan <strong>Google OAuth</strong>. Perubahan password mungkin tidak berpengaruh pada metode login Google Anda.</span>
          </div>

          <!-- Success / Error banners -->
          <Transition name="fade">
            <div v-if="passwordSuccess" class="mb-5 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ passwordSuccess }}
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="passwordError" class="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              {{ passwordError }}
            </div>
          </Transition>

          <form @submit.prevent="handleUpdatePassword" class="space-y-4">
            <!-- Current Password -->
            <div>
              <label for="pw-current" class="block text-sm font-medium text-gray-300 mb-2">Password Saat Ini</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                  </svg>
                </div>
                <input
                  id="pw-current"
                  v-model="currentPassword"
                  :type="showCurrentPw ? 'text' : 'password'"
                  placeholder="Password saat ini"
                  class="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"
                />
                <button type="button" @click="showCurrentPw = !showCurrentPw" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  <svg v-if="!showCurrentPw" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div>
              <label for="pw-new" class="block text-sm font-medium text-gray-300 mb-2">Password Baru</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/>
                  </svg>
                </div>
                <input
                  id="pw-new"
                  v-model="newPassword"
                  :type="showNewPw ? 'text' : 'password'"
                  placeholder="Minimal 6 karakter"
                  class="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"
                />
                <button type="button" @click="showNewPw = !showNewPw" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  <svg v-if="!showNewPw" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                </button>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label for="pw-confirm" class="block text-sm font-medium text-gray-300 mb-2">Konfirmasi Password Baru</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                  </svg>
                </div>
                <input
                  id="pw-confirm"
                  v-model="confirmNewPassword"
                  :type="showConfirmPw ? 'text' : 'password'"
                  placeholder="Ulangi password baru"
                  class="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm"
                />
                <button type="button" @click="showConfirmPw = !showConfirmPw" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  <svg v-if="!showConfirmPw" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                </button>
              </div>
            </div>

            <!-- Password strength indicator -->
            <div v-if="newPassword" class="flex items-center gap-2">
              <div class="flex gap-1.5 flex-1">
                <div class="h-1 flex-1 rounded-full transition-all duration-300" :class="newPassword.length >= 1 ? 'bg-red-500' : 'bg-white/10'"></div>
                <div class="h-1 flex-1 rounded-full transition-all duration-300" :class="newPassword.length >= 4 ? 'bg-yellow-500' : 'bg-white/10'"></div>
                <div class="h-1 flex-1 rounded-full transition-all duration-300" :class="newPassword.length >= 6 ? 'bg-orange-500' : 'bg-white/10'"></div>
                <div class="h-1 flex-1 rounded-full transition-all duration-300" :class="newPassword.length >= 10 ? 'bg-green-500' : 'bg-white/10'"></div>
              </div>
              <span class="text-xs font-medium"
                :class="{
                  'text-red-400': newPassword.length < 4,
                  'text-yellow-400': newPassword.length >= 4 && newPassword.length < 6,
                  'text-orange-400': newPassword.length >= 6 && newPassword.length < 10,
                  'text-green-400': newPassword.length >= 10,
                }"
              >
                {{ newPassword.length < 4 ? 'Lemah' : newPassword.length < 6 ? 'Sedang' : newPassword.length < 10 ? 'Kuat' : 'Sangat Kuat' }}
              </span>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
            >
              <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
              </svg>
              {{ isLoading ? 'Memproses...' : 'Ubah Password' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
