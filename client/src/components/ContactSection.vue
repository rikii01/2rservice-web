<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const sectionRef = ref<HTMLElement | null>(null)
const visible = ref(false)

const contactInfo = [
  {
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>`,
    label: 'Alamat',
    value: 'Jl. Medan B.Aceh No. 42, Bireuen',  
    link: 'https://maps.app.goo.gl/UoV1YKUZhyYGqFNz9',
    linkLabel: 'Buka di Maps →',
  },
  {
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>`,
    label: 'Telepon / WhatsApp',
    value: '+62 823-6968-8220',
    link: 'https://wa.me/6282369688220',
    linkLabel: 'Chat WhatsApp →',
  },
  {
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    label: 'Jam Operasional',
    value: 'Senin – Sabtu: 08.00 – 17.00\nMinggu: 08.00 – 13.00',
    link: null,
    linkLabel: null,
  },
]

const socials = [
  {
    name: 'Instagram',
    href: '#',
    color: 'hover:bg-pink-500/10 hover:border-pink-500/20 hover:text-pink-400',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  },
  {
    name: 'Facebook',
    href: '#',
    color: 'hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-400',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  },
  {
    name: 'TikTok',
    href: '#',
    color: 'hover:bg-white/10 hover:border-white/20 hover:text-white',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/></svg>`,
  },
]

let observer: IntersectionObserver | null = null
onMounted(() => {
  observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) visible.value = true }, { threshold: 0, rootMargin: '0px 0px -50px 0px' })
  if (sectionRef.value) observer.observe(sectionRef.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <section id="contact" ref="sectionRef" class="py-28 relative overflow-hidden bg-[#080808]">
    <div class="absolute inset-0">
      <div class="absolute left-0 bottom-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px]"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
      <!-- Header -->
      <div :class="['text-center mb-16 transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
          <span class="text-orange-400 text-sm font-medium">Hubungi Kami</span>
        </div>
        <h2 class="text-4xl lg:text-5xl font-black text-white mb-4">
          Temukan Kami &amp;
          <span class="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Hubungi Kami</span>
        </h2>
        <p class="text-gray-400 text-lg max-w-xl mx-auto">
          Kami siap membantu Anda. Kunjungi bengkel atau hubungi kami langsung melalui WhatsApp.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Contact Cards -->
        <div class="space-y-4">
          <div
            v-for="(info, i) in contactInfo"
            :key="info.label"
            :class="[
              'flex gap-4 p-6 bg-[#111111] border border-white/5 rounded-2xl hover:border-orange-500/20 transition-all duration-500 group',
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            ]"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="w-12 h-12 flex-shrink-0 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
              <div class="w-5 h-5" v-html="info.icon"></div>
            </div>
            <div class="flex-1">
              <div class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{{ info.label }}</div>
              <div class="text-white font-medium whitespace-pre-line text-sm">{{ info.value }}</div>
              <a
                v-if="info.link"
                :href="info.link"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-block mt-2 text-orange-400 text-sm hover:text-orange-300 transition-colors font-medium"
              >
                {{ info.linkLabel }}
              </a>
            </div>
          </div>

          <!-- Social Media -->
          <div
            :class="[
              'p-6 bg-[#111111] border border-white/5 rounded-2xl transition-all duration-700 delay-300',
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            ]"
          >
            <div class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4">Ikuti Kami</div>
            <div class="flex gap-3">
              <a
                v-for="social in socials"
                :key="social.name"
                :href="social.href"
                :class="['w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 transition-all duration-300', social.color]"
                :aria-label="social.name"
              >
                <div class="w-4 h-4" v-html="social.icon"></div>
              </a>
            </div>
          </div>
        </div>

        <!-- Map Placeholder -->
        <div
          :class="[
            'relative rounded-3xl overflow-hidden border border-white/8 bg-[#111111] transition-all duration-700 delay-200',
            visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          ]"
          style="min-height: 400px;"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#111111] flex flex-col items-center justify-center gap-4">
            <!-- Decorative grid background -->
            <div
              class="absolute inset-0 opacity-[0.03] pointer-events-none"
              style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 30px 30px;"
            ></div>

            <!-- Orange pin dot (centered) -->
            <div class="absolute top-1/2 left-1/2 pointer-events-none" style="transform: translate(-50%, -50%);">
              <div class="w-4 h-4 bg-orange-500 rounded-full shadow-lg animate-ping-slow" style="box-shadow: 0 0 0 8px rgba(249,115,22,0.2);"></div>
            </div>

            <div class="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400 relative z-10">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
              </svg>
            </div>
            <div class="text-center px-6 relative z-10">
              <h4 class="text-white font-bold text-lg mb-1">Lokasi Bengkel</h4>
              <p class="text-gray-500 text-sm">Jl. Medan B.Aceh No. 42, Bireuen</p>
            </div>
            <a
              href="https://maps.app.goo.gl/UoV1YKUZhyYGqFNz9"
              target="_blank"
              rel="noopener noreferrer"
              class="relative z-10 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-sm"
              style="box-shadow: 0 8px 24px rgba(249,115,22,0.25);"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
              </svg>
              Buka Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes ping-slow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(2); opacity: 0.2; }
}
.animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }
</style>
