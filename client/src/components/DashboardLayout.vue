<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, isAdmin, logout } = useAuth()

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function handleLogout() {
  closeMobileMenu()
  logout()
}

// Navigation items
const navItems = computed(() => {
  const items = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>`
    },
    {
      name: 'Katalog Barang',
      path: '/catalog',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>`
    }
  ]

  if (isAdmin.value) {
    items.push({
      name: 'Kelola Antrian',
      path: '/admin/queues',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>`
    })
  } else {
    items.push({
      name: 'Ambil Antrian',
      path: '/queue',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3c0-.621-.504-1.125-1.125-1.125H3.375zM3.375 11.25c-.621 0-1.125.504-1.125 1.125v5.25c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>`
    })
  }

  return items
})
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row relative">
    
    <!-- Background glows -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-0 right-1/4 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[150px]"></div>
      <div class="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[120px]"></div>
      <div class="absolute inset-0 opacity-[0.012]"
        style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 60px 60px;">
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex flex-col w-64 bg-[#0d0d0d] border-r border-white/5 fixed inset-y-0 left-0 z-30">
      <!-- Logo Header -->
      <div class="h-20 flex items-center px-6 border-b border-white/5">
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5 text-white" stroke="currentColor" stroke-width="2">
              <path d="M9 17H7A5 5 0 0 1 7 7h2" stroke-linecap="round"/>
              <path d="M15 7h2a5 5 0 0 1 0 10h-2" stroke-linecap="round"/>
              <path d="M8 12h8" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="font-black text-lg text-white tracking-tight">2R Service</span>
        </router-link>
      </div>

      <!-- Navigation links -->
      <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group border"
          :class="[
            route.path === item.path
              ? 'bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-400 shadow-md shadow-orange-500/5'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/5'
          ]"
        >
          <div 
            class="transition-colors duration-300"
            :class="route.path === item.path ? 'text-orange-400' : 'text-gray-500 group-hover:text-white'"
            v-html="item.icon"
          ></div>
          {{ item.name }}
        </router-link>
      </nav>

      <!-- User footer -->
      <div class="p-4 border-t border-white/5 bg-[#0b0b0b]">
        <div class="flex items-center gap-3 mb-4 px-2">
          <div class="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 rounded-full flex items-center justify-center">
            <span class="text-orange-400 font-bold">{{ user?.nama?.charAt(0)?.toUpperCase() }}</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold text-white truncate">{{ user?.nama }}</span>
            <span class="text-[11px] font-semibold tracking-wider text-orange-500 uppercase mt-0.5">
              {{ isAdmin ? 'Admin' : 'Pelanggan' }}
            </span>
          </div>
        </div>
        
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/>
          </svg>
          Keluar
        </button>
      </div>
    </aside>

    <!-- Mobile Top Header -->
    <header class="md:hidden flex items-center justify-between px-6 py-4 bg-[#0d0d0d] border-b border-white/5 sticky top-0 z-40">
      <router-link to="/" class="flex items-center gap-2.5">
        <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4 text-white" stroke="currentColor" stroke-width="2">
            <path d="M9 17H7A5 5 0 0 1 7 7h2" stroke-linecap="round"/>
            <path d="M15 7h2a5 5 0 0 1 0 10h-2" stroke-linecap="round"/>
            <path d="M8 12h8" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="font-black text-white tracking-tight">2R Service</span>
      </router-link>

      <button 
        @click="toggleMobileMenu" 
        class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white"
        aria-label="Toggle menu"
      >
        <svg v-if="!isMobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <!-- Mobile Drawer (Backdrop & Sidebar) -->
    <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 z-45 flex">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        @click="closeMobileMenu"
      ></div>

      <!-- Drawer Panel -->
      <aside class="relative flex flex-col w-64 bg-[#0d0d0d] border-r border-white/5 h-full z-50">
        <!-- Logo Header -->
        <div class="h-20 flex items-center px-6 border-b border-white/5 justify-between">
          <router-link to="/" @click="closeMobileMenu" class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5 text-white" stroke="currentColor" stroke-width="2">
                <path d="M9 17H7A5 5 0 0 1 7 7h2" stroke-linecap="round"/>
                <path d="M15 7h2a5 5 0 0 1 0 10h-2" stroke-linecap="round"/>
                <path d="M8 12h8" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="font-black text-lg text-white tracking-tight">2R Service</span>
          </router-link>
          
          <button @click="closeMobileMenu" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="closeMobileMenu"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border"
            :class="[
              route.path === item.path
                ? 'bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-400 shadow-md shadow-orange-500/5'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/5'
            ]"
          >
            <div 
              class="transition-colors duration-300"
              :class="route.path === item.path ? 'text-orange-400' : 'text-gray-500'"
              v-html="item.icon"
            ></div>
            {{ item.name }}
          </router-link>
        </nav>

        <!-- User profile section in mobile drawer -->
        <div class="p-4 border-t border-white/5 bg-[#0b0b0b]">
          <div class="flex items-center gap-3 mb-4 px-2">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 rounded-full flex items-center justify-center">
              <span class="text-orange-400 font-bold">{{ user?.nama?.charAt(0)?.toUpperCase() }}</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-bold text-white truncate">{{ user?.nama }}</span>
              <span class="text-[11px] font-semibold text-orange-500 uppercase mt-0.5">
                {{ isAdmin ? 'Admin' : 'Pelanggan' }}
              </span>
            </div>
          </div>
          
          <button
            @click="handleLogout"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/>
            </svg>
            Keluar
          </button>
        </div>
      </aside>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 md:pl-64 flex flex-col min-w-0 z-10 relative">
      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <slot></slot>
      </main>
    </div>

  </div>
</template>
