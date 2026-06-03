<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { useQueue, type Queue } from '@/composables/useQueue'
import DashboardLayout from '@/components/DashboardLayout.vue'

const {
  adminQueues,
  isLoading,
  fetchAdminQueues,
  scanQueueTicket,
  updateQueueStatus
} = useQueue()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedStatusTab = ref('ALL') // ALL, MENUNGGU, PROSES, SELESAI, BATAL
const searchTokenInput = ref('')

// Scanner modal state
const isScannerOpen = ref(false)
const scannerActive = ref(false)
let html5Qrcode: Html5Qrcode | null = null

// Ticket details modal state (after scanning or manual lookups)
const isDetailsOpen = ref(false)
const scannedQueueDetail = ref<Queue | null>(null)
const scanError = ref('')
const detailsActionLoading = ref(false)

let refreshInterval: any = null

onMounted(async () => {
  await fetchAdminQueues(selectedDate.value, selectedStatusTab.value)
  
  // Refresh queue list automatically every 10 seconds for real-time monitoring
  refreshInterval = setInterval(async () => {
    if (!isScannerOpen.value && !isDetailsOpen.value) {
      await fetchAdminQueues(selectedDate.value, selectedStatusTab.value)
    }
  }, 10000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (html5Qrcode && html5Qrcode.isScanning) {
    html5Qrcode.stop()
  }
})

// Metrics counters
const metrics = computed(() => {
  const list = adminQueues.value
  return {
    total: list.length,
    waiting: list.filter(q => q.status === 'MENUNGGU').length,
    processing: list.filter(q => q.status === 'PROSES').length,
    completed: list.filter(q => q.status === 'SELESAI').length,
    canceled: list.filter(q => q.status === 'BATAL').length
  }
})

async function handleDateChange() {
  await fetchAdminQueues(selectedDate.value, selectedStatusTab.value)
}

async function handleStatusTabChange(tab: string) {
  selectedStatusTab.value = tab
  await fetchAdminQueues(selectedDate.value, tab)
}

// Scanner controllers
async function openScanner() {
  isScannerOpen.value = true
  scannerActive.value = true
  scanError.value = ''
  
  await nextTick()
  try {
    html5Qrcode = new Html5Qrcode('qr-reader')
    await html5Qrcode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      async (decodedText) => {
        // Success callback
        await closeScanner()
        await handleScannedToken(decodedText)
      },
      () => {
        // Silent error logs
      }
    )
  } catch (err) {
    console.error('Camera startup error:', err)
    scanError.value = 'Gagal mengakses kamera. Mohon pastikan izin kamera diberikan.'
    scannerActive.value = false
  }
}

async function closeScanner() {
  if (html5Qrcode && html5Qrcode.isScanning) {
    try {
      await html5Qrcode.stop()
    } catch (err) {
      console.error('Camera stop error:', err)
    }
  }
  isScannerOpen.value = false
  scannerActive.value = false
}

// Handle QR scan or manual lookup code
async function handleScannedToken(tokenString: string) {
  scanError.value = ''
  const cleanToken = tokenString.trim()
  if (!cleanToken) return
  
  const res = await scanQueueTicket(cleanToken)
  if (res.success && res.queue) {
    scannedQueueDetail.value = res.queue
    isDetailsOpen.value = true
  } else {
    alert(res.error || 'Tiket antrian tidak valid atau tidak ditemukan.')
  }
}

async function handleManualLookup() {
  if (!searchTokenInput.value.trim()) return
  await handleScannedToken(searchTokenInput.value)
  searchTokenInput.value = ''
}

// Quick action buttons from list or modal details
async function setStatus(queueId: string, newStatus: 'MENUNGGU' | 'PROSES' | 'SELESAI' | 'BATAL') {
  detailsActionLoading.value = true
  const res = await updateQueueStatus(queueId, newStatus)
  detailsActionLoading.value = false
  
  if (res.success) {
    // If details modal is open, update its state
    if (scannedQueueDetail.value && scannedQueueDetail.value.id === queueId) {
      scannedQueueDetail.value.status = newStatus
    }
    isDetailsOpen.value = false
    scannedQueueDetail.value = null
    
    // Refresh admin queue list
    await fetchAdminQueues(selectedDate.value, selectedStatusTab.value)
  } else {
    alert(res.error || 'Gagal mengubah status antrian.')
  }
}

function formatQueueNumber(num: number) {
  return `A-${String(num).padStart(2, '0')}`
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatTime(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'MENUNGGU':
      return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
    case 'PROSES':
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
    case 'SELESAI':
      return 'bg-green-500/10 border-green-500/20 text-green-400'
    case 'BATAL':
      return 'bg-red-500/10 border-red-500/20 text-red-400'
    default:
      return 'bg-gray-500/10 border-gray-500/20 text-gray-400'
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-white mb-2">Kelola Antrian</h1>
        <p class="text-gray-400">Pantau dan kelola antrian pelanggan hari ini secara real-time.</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3">
        <!-- Scan Button -->
        <button 
          @click="openScanner"
          class="px-5 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/20 text-sm flex items-center gap-2 cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75V16.5zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"/>
          </svg>
          Pindai Kode QR Tiket
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-orange-500/10 transition-all duration-300">
        <span class="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Antrian</span>
        <div class="text-3xl font-black text-white mt-1.5">{{ metrics.total }}</div>
      </div>
      <div class="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-yellow-500/10 transition-all duration-300">
        <span class="text-gray-500 text-xs font-bold uppercase tracking-wider">Menunggu</span>
        <div class="text-3xl font-black text-yellow-400 mt-1.5">{{ metrics.waiting }}</div>
      </div>
      <div class="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-blue-500/10 transition-all duration-300">
        <span class="text-gray-500 text-xs font-bold uppercase tracking-wider">Diproses</span>
        <div class="text-3xl font-black text-blue-400 mt-1.5">{{ metrics.processing }}</div>
      </div>
      <div class="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-green-500/10 transition-all duration-300">
        <span class="text-gray-500 text-xs font-bold uppercase tracking-wider">Selesai Hari Ini</span>
        <div class="text-3xl font-black text-green-400 mt-1.5">{{ metrics.completed }}</div>
      </div>
    </div>

    <!-- Filters & Lookup Bar -->
    <div class="bg-[#111111] border border-white/5 rounded-3xl p-5 lg:p-6 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <!-- Date Filter -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tanggal Antrian</label>
          <input 
            v-model="selectedDate" 
            @change="handleDateChange"
            type="date" 
            class="px-4 py-2.5 bg-[#0d0d0d] border border-white/5 focus:border-orange-500/30 rounded-xl text-sm text-white focus:outline-none transition-all font-semibold"
          >
        </div>

        <!-- Tab Status Buttons -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filter Status</label>
          <div class="flex bg-[#0d0d0d] border border-white/5 p-1 rounded-xl">
            <button 
              v-for="tab in ['ALL', 'MENUNGGU', 'PROSES', 'SELESAI', 'BATAL']" 
              :key="tab"
              @click="handleStatusTabChange(tab)"
              class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              :class="[
                selectedStatusTab === tab 
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                  : 'text-gray-400 hover:text-white border border-transparent'
              ]"
            >
              {{ tab === 'ALL' ? 'Semua' : tab }}
            </button>
          </div>
        </div>
      </div>

      <!-- Manual Code Lookup -->
      <div class="space-y-1 max-w-sm w-full">
        <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lookup Manual Token Tiket</label>
        <form @submit.prevent="handleManualLookup" class="flex gap-2">
          <input 
            v-model="searchTokenInput" 
            type="text" 
            placeholder="Masukkan UUID token tiket..." 
            class="flex-1 px-4 py-2.5 bg-[#0d0d0d] border border-white/5 focus:border-orange-500/50 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all font-mono"
          >
          <button 
            type="submit" 
            class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cari
          </button>
        </form>
      </div>
    </div>

    <!-- Queues Table -->
    <div class="bg-[#111111] border border-white/5 rounded-3xl p-6 lg:p-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-white">Daftar Antrian ({{ formatDate(selectedDate) }})</h2>
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total: {{ adminQueues.length }} motor</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/5 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th class="py-4 px-4 w-20">No. Antrian</th>
              <th class="py-4 px-4">Waktu Daftar</th>
              <th class="py-4 px-4">Pelanggan</th>
              <th class="py-4 px-4">Kendaraan</th>
              <th class="py-4 px-4">Layanan</th>
              <th class="py-4 px-4">Status</th>
              <th class="py-4 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-sm text-gray-300">
            <tr v-if="adminQueues.length === 0">
              <td colspan="7" class="py-8 text-center text-gray-500 italic">Tidak ada data antrian untuk filter terpilih.</td>
            </tr>
            <tr 
              v-for="q in adminQueues" 
              :key="q.id" 
              class="hover:bg-white/5 transition-colors"
            >
              <td class="py-4 px-4 font-mono font-black text-lg text-white">
                {{ formatQueueNumber(q.nomorAntrian) }}
              </td>
              <td class="py-4 px-4 text-xs font-mono text-gray-400">
                {{ formatTime(q.createdAt) }}
              </td>
              <td class="py-4 px-4">
                <div class="font-bold text-white">{{ q.user?.nama }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ q.user?.noHp }}</div>
              </td>
              <td class="py-4 px-4">
                <div>{{ q.merkMotor }}</div>
                <div class="text-xs font-mono text-orange-400/80 font-semibold mt-0.5 select-all uppercase">{{ q.platNomor }}</div>
              </td>
              <td class="py-4 px-4">
                <span class="font-medium">{{ q.kategoriServis }}</span>
                <span v-if="q.keluhan" class="block text-[11px] text-gray-500 italic truncate max-w-[150px] mt-0.5" :title="q.keluhan">
                  "{{ q.keluhan }}"
                </span>
              </td>
              <td class="py-4 px-4">
                <span class="inline-block px-2.5 py-1 rounded-full border text-[10px] font-bold" :class="getStatusBadgeClass(q.status)">
                  {{ q.status }}
                </span>
              </td>
              <td class="py-4 px-4 text-right">
                <div class="flex justify-end gap-2">
                  <!-- Start Service -->
                  <button 
                    v-if="q.status === 'MENUNGGU'"
                    @click="setStatus(q.id, 'PROSES')"
                    class="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    🛠️ Mulai Servis
                  </button>

                  <!-- Complete Service -->
                  <button 
                    v-if="q.status === 'PROSES'"
                    @click="setStatus(q.id, 'SELESAI')"
                    class="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    ✅ Selesaikan
                  </button>

                  <!-- Cancel / Delete Queue -->
                  <button 
                    v-if="q.status === 'MENUNGGU' || q.status === 'PROSES'"
                    @click="setStatus(q.id, 'BATAL')"
                    class="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    ❌ Batalkan
                  </button>
                  
                  <span v-else class="text-xs text-gray-500">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Scanner Dialog Modal -->
    <div v-if="isScannerOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-[#111111] border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        <div class="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">Scan QR Antrian</h3>
          <button @click="closeScanner" class="w-8 h-8 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 flex flex-col items-center justify-center">
          <div v-if="scanError" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs w-full mb-4 text-center">
            {{ scanError }}
          </div>
          
          <div class="relative w-full max-w-[280px] aspect-square bg-black border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center">
            <!-- QR Scanner Container -->
            <div id="qr-reader" class="w-full h-full"></div>
            
            <!-- Scanning Laser Line Effect -->
            <div v-if="scannerActive" class="absolute left-0 w-full h-0.5 bg-orange-500/80 shadow-md shadow-orange-500/50 animate-[scan_2s_infinite]"></div>
          </div>

          <p class="text-xs text-gray-500 mt-4 text-center">
            Posisikan kode QR antrian pelanggan di dalam kotak kamera.
          </p>
        </div>

        <div class="p-6 bg-[#0d0d0d] border-t border-white/5 flex justify-end">
          <button 
            @click="closeScanner"
            class="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold rounded-xl transition-all cursor-pointer text-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Ticket Detail Modal (After Scanning) -->
    <div v-if="isDetailsOpen && scannedQueueDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-[#111111] border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        <div class="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">Detail Tiket Antrian</h3>
          <button @click="isDetailsOpen = false" class="w-8 h-8 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Main details -->
          <div class="text-center bg-[#0d0d0d] border border-white/5 rounded-2xl p-6">
            <div class="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Nomor Antrian</div>
            <div class="text-5xl font-black text-white mb-3">
              {{ formatQueueNumber(scannedQueueDetail.nomorAntrian) }}
            </div>
            <span class="px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider" :class="getStatusBadgeClass(scannedQueueDetail.status)">
              {{ scannedQueueDetail.status }}
            </span>
          </div>

          <!-- Metadata -->
          <div class="space-y-3 text-sm">
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="text-gray-500">Nama Pelanggan</span>
              <span class="text-white font-semibold">{{ scannedQueueDetail.user?.nama }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="text-gray-500">Nomor Telepon</span>
              <span class="text-white font-semibold font-mono select-all">{{ scannedQueueDetail.user?.noHp }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="text-gray-500">Merk / Tipe Motor</span>
              <span class="text-white font-semibold">{{ scannedQueueDetail.merkMotor }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="text-gray-500">Nomor Polisi</span>
              <span class="text-white font-semibold font-mono uppercase select-all">{{ scannedQueueDetail.platNomor }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="text-gray-500">Kategori Servis</span>
              <span class="text-orange-400 font-bold">{{ scannedQueueDetail.kategoriServis }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Waktu Mendaftar</span>
              <span class="text-gray-400">{{ formatDate(scannedQueueDetail.createdAt) }} - {{ formatTime(scannedQueueDetail.createdAt) }}</span>
            </div>
            <div v-if="scannedQueueDetail.keluhan" class="pt-2">
              <span class="text-gray-500 block mb-1">Catatan Keluhan:</span>
              <p class="text-gray-400 text-xs italic bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed">{{ scannedQueueDetail.keluhan }}</p>
            </div>
          </div>
        </div>

        <!-- Action panel in modal -->
        <div class="p-6 bg-[#0d0d0d] border-t border-white/5 flex flex-col gap-3">
          <div class="flex gap-2">
            <!-- Start Service -->
            <button 
              v-if="scannedQueueDetail.status === 'MENUNGGU'"
              @click="setStatus(scannedQueueDetail.id, 'PROSES')"
              class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
              :disabled="detailsActionLoading"
            >
              🛠️ Mulai Servis
            </button>

            <!-- Complete Service -->
            <button 
              v-if="scannedQueueDetail.status === 'PROSES'"
              @click="setStatus(scannedQueueDetail.id, 'SELESAI')"
              class="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
              :disabled="detailsActionLoading"
            >
              ✅ Selesaikan Servis
            </button>

            <!-- Cancel / Delete Queue -->
            <button 
              v-if="scannedQueueDetail.status === 'MENUNGGU' || scannedQueueDetail.status === 'PROSES'"
              @click="setStatus(scannedQueueDetail.id, 'BATAL')"
              class="py-3 px-5 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold rounded-xl transition-all cursor-pointer text-sm"
              :disabled="detailsActionLoading"
            >
              Batalkan
            </button>
          </div>
          <button 
            @click="isDetailsOpen = false"
            class="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style>
/* CSS scanning laser line keyframe */
@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* Override html5-qrcode standard styles to be clean & minimal */
#qr-reader {
  border: none !important;
}
#qr-reader__scan_region {
  border: none !important;
  background: black !important;
}
#qr-reader__scan_region video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
#qr-reader img {
  display: none !important;
}
</style>
