<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import QRCode from 'qrcode'
import { useQueue } from '@/composables/useQueue'
import DashboardLayout from '@/components/DashboardLayout.vue'

const {
  activeQueue,
  queuesAhead,
  currentServingNumber,
  queueHistory,
  isLoading,
  error,
  createQueue,
  fetchActiveQueue,
  fetchHistory,
  cancelQueue
} = useQueue()

// Form refs
const kategoriServis = ref('')
const merkMotor = ref('')
const platNomor = ref('')
const keluhan = ref('')
const submitError = ref('')
const isSubmitting = ref(false)

const qrCanvas = ref<HTMLCanvasElement | null>(null)
let refreshInterval: any = null

const categories = [
  'Servis Ringan (Tune Up)',
  'Servis Lengkap',
  'Ganti Oli',
  'Servis CVT (Matic)',
  'Servis Injeksi / Karburator',
  'Turun Mesin (Overhaul)',
  'Ganti Ban / Kampas Rem',
  'Lain-lain'
]

async function generateQr() {
  if (activeQueue.value && qrCanvas.value) {
    try {
      await QRCode.toCanvas(qrCanvas.value, activeQueue.value.qrToken, {
        width: 180,
        margin: 2,
        color: {
          dark: '#0e0e0e',
          light: '#ffffff'
        }
      })
    } catch (err) {
      console.error('Failed to generate QR Code:', err)
    }
  }
}

watch(activeQueue, (newVal) => {
  if (newVal) {
    nextTick(() => {
      generateQr()
    })
  }
}, { immediate: true })

onMounted(async () => {
  await fetchActiveQueue()
  await fetchHistory()
  
  // Auto-refresh active queue state every 15 seconds
  refreshInterval = setInterval(async () => {
    if (activeQueue.value) {
      await fetchActiveQueue()
    }
  }, 15000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

async function handleBooking() {
  if (!kategoriServis.value || !merkMotor.value || !platNomor.value) {
    submitError.value = 'Silakan lengkapi semua bidang yang wajib diisi.'
    return
  }
  
  isSubmitting.value = true
  submitError.value = ''
  
  const result = await createQueue({
    kategoriServis: kategoriServis.value,
    merkMotor: merkMotor.value,
    platNomor: platNomor.value,
    keluhan: keluhan.value || null
  })
  
  isSubmitting.value = false
  
  if (result.success) {
    // Reset form
    kategoriServis.value = ''
    merkMotor.value = ''
    platNomor.value = ''
    keluhan.value = ''
  } else {
    submitError.value = result.error || 'Terjadi kesalahan saat mengambil antrian.'
  }
}

async function handleCancel() {
  if (confirm('Apakah Anda yakin ingin membatalkan antrian ini?')) {
    const res = await cancelQueue()
    if (!res.success) {
      alert(res.error || 'Gagal membatalkan antrian.')
    }
  }
}

function formatQueueNumber(num: number) {
  return `A-${String(num).padStart(2, '0')}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
    <div class="mb-8">
      <h1 class="text-3xl font-black text-white mb-2">Ambil Antrian</h1>
      <p class="text-gray-400">Daftarkan sepeda motor Anda secara online untuk mendapatkan nomor antrian digital.</p>
    </div>

    <!-- Active Queue Status Banner -->
    <div v-if="activeQueue" class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
      <!-- Ticket Mockup -->
      <div class="lg:col-span-5 flex justify-center">
        <div class="relative w-full max-w-sm bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/5 flex flex-col">
          <!-- Top section (Ticket Header) -->
          <div class="p-6 border-b border-dashed border-white/10 bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-transparent text-center relative">
            <div class="absolute -bottom-2 -left-2 w-4 h-4 bg-[#0a0a0a] rounded-full border-r border-white/5"></div>
            <div class="absolute -bottom-2 -right-2 w-4 h-4 bg-[#0a0a0a] rounded-full border-l border-white/5"></div>
            
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-4" :class="getStatusBadgeClass(activeQueue.status)">
              {{ activeQueue.status === 'MENUNGGU' ? '⏳ Menunggu' : '⚙️ Sedang Diproses' }}
            </div>
            
            <div class="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Nomor Antrian Anda</div>
            <div class="text-6xl font-black text-white tracking-tight mb-2 select-all">
              {{ formatQueueNumber(activeQueue.nomorAntrian) }}
            </div>
            
            <div class="text-[11px] text-gray-400 mt-2 font-mono">
              Tiket ID: {{ activeQueue.id.slice(0, 10) }}...
            </div>
          </div>

          <!-- Mid section (QR Code) -->
          <div class="p-6 flex flex-col items-center justify-center border-b border-dashed border-white/10 bg-[#0e0e0e] relative">
            <div class="absolute -top-2 -left-2 w-4 h-4 bg-[#0a0a0a] rounded-full border-r border-white/5"></div>
            <div class="absolute -top-2 -right-2 w-4 h-4 bg-[#0a0a0a] rounded-full border-l border-white/5"></div>
            <div class="absolute -bottom-2 -left-2 w-4 h-4 bg-[#0a0a0a] rounded-full border-r border-white/5"></div>
            <div class="absolute -bottom-2 -right-2 w-4 h-4 bg-[#0a0a0a] rounded-full border-l border-white/5"></div>

            <div class="p-3 bg-white rounded-2xl mb-4 shadow-inner flex items-center justify-center">
              <canvas ref="qrCanvas" class="w-[180px] h-[180px]"></canvas>
            </div>
            <p class="text-xs text-gray-500 text-center font-medium px-4">
              Perlihatkan kode QR ini ke mekanik/admin saat tiba di bengkel untuk dipindai.
            </p>
          </div>

          <!-- Bottom section (Ticket Details) -->
          <div class="p-6 bg-[#111111] flex-1 flex flex-col justify-between">
            <div class="space-y-3.5 mb-6">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Pemilik</span>
                <span class="text-white font-semibold">{{ activeQueue.user?.nama }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Motor</span>
                <span class="text-white font-semibold">{{ activeQueue.merkMotor }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Nomor Polisi</span>
                <span class="text-white font-semibold select-all font-mono">{{ activeQueue.platNomor }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Jenis Servis</span>
                <span class="text-orange-400 font-bold">{{ activeQueue.kategoriServis }}</span>
              </div>
              <div v-if="activeQueue.keluhan" class="text-sm pt-2 border-t border-white/5">
                <span class="text-gray-500 block mb-1">Keluhan/Catatan:</span>
                <span class="text-gray-400 text-xs italic block bg-white/5 p-2.5 rounded-lg border border-white/5">{{ activeQueue.keluhan }}</span>
              </div>
            </div>

            <div class="space-y-3">
              <button 
                v-if="activeQueue.status === 'MENUNGGU'"
                @click="handleCancel"
                class="w-full py-3 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold rounded-xl transition-all duration-300 text-sm cursor-pointer"
              >
                Batalkan Antrian
              </button>
              <div class="text-[10px] text-gray-500 text-center">
                Daftar pada: {{ formatDate(activeQueue.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ticket Queue Metrics -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Live status board -->
        <div class="bg-[#111111] border border-white/5 rounded-3xl p-6 lg:p-8">
          <h2 class="text-xl font-bold text-white mb-6 flex items-center justify-between">
            <span>Status Antrian Real-Time</span>
            <button 
              @click="fetchActiveQueue" 
              class="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              :disabled="isLoading"
            >
              <svg class="w-3.5 h-3.5" :class="{'animate-spin': isLoading}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
              </svg>
              Segarkan
            </button>
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <!-- Serving now -->
            <div class="bg-[#0b0b0b] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
              <span class="text-gray-500 text-xs font-bold uppercase tracking-wider">Antrian Sedang Dilayani</span>
              <div class="my-4">
                <span v-if="currentServingNumber" class="text-4xl font-black text-green-400">
                  {{ formatQueueNumber(currentServingNumber) }}
                </span>
                <span v-else class="text-2xl font-bold text-gray-500 italic">
                  Belum Ada
                </span>
              </div>
              <p class="text-[11px] text-gray-500">Mekanik kami sedang mengerjakan nomor antrian di atas.</p>
            </div>

            <!-- Wait position -->
            <div class="bg-[#0b0b0b] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
              <span class="text-gray-500 text-xs font-bold uppercase tracking-wider">Antrian Di Depan Anda</span>
              <div class="my-4">
                <span class="text-4xl font-black text-orange-400">
                  {{ queuesAhead }}
                </span>
                <span class="text-lg font-bold text-gray-400 ml-1.5">motor</span>
              </div>
              <p class="text-[11px] text-gray-500">Jumlah antrian sebelum giliran Anda dipanggil.</p>
            </div>
          </div>

          <!-- Alert / Info -->
          <div class="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400 text-sm flex gap-3">
            <div class="w-5 h-5 flex-shrink-0 mt-0.5">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h4 class="font-bold mb-1">Ketentuan Kedatangan</h4>
              <p class="text-xs text-orange-400/80 leading-relaxed">
                Silakan datang ke lokasi bengkel maksimal 10 menit sebelum estimasi giliran Anda. Tunjukkan tiket QR kepada Admin di pintu masuk. Jika Anda terlambat lebih dari 15 menit saat nomor dipanggil, antrian Anda akan dibatalkan otomatis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Form (Visible if no active queue) -->
    <div v-else class="max-w-2xl bg-[#111111] border border-white/5 rounded-3xl p-6 lg:p-8 mb-10 shadow-xl">
      <h2 class="text-xl font-bold text-white mb-6">Pendaftaran Antrian Baru</h2>
      
      <form @submit.prevent="handleBooking" class="space-y-5">
        <div v-if="submitError" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {{ submitError }}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Merk Motor -->
          <div class="space-y-2">
            <label for="merkMotor" class="block text-sm font-semibold text-gray-300">Merk / Tipe Motor <span class="text-red-500">*</span></label>
            <input 
              id="merkMotor" 
              v-model="merkMotor" 
              type="text" 
              placeholder="Contoh: Honda Vario 150" 
              class="w-full px-4 py-3 bg-[#0d0d0d] border border-white/5 focus:border-orange-500/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none transition-all duration-300"
              required
            >
          </div>

          <!-- Plat Nomor -->
          <div class="space-y-2">
            <label for="platNomor" class="block text-sm font-semibold text-gray-300">Nomor Polisi / Plat Motor <span class="text-red-500">*</span></label>
            <input 
              id="platNomor" 
              v-model="platNomor" 
              type="text" 
              placeholder="Contoh: B 1234 ABC" 
              class="w-full px-4 py-3 bg-[#0d0d0d] border border-white/5 focus:border-orange-500/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none transition-all duration-300 font-mono uppercase"
              required
            >
          </div>
        </div>

        <!-- Kategori Servis -->
        <div class="space-y-2">
          <label for="kategoriServis" class="block text-sm font-semibold text-gray-300">Pilih Kategori Servis <span class="text-red-500">*</span></label>
          <div class="relative">
            <select 
              id="kategoriServis" 
              v-model="kategoriServis" 
              class="w-full px-4 py-3 bg-[#0d0d0d] border border-white/5 focus:border-orange-500/50 rounded-xl text-sm text-white focus:outline-none transition-all duration-300 appearance-none"
              required
            >
              <option value="" disabled selected class="text-gray-600">Pilih kategori servis...</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        <!-- Keluhan -->
        <div class="space-y-2">
          <label for="keluhan" class="block text-sm font-semibold text-gray-300">Keluhan / Catatan Tambahan (Opsional)</label>
          <textarea 
            id="keluhan" 
            v-model="keluhan" 
            rows="3" 
            placeholder="Tuliskan keluhan atau suku cadang yang ingin diganti jika ada..." 
            class="w-full px-4 py-3 bg-[#0d0d0d] border border-white/5 focus:border-orange-500/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none transition-all duration-300"
          ></textarea>
        </div>

        <button 
          type="submit" 
          class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <span>Dapatkan Nomor Antrian</span>
        </button>
      </form>
    </div>

    <!-- Queue History -->
    <div class="bg-[#111111] border border-white/5 rounded-3xl p-6 lg:p-8">
      <h2 class="text-xl font-bold text-white mb-6">Riwayat Antrian Saya</h2>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/5 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th class="py-4 px-4">Tanggal</th>
              <th class="py-4 px-4">Nomor Antrian</th>
              <th class="py-4 px-4">Motor</th>
              <th class="py-4 px-4">Servis</th>
              <th class="py-4 px-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-sm text-gray-300">
            <tr v-if="queueHistory.length === 0">
              <td colspan="5" class="py-8 text-center text-gray-500 italic">Belum ada riwayat antrian.</td>
            </tr>
            <tr 
              v-for="q in queueHistory" 
              :key="q.id" 
              class="hover:bg-white/5 transition-colors"
            >
              <td class="py-4 px-4">{{ formatDate(q.createdAt) }}</td>
              <td class="py-4 px-4 font-mono font-bold">{{ formatQueueNumber(q.nomorAntrian) }}</td>
              <td class="py-4 px-4">
                <div>{{ q.merkMotor }}</div>
                <div class="text-[11px] text-gray-500 font-mono mt-0.5">{{ q.platNomor }}</div>
              </td>
              <td class="py-4 px-4">{{ q.kategoriServis }}</td>
              <td class="py-4 px-4">
                <span class="inline-block px-2.5 py-1 rounded-full border text-[10px] font-bold" :class="getStatusBadgeClass(q.status)">
                  {{ q.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
select {
  background-image: none;
}
</style>
