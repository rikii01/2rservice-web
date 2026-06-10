<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const visible = ref(false);

// ─── Queue live data ───────────────────────────────────────────
const API_URL = 'http://localhost:3000/api';

const totalWaiting = ref<number | null>(null);
const currentServingNumber = ref<number | null>(null);
const estimasiMenit = ref<number | null>(null);
const mekanikTersedia = ref(2);
const queueLoading = ref(true);

async function fetchPublicStatus() {
  try {
    const res = await fetch(`${API_URL}/queue/public-status`);
    if (res.ok) {
      const data = await res.json();
      totalWaiting.value = data.totalWaiting;
      currentServingNumber.value = data.currentServingNumber;
      estimasiMenit.value = data.estimasiMenit;
      mekanikTersedia.value = data.mekanikTersedia ?? 2;
    }
  } catch (e) {
    // Server unreachable — keep last values or show fallback
  } finally {
    queueLoading.value = false;
  }
}

const queueStats = computed(() => [
  {
    label: 'Antrian Menunggu',
    value: queueLoading.value
      ? '...'
      : totalWaiting.value !== null
        ? `${totalWaiting.value} antrian`
        : '-',
    color: 'text-orange-400',
  },
  {
    label: 'Estimasi Tunggu',
    value: queueLoading.value
      ? '...'
      : estimasiMenit.value !== null
        ? estimasiMenit.value === 0
          ? 'Langsung'
          : `± ${estimasiMenit.value} menit`
        : '-',
    color: 'text-green-400',
  },
  {
    label: 'Mekanik Tersedia',
    value: `${mekanikTersedia.value} orang`,
    color: 'text-blue-400',
  },
]);

let refreshInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  setTimeout(() => (visible.value = true), 100);
  fetchPublicStatus();
  refreshInterval = setInterval(fetchPublicStatus, 30_000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});

function scrollTo(href: string) {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function goToLogin() {
  router.push('/login');
}
</script>

<template>
  <section
    id="home"
    class="relative min-h-screen flex items-center justify-center overflow-hidden"
  >
    <!-- Background Gradient + Noise -->
    <div class="absolute inset-0 bg-[#0a0a0a]">
      <!-- Radial glow -->
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px]"
      ></div>
      <div
        class="absolute top-20 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[100px]"
      ></div>
      <div
        class="absolute bottom-20 left-0 w-80 h-80 bg-orange-400/5 rounded-full blur-[100px]"
      ></div>

      <!-- Grid pattern -->
      <div
        class="absolute inset-0 opacity-[0.02]"
        style="
          background-image:
            linear-gradient(#fff 1px, transparent 1px),
            linear-gradient(90deg, #fff 1px, transparent 1px);
          background-size: 60px 60px;
        "
      ></div>
    </div>

    <!-- Floating particles -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        v-for="i in 8"
        :key="i"
        class="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-float"
        :style="{
          left: `${10 + i * 12}%`,
          top: `${20 + (i % 3) * 25}%`,
          animationDelay: `${i * 0.7}s`,
          animationDuration: `${4 + (i % 3)}s`,
        }"
      ></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <!-- Left Content -->
        <div
          :class="[
            'flex-1 transition-all duration-1000',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          ]"
        >
          <!-- Badge -->
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6"
          >
            <div class="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span class="text-orange-400 text-sm font-medium"
              >Bengkel Terpercaya di Bireuen</span
            >
          </div>

          <!-- Heading -->
          <h1
            class="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          >
            <span class="text-white">Servis Motor</span><br />
            <span
              class="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent"
            >
              Cepat &amp; Tepat
            </span>
          </h1>

          <p class="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl">
            2R Service hadir untuk memastikan motor Anda selalu dalam kondisi
            prima. Teknisi berpengalaman, spare part original, dan sistem
            antrian digital untuk kenyamanan servis Anda.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="goToLogin()"
              class="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 text-base"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Ambil Nomor Antrian
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
            <button
              @click="scrollTo('#services')"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-2xl transition-all duration-300 text-base"
            >
              Lihat Layanan
            </button>
          </div>

          <!-- Stats -->
          <div
            class="mt-14 grid grid-cols-3 gap-6 pt-10 border-t border-white/5"
          >
            <div
              v-for="stat in [
                { value: '7000+', label: 'Motor Diservis' },
                { value: '10+ Thn', label: 'Pengalaman' },
                { value: '4.8★', label: 'Rating Pelanggan' },
              ]"
              :key="stat.label"
              class="text-center"
            >
              <div class="text-2xl lg:text-3xl font-black text-white">
                {{ stat.value }}
              </div>
              <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- Right Visual -->
        <div
          :class="[
            'flex-1 flex items-center justify-center transition-all duration-1000 delay-300',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          ]"
        >
          <div class="relative w-full max-w-md">
            <!-- Main Card -->
            <div
              class="relative bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-3xl border border-white/8 p-8 shadow-2xl"
            >
              <!-- Glow ring -->
              <div
                class="absolute -inset-[1px] bg-gradient-to-br from-orange-500/20 to-transparent rounded-3xl pointer-events-none"
              ></div>

              <!-- Icon -->
              <div
                class="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-orange-500/30"
              >
                <svg
                  viewBox="0 0 64 64"
                  class="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <circle cx="16" cy="44" r="8" />
                  <circle cx="48" cy="44" r="8" />
                  <path
                    d="M24 44h16M8 44H4a2 2 0 01-2-2V32l10-16h32l10 16v10a2 2 0 01-2 2h-4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path d="M14 24h8M28 16h20" stroke-linecap="round" />
                </svg>
              </div>

              <h3 class="text-xl font-bold text-white mb-2">Servis Sekarang</h3>
              <p class="text-gray-400 text-sm mb-6">
                Ambil nomor antrian digital tanpa perlu menunggu lama di bengkel
              </p>

              <!-- Queue Status (live data) -->
              <div class="space-y-3">
                <div
                  v-for="item in queueStats"
                  :key="item.label"
                  class="flex items-center justify-between px-4 py-3 bg-white/3 rounded-xl border border-white/5"
                >
                  <span class="text-gray-400 text-sm">{{ item.label }}</span>
                  <span
                    :class="[
                      'font-bold text-sm transition-all duration-300',
                      item.color,
                      queueLoading ? 'opacity-40 animate-pulse' : 'opacity-100',
                    ]"
                  >{{ item.value }}</span>
                </div>
              </div>

              <button
                @click="goToLogin()"
                class="mt-6 w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/25"
              >
                Ambil Antrian →
              </button>
            </div>

            <!-- Floating badge -->
            <div
              class="absolute -top-4 -right-4 bg-gradient-to-br from-green-400 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-1.5"
            >
              <div
                class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"
              ></div>
              Buka Sekarang
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div
      class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-40"
    >
      <div
        class="w-6 h-9 border-2 border-white/30 rounded-full flex items-start justify-center pt-2"
      >
        <div class="w-1 h-2 bg-white/60 rounded-full animate-scroll-dot"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.5);
    opacity: 0.6;
  }
}
@keyframes scroll-dot {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(12px);
    opacity: 0;
  }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
.animate-scroll-dot {
  animation: scroll-dot 1.5s ease-in-out infinite;
}
</style>
