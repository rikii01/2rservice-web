<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const sectionRef = ref<HTMLElement | null>(null)
const visible = ref(false)

const features = [
  { icon: '🔧', title: 'Teknisi Bersertifikat', desc: 'Semua mekanik kami telah mengikuti pelatihan dan bersertifikat resmi dari produsen motor ternama.' },
  { icon: '⚡', title: 'Pengerjaan Cepat', desc: 'Sistem antrian digital kami memastikan waktu tunggu minimal dan pengerjaan yang efisien.' },
  { icon: '🛡️', title: 'Garansi Pekerjaan', desc: 'Setiap pekerjaan servis dilengkapi garansi 14 hari. Jika ada masalah, kami perbaiki gratis.' },
  { icon: '📱', title: 'Pantau via Aplikasi', desc: 'Cek status servis motor Anda secara real-time langsung dari smartphone Anda.' },
]

const timeline = [
  { year: '2013', event: '2R Service berdiri', desc: 'Memulai dengan 1 owner dan tekad kuat melayani masyarakat.' },
  { year: '2015', event: 'Ekspansi Bengkel', desc: 'Perluasan area bengkel, tambah 2 mekanik profesional.' },
  { year: '2026', event: 'Digitalisasi Antrian', desc: 'Peluncuran sistem antrian digital pertama di kota.' },
  { year: '2026', event: '7000+ Pelanggan', desc: 'Milestone 7000 pelanggan terlayani dengan rating 4.9 bintang.' },
]

let observer: IntersectionObserver | null = null
onMounted(() => {
  observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) visible.value = true }, { threshold: 0, rootMargin: '0px 0px -50px 0px' })
  if (sectionRef.value) observer.observe(sectionRef.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <section id="about" ref="sectionRef" class="py-28 relative overflow-hidden bg-[#080808]">
    <div class="absolute inset-0">
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px]"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
      <!-- Header -->
      <div :class="['mb-16 transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
          <span class="text-orange-400 text-sm font-medium">Tentang Kami</span>
        </div>
        <div class="flex flex-col lg:flex-row gap-8 items-start">
          <h2 class="text-4xl lg:text-5xl font-black text-white lg:w-1/2">
            Dipercaya Ribuan Pelanggan
            <span class="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Sejak 2013</span>
          </h2>
          <p class="text-gray-400 text-lg leading-relaxed lg:w-1/2 lg:pt-3">
            2R Service lahir dari passion terhadap dunia otomotif roda dua. Kami bukan sekadar bengkel biasa — kami adalah mitra perjalanan motor Anda. Dengan teknologi modern dan tim yang berdedikasi, kami hadir untuk memastikan setiap pengendara aman di jalan.
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-12">
        <!-- Features -->
        <div class="space-y-4">
          <div
            v-for="(feat, i) in features"
            :key="feat.title"
            :class="[
              'flex gap-4 p-5 bg-[#111111] border border-white/5 rounded-2xl hover:border-orange-500/20 transition-all duration-500 group',
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            ]"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="text-2xl flex-shrink-0 w-12 h-12 bg-white/3 rounded-xl flex items-center justify-center group-hover:bg-orange-500/10 transition-all duration-300">
              {{ feat.icon }}
            </div>
            <div>
              <h3 class="text-white font-bold mb-1">{{ feat.title }}</h3>
              <p class="text-gray-500 text-sm leading-relaxed">{{ feat.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div
          :class="['transition-all duration-700 delay-300', visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8']"
        >
          <h3 class="text-white font-bold text-xl mb-6">Perjalanan Kami</h3>
          <div class="relative">
            <!-- Line -->
            <div class="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/50 via-orange-500/20 to-transparent"></div>

            <div class="space-y-6">
              <div
                v-for="(item, i) in timeline"
                :key="item.year"
                class="flex gap-5 group"
                :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
                :style="{ transition: 'all 0.5s ease', transitionDelay: `${400 + i * 100}ms` }"
              >
                <!-- Dot -->
                <div class="flex-shrink-0 relative z-10">
                  <div class="w-12 h-12 bg-[#1a1a1a] border-2 border-orange-500/30 group-hover:border-orange-500 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-orange-500/10">
                    <span class="text-orange-400 text-xs font-black">{{ item.year }}</span>
                  </div>
                </div>
                <div class="pt-1 pb-2">
                  <h4 class="text-white font-bold mb-1">{{ item.event }}</h4>
                  <p class="text-gray-500 text-sm">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
