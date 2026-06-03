<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const sectionRef = ref<HTMLElement | null>(null)
const visible = ref(false)

const steps = [
  {
    step: '01',
     icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"/></svg>`,
    title: 'Isi data antrian pada Web',
    desc: 'Mengisi data seperti nama dan nomor hp pada form antrian.',
  },
  {
    step: '02',
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
    title: 'Pilih Jenis Servis',
    desc: 'Pilih jenis servis yang Anda butuhkan dan daftarkan nomor kendaraan Anda secara digital.',
  },
  {
    step: '03',
  
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75V16.5zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"/></svg>`,
    title: 'Dapatkan Nomor Antrian dan QR antrian',
    desc: 'Terima nomor antrian digital beserta kode QR antrian.',
  },
  {
    step: '04',
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    title: 'Scan Kode QR antrian',
    desc: 'Datang saat nomor antrian Anda dipanggil, scan QR antrian dan motor siap di service.',
  },
]

let observer: IntersectionObserver | null = null
onMounted(() => {
  observer = new IntersectionObserver(([e]) => { if (e?.isIntersecting) visible.value = true }, { threshold: 0, rootMargin: '0px 0px -50px 0px' })
  if (sectionRef.value) observer.observe(sectionRef.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <section id="queue" ref="sectionRef" class="py-28 relative overflow-hidden">
    <div class="absolute inset-0 bg-[#0a0a0a]">
      <div class="absolute inset-0 opacity-[0.015]"
        style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 32px 32px;">
      </div>
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-[100px]"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
      <!-- Header -->
      <div :class="['text-center mb-16 transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
          <span class="text-orange-400 text-sm font-medium">Sistem Antrian Digital</span>
        </div>
        <h2 class="text-4xl lg:text-5xl font-black text-white mb-4">
          Antri Tanpa
          <span class="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Boros Waktu</span>
        </h2>
        <p class="text-gray-400 text-lg max-w-2xl mx-auto">
          Sistem antrian digital kami memungkinkan Anda mendaftar dari rumah dan datang tepat waktu. Tidak perlu duduk berjam-jam di bengkel.
        </p>
      </div>

      <!-- Steps -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div
          v-for="(step, i) in steps"
          :key="step.step"
          :class="[
            'relative group',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          ]"
          :style="{ transition: 'all 0.6s ease', transitionDelay: `${i * 120}ms` }"
        >
          <!-- Connector line -->
          <div v-if="i < steps.length - 1" class="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-orange-500/30 to-transparent z-0 -translate-y-1/2" style="width: calc(100% - 3rem); left: calc(50% + 2rem);"></div>

          <div class="relative z-10 bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10">
            <!-- Step number -->
            <div class="text-5xl font-black text-white/5 group-hover:text-orange-500/10 transition-colors absolute top-4 right-4">
              {{ step.step }}
            </div>

            <div class="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mb-4">
              <div class="w-6 h-6" v-html="step.icon"></div>
            </div>

            <div class="text-xs font-bold text-orange-500 mb-2 tracking-wider uppercase">Langkah {{ step.step }}</div>
            <h3 class="text-white font-bold text-base mb-2">{{ step.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <!-- CTA Banner -->
      <div
        :class="['relative overflow-hidden bg-gradient-to-r from-orange-600/20 via-orange-500/15 to-orange-600/20 border border-orange-500/20 rounded-3xl p-8 lg:p-12 transition-all duration-700 delay-500', visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95']"
      >
        <div class="absolute inset-0 opacity-30"
          style="background-image: radial-gradient(circle at 20% 50%, rgba(249,115,22,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(249,115,22,0.1) 0%, transparent 60%)">
        </div>
        <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 class="text-2xl lg:text-3xl font-black text-white mb-2">Siap Servis Hari Ini?</h3>
            <p class="text-gray-400">Ambil nomor antrian sekarang dan datang saat giliran Anda tiba.</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <router-link
              to="/login"
              class="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-orange-500/30 hover:scale-105 whitespace-nowrap"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              Ambil Antrian Sekarang
            </router-link>
            <router-link
              to="/login"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all duration-300 whitespace-nowrap"
            >
              Login Pelanggan
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
