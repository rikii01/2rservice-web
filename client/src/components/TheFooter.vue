<script setup lang="ts">
function scrollTo(href: string) {
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <footer class="bg-[#080808] border-t border-white/5">
    <!-- Main Footer -->
    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <!-- Brand -->
        <div class="lg:col-span-2">
          <a href="#home" @click.prevent="scrollTo('#home')" class="inline-flex items-center gap-3 mb-4 group">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
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
          <p class="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
            Bengkel motor profesional dengan teknisi bersertifikat dan sistem antrian digital. Melayani dengan hati, servis dengan kualitas.
          </p>
          <div class="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl w-fit">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-green-400 text-xs font-medium">Buka Pada · 08.00 – 17.00</span>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-bold mb-4 text-sm tracking-wide">Menu Cepat</h4>
          <ul class="space-y-2.5">
            <li v-for="link in [
              { label: 'Beranda', href: '#home' },
              { label: 'Layanan', href: '#services' },
              { label: 'Tentang Kami', href: '#about' },
              { label: 'Sistem Antrian', href: '#queue' },
              { label: 'Kontak', href: '#contact' },
            ]" :key="link.label">
              <a :href="link.href" @click.prevent="scrollTo(link.href)"
                class="text-gray-500 hover:text-orange-400 text-sm transition-colors duration-200">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Layanan -->
        <div>
          <h4 class="text-white font-bold mb-4 text-sm tracking-wide">Layanan</h4>
          <ul class="space-y-2.5">
            <li v-for="s in ['Tune Up & Servis Rutin', 'Overhaul Mesin', 'Kelistrikan', 'Servis Express', 'Spare Part', 'Modifikasi']" :key="s">
              <span class="text-gray-500 text-sm">{{ s }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-white/5">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-gray-600 text-xs">
          &copy; {{ new Date().getFullYear() }} 2R Service. Semua hak dilindungi.
        </p>
        <p class="text-gray-700 text-xs">
          Dibuat untuk pelanggan kami
        </p>
      </div>
    </div>
  </footer>
</template>
