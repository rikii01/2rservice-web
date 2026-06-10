<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useQueue } from '@/composables/useQueue'
import { useFinance } from '@/composables/useFinance'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const router = useRouter()
const { user, isAuthenticated, isAdmin, fetchMe } = useAuth()
const {
  activeQueue,
  queuesAhead,
  queueHistory,
  adminQueues,
  fetchActiveQueue,
  fetchHistory,
  fetchAdminQueues
} = useQueue()
const { summary, fetchSummary } = useFinance()

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  await fetchMe()
  
  if (isAdmin.value) {
    // Admin: Fetch today's queues for metrics
    const todayStr = new Date().toISOString().split('T')[0] as string
    await fetchAdminQueues(todayStr)
    
    // Fetch finance summary for current month
    const firstDay = todayStr.substring(0, 7) + '-01'
    await fetchSummary(firstDay, todayStr)
  } else {
    // Customer: Fetch active queue and history
    await fetchActiveQueue()
    await fetchHistory()
  }
})

// Calculations for Pelanggan
const completedServicesCount = computed(() => {
  return queueHistory.value.filter(q => q.status === 'SELESAI').length
})

// Calculations for Admin
const adminMetrics = computed(() => {
  return {
    total: adminQueues.value.length,
    waiting: adminQueues.value.filter(q => q.status === 'MENUNGGU').length,
    processing: adminQueues.value.filter(q => q.status === 'PROSES').length,
    completed: adminQueues.value.filter(q => q.status === 'SELESAI').length
  }
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatQueueNumber(num: number) {
  return `A-${String(num).padStart(2, '0')}`
}

// Chart Configuration
const chartData = computed(() => {
  if (!summary.value) return { labels: [], datasets: [] }
  const s = summary.value
  return {
    labels: ['Ongkos Servis', 'Sparepart/Oli'],
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        backgroundColor: ['rgba(249, 115, 22, 0.8)', 'rgba(59, 130, 246, 0.8)'],
        hoverBackgroundColor: ['#f97316', '#3b82f6'],
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 40,
        data: [s.totalOngkos, s.totalSparepart]
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#111111',
      titleColor: '#9ca3af',
      bodyColor: '#ffffff',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      callbacks: {
        label: function(context: any) {
          let value = context.raw || 0;
          return 'Rp ' + value.toLocaleString('id-ID');
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { display: false },
      border: { display: false },
      ticks: { 
        color: '#6b7280',
        font: { size: 11 },
        callback: function(value: any) {
          if (value === 0) return '0';
          if (value >= 1000000) return (value / 1000000) + 'M';
          if (value >= 1000) return (value / 1000) + 'K';
          return value;
        }
      }
    },
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#9ca3af', font: { size: 12, weight: 500 } }
    }
  }
}
</script>

<template>
  <DashboardLayout>
    <!-- Welcome Header -->
    <div class="mb-10">
      <h1 class="text-3xl lg:text-4xl font-black text-white mb-2">
        Selamat Datang, <span class="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">{{ user?.nama }}!</span>
      </h1>
      <p class="text-gray-400 font-medium">Dashboard {{ isAdmin ? 'Administrator' : 'Pelanggan' }} — 2R Service Bengkel Motor</p>
    </div>

    <!-- Info Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      <!-- Profile Card -->
      <div class="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all duration-300">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
          </div>
          <h3 class="text-white font-bold">Profil Saya</h3>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-500 text-sm">Nama</span>
            <span class="text-white text-sm font-medium">{{ user?.nama }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 text-sm">Email</span>
            <span class="text-white text-sm font-medium truncate max-w-[180px]">{{ user?.email }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 text-sm">No. HP</span>
            <span class="text-white text-sm font-medium">{{ user?.noHp }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 text-sm">Bergabung</span>
            <span class="text-white text-sm font-medium">{{ user?.createdAt ? formatDate(user.createdAt) : '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Queue Card (Dynamic based on Role) -->
      <!-- ADMIN VIEW -->
      <div v-if="isAdmin" class="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all duration-300">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="text-white font-bold">Antrian Aktif Hari Ini</h3>
        </div>
        <div class="grid grid-cols-2 gap-4 py-3 mb-4">
          <div class="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
            <div class="text-2xl font-black text-yellow-400">{{ adminMetrics.waiting }}</div>
            <div class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Menunggu</div>
          </div>
          <div class="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
            <div class="text-2xl font-black text-blue-400">{{ adminMetrics.processing }}</div>
            <div class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Diproses</div>
          </div>
        </div>
        <router-link to="/admin/queues" class="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center cursor-pointer">
          Kelola Antrian
        </router-link>
      </div>

      <!-- PELANGGAN VIEW -->
      <div v-else class="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all duration-300">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="text-white font-bold">Antrian Saya</h3>
        </div>
        
        <div v-if="activeQueue" class="space-y-4 py-2 mb-4">
          <div class="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
            <div>
              <span class="text-xs text-gray-500 block uppercase font-bold tracking-wider">No. Antrian</span>
              <span class="text-2xl font-black text-white">{{ formatQueueNumber(activeQueue.nomorAntrian) }}</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-gray-500 block uppercase font-bold tracking-wider">Status</span>
              <span class="text-xs font-bold text-orange-400 uppercase tracking-wider">{{ activeQueue.status }}</span>
            </div>
          </div>
          <div class="text-xs text-gray-400 text-center">
            Ada <strong class="text-orange-400 font-bold">{{ queuesAhead }} motor</strong> di depan Anda.
          </div>
        </div>

        <div v-else class="flex items-center justify-center py-7">
          <div class="text-center">
            <div class="text-5xl font-black text-white/10 mb-2">—</div>
            <p class="text-gray-500 text-sm">Belum ada antrian aktif</p>
          </div>
        </div>

        <router-link to="/queue" class="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center cursor-pointer">
          {{ activeQueue ? 'Lihat Tiket Antrian' : 'Ambil Antrian Baru' }}
        </router-link>
      </div>

      <!-- Status Card (Dynamic based on Role) -->
      <!-- ADMIN VIEW -->
      <div v-if="isAdmin" class="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all duration-300">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-white font-bold">Selesai Hari Ini</h3>
        </div>
        <div class="flex items-center justify-center py-8">
          <div class="text-center">
            <div class="text-5xl font-black text-white/10 mb-2">{{ adminMetrics.completed }}</div>
            <p class="text-gray-500 text-sm">Total motor selesai diservis</p>
          </div>
        </div>
        <router-link to="/admin/queues" class="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all duration-300 text-sm flex items-center justify-center cursor-pointer">
          Lihat Detail
        </router-link>
      </div>

      <!-- PELANGGAN VIEW -->
      <div v-else class="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all duration-300">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-white font-bold">Riwayat Servis</h3>
        </div>
        <div class="flex items-center justify-center py-8">
          <div class="text-center">
            <div class="text-5xl font-black text-white/10 mb-2">{{ completedServicesCount }}</div>
            <p class="text-gray-500 text-sm">Total servis selesai</p>
          </div>
        </div>
        <router-link to="/queue" class="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all duration-300 text-sm flex items-center justify-center cursor-pointer">
          Lihat Riwayat
        </router-link>
      </div>
    </div>

    <!-- Chart Card (Admin Only) -->
    <div v-if="isAdmin" class="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all duration-300 mb-10">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 class="text-white font-bold">Ringkasan Pendapatan Bulan Ini</h3>
        </div>
      </div>
      <div class="h-[300px] w-full relative">
        <Bar v-if="summary" :data="chartData" :options="chartOptions" />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-500 text-sm animate-pulse">
          Memuat grafik...
        </div>
      </div>
    </div>

    <!-- Role Badge -->
    <div class="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
      <div class="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
      <span class="text-orange-400 text-xs font-semibold uppercase tracking-wider">
        {{ isAdmin ? '🔑 Mode Administrator' : '👤 Akun Pelanggan' }}
      </span>
    </div>
  </DashboardLayout>
</template>
