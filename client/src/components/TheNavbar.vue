<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)

const navLinks = [
  { label: 'Beranda', href: '#home' },
  { label: 'Layanan', href: '#services' },
  { label: 'Tentang Kami', href: '#about' },
  { label: 'Antrian', href: '#queue' },
  { label: 'Kontak', href: '#contact' },
]

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

function scrollTo(href: string) {
  mobileMenuOpen.value = false
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <nav
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      isScrolled
        ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50'
        : 'bg-transparent',
    ]"
  >
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-18 py-4">
        <!-- Logo -->
        <a href="#home" @click.prevent="scrollTo('#home')" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" fill="none" class="w-6 h-6 text-white" stroke="currentColor" stroke-width="2">
              <path d="M9 17H7A5 5 0 0 1 7 7h2" stroke-linecap="round"/>
              <path d="M15 7h2a5 5 0 0 1 0 10h-2" stroke-linecap="round"/>
              <path d="M8 12h8" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="flex flex-col leading-none">
            <span class="font-black text-xl text-white tracking-tight">2R Service</span>
            <span class="text-[10px] text-orange-400 font-medium tracking-widest uppercase">Bengkel Motor</span>
          </div>
        </a>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-1">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            @click.prevent="scrollTo(link.href)"
            class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 relative group"
          >
            {{ link.label }}
            <span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 group-hover:w-4 h-0.5 bg-orange-500 rounded-full transition-all duration-300"></span>
          </a>
        </div>

        <!-- CTA Button -->
        <div class="hidden md:flex items-center gap-3">
          <router-link
            to="/login"
            class="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95"
          >
            Login/Register
          </router-link>
        </div>

        <!-- Mobile Hamburger -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
          aria-label="Toggle menu"
        >
          <span :class="['block w-6 h-0.5 bg-white rounded-full transition-all duration-300', mobileMenuOpen ? 'rotate-45 translate-y-2' : '']"></span>
          <span :class="['block w-6 h-0.5 bg-white rounded-full transition-all duration-300', mobileMenuOpen ? 'opacity-0 scale-x-0' : '']"></span>
          <span :class="['block w-6 h-0.5 bg-white rounded-full transition-all duration-300', mobileMenuOpen ? '-rotate-45 -translate-y-2' : '']"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="md:hidden bg-[#111111]/98 backdrop-blur-xl border-t border-white/5">
        <div class="px-6 py-4 flex flex-col gap-1">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            @click.prevent="scrollTo(link.href)"
            class="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all duration-200"
          >
            {{ link.label }}
          </a>
          <router-link
            to="/login"
            @click="mobileMenuOpen = false"
            class="mt-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl text-center transition-all duration-300 block"
          >
            Login/Register
          </router-link>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
