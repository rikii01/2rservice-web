<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const sectionRef = ref<HTMLElement | null>(null)
const visible = ref(false)

const services = [
  {
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/></svg>`,
    title: 'Tune Up & Servis Rutin',
    desc: 'Perawatan berkala lengkap: ganti oli, filter, busi, dan pengecekan secara menyeluruh untuk performa motor optimal.',
    badge: 'Populer',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  {
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5"/></svg>`,
    title: 'Overhaul Mesin',
    desc: 'Pembongkaran dan rekondisi mesin secara total oleh teknisi. Garansi pekerjaan 2 minggu.',
    badge: 'Tersedia',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>`,
    title: 'Sistem Kelistrikan',
    desc: 'Diagnosa dan perbaikan kelistrikan: aki, starter, lampu, klakson, dan sistem injeksi elektronik (FI).',
    badge: 'Cepat',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  {
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    title: 'Servis Express',
    desc: 'Ganti oli, ban, dan pemeriksaan cepat selesai. Tanpa perlu janji, langsung dilayani.',
    badge: 'Express',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  {
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>`,
    title: 'Spare Part Original',
    desc: 'Tersedia spare part original dan KW super untuk semua merk motor. Bergaransi dan harga kompetitif.',
    badge: 'Terjamin',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>`,
    title: 'Modifikasi & Aksesoris',
    desc: 'Kustomisasi motor sesuai selera: variasi, upgrade performa, dan pemasangan aksesoris pilihan Anda.',
    badge: 'Kreatif',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  },
]

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => { if (entry?.isIntersecting) visible.value = true },
    { threshold: 0, rootMargin: '0px 0px -50px 0px' }
  )
  if (sectionRef.value) observer.observe(sectionRef.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <section id="services" ref="sectionRef" class="py-28 relative overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-[#0a0a0a]">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-orange-500/50 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
      <!-- Header -->
      <div :class="['text-center mb-16 transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
          <span class="text-orange-400 text-sm font-medium">Layanan Kami</span>
        </div>
        <h2 class="text-4xl lg:text-5xl font-black text-white mb-4">
          Semua Kebutuhan Motor
          <span class="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> di Satu Tempat</span>
        </h2>
        <p class="text-gray-400 text-lg max-w-2xl mx-auto">
          Dari servis ringan hingga Turun Mesin, kami siap menangani semua jenis motor dengan standar kualitas tertinggi.
        </p>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(service, i) in services"
          :key="service.title"
          :class="[
            'group relative bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10 cursor-default',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          ]"
          :style="{ transitionDelay: `${i * 80}ms` }"
        >
          <!-- Top glow on hover -->
          <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/0 to-transparent group-hover:via-orange-500/50 transition-all duration-500 rounded-t-2xl"></div>

          <div class="flex items-start justify-between mb-4">
            <!-- Icon -->
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 group-hover:from-orange-500/30 group-hover:border-orange-500/20 transition-all duration-300">
              <div class="w-6 h-6" v-html="service.icon"></div>
            </div>
            <!-- Badge -->
            <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full border', service.badgeColor]">
              {{ service.badge }}
            </span>
          </div>

          <h3 class="text-white font-bold text-lg mb-2 group-hover:text-orange-100 transition-colors">
            {{ service.title }}
          </h3>
          <p class="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
            {{ service.desc }}
          </p>

          <!-- Arrow -->
          <div class="mt-4 flex items-center gap-1.5 text-orange-500/0 group-hover:text-orange-400 text-sm font-medium transition-all duration-300">
            <span>Pelajari Lebih</span>
            <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
