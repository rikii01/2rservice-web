<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useFinance, type FinanceFormData, type SparepartItem, type KategoriSparepart, type FinancialRecord } from '@/composables/useFinance'
import DashboardLayout from '@/components/DashboardLayout.vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const router = useRouter()
const { isAdmin, isAuthenticated } = useAuth()
const { records, summary, isLoading, fetchRecords, fetchSummary, createRecord, updateRecord, deleteRecord } = useFinance()

// ─── Filter ───────────────────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0] as string
const filterFrom = ref(today.substring(0, 7) + '-01') // awal bulan ini
const filterTo   = ref(today)

async function applyFilter() {
  await Promise.all([
    fetchRecords(filterFrom.value, filterTo.value),
    fetchSummary(filterFrom.value, filterTo.value),
  ])
}

onMounted(async () => {
  if (!isAuthenticated.value || !isAdmin.value) {
    router.push('/dashboard')
    return
  }
  await applyFilter()
})

// ─── Form State ───────────────────────────────────────────────────────────────
const showModal  = ref(false)
const editingId  = ref<string | null>(null)
const formError  = ref<string | null>(null)
const formSuccess = ref<string | null>(null)

const KATEGORI_SERVIS_OPTIONS = [
  'Servis Ringan', 'Servis Besar', 'Ganti Oli', 'Tune Up',
  'Ganti Sparepart', 'Perbaikan Mesin', 'Lainnya',
]

const SPAREPART_KATEGORI_OPTIONS: KategoriSparepart[] = [
  'SPAREPART', 'OLI', 'FILTER', 'BATERAI', 'LAINNYA',
]

const SPAREPART_LABEL: Record<KategoriSparepart, string> = {
  SPAREPART: 'Sparepart',
  OLI: 'Oli',
  FILTER: 'Filter',
  BATERAI: 'Baterai',
  LAINNYA: 'Lainnya',
}

function freshForm(): FinanceFormData {
  return {
    queueId: null,
    merkMotor: '',
    platNomor: '',
    kategoriServis: '',
    ongkosServis: 0,
    catatan: '',
    tanggal: today,
    sparepartItems: [],
  }
}

const form = ref<FinanceFormData>(freshForm())

function openAddModal() {
  editingId.value = null
  form.value = freshForm()
  formError.value = null
  formSuccess.value = null
  showModal.value = true
}

function openEditModal(record: FinancialRecord) {
  editingId.value = record.id
  form.value = {
    queueId: record.queueId ?? null,
    merkMotor: record.merkMotor,
    platNomor: record.platNomor,
    kategoriServis: record.kategoriServis,
    ongkosServis: record.ongkosServis,
    catatan: record.catatan ?? '',
    tanggal: record.tanggal.split('T')[0] as string,
    sparepartItems: record.sparepartItems.map(s => ({
      nama: s.nama,
      kategori: s.kategori as KategoriSparepart,
      jumlah: s.jumlah,
      hargaSatuan: s.hargaSatuan,
      subtotal: s.subtotal,
    })),
  }
  formError.value = null
  formSuccess.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

// ─── Sparepart item helpers ───────────────────────────────────────────────────
function addSparepartRow() {
  form.value.sparepartItems.push({
    nama: '',
    kategori: 'SPAREPART',
    jumlah: 1,
    hargaSatuan: 0,
    subtotal: 0,
  })
}

function removeSparepartRow(idx: number) {
  form.value.sparepartItems.splice(idx, 1)
}

function recalcSubtotal(idx: number) {
  const item = form.value.sparepartItems[idx]
  if (item) {
    item.subtotal = item.jumlah * item.hargaSatuan
  }
}

const totalSparepartCalc = computed(() =>
  form.value.sparepartItems.reduce((s, i) => s + i.subtotal, 0)
)
const totalBiayaCalc = computed(() =>
  (Number(form.value.ongkosServis) || 0) + totalSparepartCalc.value
)

// ─── Submit ───────────────────────────────────────────────────────────────────
async function submitForm() {
  formError.value = null
  if (!form.value.merkMotor || !form.value.platNomor || !form.value.kategoriServis) {
    formError.value = 'Merk motor, plat nomor, dan kategori servis wajib diisi.'
    return
  }

  const payload: FinanceFormData = {
    ...form.value,
    ongkosServis: Number(form.value.ongkosServis) || 0,
    sparepartItems: form.value.sparepartItems.map(i => ({
      ...i,
      jumlah: Number(i.jumlah) || 1,
      hargaSatuan: Number(i.hargaSatuan) || 0,
      subtotal: Number(i.jumlah) * Number(i.hargaSatuan),
    })),
  }

  let result
  if (editingId.value) {
    result = await updateRecord(editingId.value, payload)
  } else {
    result = await createRecord(payload)
  }

  if (result.success) {
    closeModal()
    await applyFilter()
  } else {
    formError.value = result.error || 'Terjadi kesalahan.'
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteConfirmId = ref<string | null>(null)

async function confirmDelete() {
  if (!deleteConfirmId.value) return
  const result = await deleteRecord(deleteConfirmId.value)
  if (result.success) {
    deleteConfirmId.value = null
    await applyFilter()
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function kategoriLabel(k: KategoriSparepart) {
  return SPAREPART_LABEL[k] ?? k
}

function getBadgeColor(kategori: string) {
  const map: Record<string, string> = {
    OLI: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    FILTER: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    BATERAI: 'bg-green-500/15 text-green-400 border-green-500/30',
    SPAREPART: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    LAINNYA: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  }
  return map[kategori] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/30'
}

// ─── PDF Export ───────────────────────────────────────────────────────────────
function exportPdf() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Header
  doc.setFillColor(15, 15, 15)
  doc.rect(0, 0, 297, 30, 'F')
  doc.setFontSize(20)
  doc.setTextColor(255, 140, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('2R SERVICE', 14, 12)
  doc.setFontSize(10)
  doc.setTextColor(180, 180, 180)
  doc.setFont('helvetica', 'normal')
  doc.text('Bengkel Motor Terpercaya — Bireuen', 14, 19)

  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN KEUANGAN', 230, 12, { align: 'right' })
  doc.setFontSize(9)
  doc.setTextColor(180, 180, 180)
  doc.setFont('helvetica', 'normal')
  const periodeLabel = `Periode: ${formatDate(filterFrom.value as string)} – ${formatDate(filterTo.value as string)}`
  doc.text(periodeLabel, 283, 19, { align: 'right' })

  // Summary boxes
  const s = summary.value
  if (s) {
    const sumY = 36
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.setFont('helvetica', 'normal')

    const boxes = [
      { label: 'Total Ongkos Servis', value: formatRp(s.totalOngkos), color: [251, 146, 60] as [number,number,number] },
      { label: 'Total Sparepart', value: formatRp(s.totalSparepart), color: [96, 165, 250] as [number,number,number] },
      { label: 'Total Keseluruhan', value: formatRp(s.totalKeseluruhan), color: [52, 211, 153] as [number,number,number] },
      { label: 'Jumlah Transaksi', value: `${s.jumlahTransaksi} transaksi`, color: [167, 139, 250] as [number,number,number] },
    ]

    boxes.forEach((b, i) => {
      const x = 14 + i * 67
      doc.setFillColor(25, 25, 25)
      doc.roundedRect(x, sumY, 63, 18, 2, 2, 'F')
      doc.setTextColor(...b.color)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(b.value, x + 4, sumY + 10)
      doc.setFontSize(7)
      doc.setTextColor(120, 120, 120)
      doc.setFont('helvetica', 'normal')
      doc.text(b.label, x + 4, sumY + 16)
    })
  }

  // Table
  const tableData = records.value.map((r, i) => [
    i + 1,
    formatDate(r.tanggal),
    r.merkMotor,
    r.platNomor,
    r.kategoriServis,
    formatRp(r.ongkosServis),
    formatRp(r.totalSparepart),
    formatRp(r.totalBiaya),
    r.catatan || '-',
  ])

  autoTable(doc, {
    startY: 60,
    head: [['#', 'Tanggal', 'Motor', 'Plat', 'Kategori', 'Ongkos', 'Sparepart', 'Total', 'Catatan']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [220, 220, 220],
      fillColor: [18, 18, 18],
      lineColor: [50, 50, 50],
    },
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 140, 0],
      fontStyle: 'bold',
      lineColor: [60, 60, 60],
    },
    alternateRowStyles: { fillColor: [22, 22, 22] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right', fontStyle: 'bold', textColor: [52, 211, 153] },
    },
  })

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(80, 80, 80)
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')} — 2R Service Bengkel Motor`, 14, 200)
    doc.text(`Halaman ${i} dari ${pageCount}`, 283, 200, { align: 'right' })
  }

  doc.save(`laporan-keuangan-${filterFrom.value}-${filterTo.value}.pdf`)
}
</script>

<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-black text-white">
          Pencatatan <span class="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Keuangan</span>
        </h1>
        <p class="text-gray-500 text-sm mt-1">Kelola pemasukan servis, ongkos, dan pengeluaran sparepart</p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Tambah Catatan
      </button>
    </div>

    <!-- Filter + Export Bar -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="flex items-center gap-2 bg-[#111111] border border-white/5 rounded-xl px-4 py-2.5 flex-1">
        <svg class="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5"/>
        </svg>
        <span class="text-gray-500 text-sm shrink-0">Dari</span>
        <input
          v-model="filterFrom"
          type="date"
          class="bg-transparent text-white text-sm flex-1 outline-none min-w-0 cursor-pointer"
        />
      </div>
      <div class="flex items-center gap-2 bg-[#111111] border border-white/5 rounded-xl px-4 py-2.5 flex-1">
        <svg class="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5"/>
        </svg>
        <span class="text-gray-500 text-sm shrink-0">Sampai</span>
        <input
          v-model="filterTo"
          type="date"
          class="bg-transparent text-white text-sm flex-1 outline-none min-w-0 cursor-pointer"
        />
      </div>
      <button
        @click="applyFilter"
        class="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 text-white font-semibold rounded-xl transition-all duration-300 text-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/>
        </svg>
        Filter
      </button>
      <button
        @click="exportPdf"
        class="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 font-semibold rounded-xl transition-all duration-300 text-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
        </svg>
        Ekspor PDF
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-orange-500/20 transition-all duration-300">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>
            </svg>
          </div>
          <span class="text-gray-500 text-xs font-medium">Ongkos Servis</span>
        </div>
        <div class="text-xl font-black text-white">{{ isLoading ? '...' : (summary ? formatRp(summary.totalOngkos) : 'Rp 0') }}</div>
      </div>

      <div class="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-blue-500/20 transition-all duration-300">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
            </svg>
          </div>
          <span class="text-gray-500 text-xs font-medium">Total Sparepart</span>
        </div>
        <div class="text-xl font-black text-white">{{ isLoading ? '...' : (summary ? formatRp(summary.totalSparepart) : 'Rp 0') }}</div>
      </div>

      <div class="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all duration-300">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="text-gray-500 text-xs font-medium">Total Keseluruhan</span>
        </div>
        <div class="text-xl font-black text-emerald-400">{{ isLoading ? '...' : (summary ? formatRp(summary.totalKeseluruhan) : 'Rp 0') }}</div>
      </div>

      <div class="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <span class="text-gray-500 text-xs font-medium">Jumlah Transaksi</span>
        </div>
        <div class="text-xl font-black text-white">{{ isLoading ? '...' : (summary ? summary.jumlahTransaksi : 0) }}</div>
      </div>
    </div>

    <!-- Records Table -->
    <div class="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
      <div class="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h2 class="text-white font-bold">Detail Catatan Keuangan</h2>
        <span class="text-xs text-gray-500">{{ records.length }} catatan</span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          <span class="text-gray-500 text-sm">Memuat data...</span>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="records.length === 0" class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-16 h-16 bg-white/3 rounded-2xl flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="text-gray-500 text-sm">Belum ada catatan keuangan untuk periode ini</p>
        <button @click="openAddModal" class="text-orange-400 text-sm font-semibold hover:text-orange-300">
          + Tambah Catatan Pertama
        </button>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/5">
              <th class="px-6 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Motor</th>
              <th class="px-6 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Kategori</th>
              <th class="px-6 py-3 text-right text-xs text-gray-500 font-semibold uppercase tracking-wider">Ongkos</th>
              <th class="px-6 py-3 text-right text-xs text-gray-500 font-semibold uppercase tracking-wider">Sparepart</th>
              <th class="px-6 py-3 text-right text-xs text-gray-500 font-semibold uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-center text-xs text-gray-500 font-semibold uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/3">
            <tr
              v-for="record in records"
              :key="record.id"
              class="hover:bg-white/2 transition-colors duration-200 group"
            >
              <td class="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">{{ formatDate(record.tanggal) }}</td>
              <td class="px-6 py-4">
                <div class="font-semibold text-white">{{ record.merkMotor }}</div>
                <div class="text-xs text-gray-500">{{ record.platNomor }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {{ record.kategoriServis }}
                </span>
                <div class="mt-1.5 flex flex-wrap gap-1">
                  <span
                    v-for="item in record.sparepartItems.slice(0,2)"
                    :key="item.id"
                    :class="['inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border', getBadgeColor(item.kategori)]"
                  >{{ kategoriLabel(item.kategori as KategoriSparepart) }}</span>
                  <span v-if="record.sparepartItems.length > 2" class="text-[10px] text-gray-600">
                    +{{ record.sparepartItems.length - 2 }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-right text-gray-300 font-mono text-xs">{{ formatRp(record.ongkosServis) }}</td>
              <td class="px-6 py-4 text-right text-blue-300 font-mono text-xs">{{ formatRp(record.totalSparepart) }}</td>
              <td class="px-6 py-4 text-right font-mono text-xs">
                <span class="text-emerald-400 font-bold text-sm">{{ formatRp(record.totalBiaya) }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openEditModal(record)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-blue-500/15 hover:text-blue-400 text-gray-500 transition-all duration-200 border border-transparent hover:border-blue-500/20"
                    title="Edit"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
                    </svg>
                  </button>
                  <button
                    @click="deleteConfirmId = record.id"
                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-gray-500 transition-all duration-200 border border-transparent hover:border-red-500/20"
                    title="Hapus"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- Add/Edit Modal -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="closeModal"></div>

        <!-- Modal Panel -->
        <div class="relative w-full max-w-2xl bg-[#111111] border border-white/8 rounded-2xl shadow-2xl z-10">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h2 class="text-white font-bold text-lg">
              {{ editingId ? 'Edit Catatan Keuangan' : 'Tambah Catatan Keuangan' }}
            </h2>
            <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Form Body -->
          <div class="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <!-- Error -->
            <div v-if="formError" class="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {{ formError }}
            </div>

            <!-- Tanggal & Kategori Servis -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Tanggal</label>
                <input
                  v-model="form.tanggal"
                  type="date"
                  class="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Kategori Servis</label>
                <select
                  v-model="form.kategoriServis"
                  class="w-full bg-[#1a1a1a] border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>Pilih kategori...</option>
                  <option v-for="opt in KATEGORI_SERVIS_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
            </div>

            <!-- Motor Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Merk Motor <span class="text-red-400">*</span></label>
                <input
                  v-model="form.merkMotor"
                  type="text"
                  placeholder="cth: Honda Beat"
                  class="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Plat Nomor <span class="text-red-400">*</span></label>
                <input
                  v-model="form.platNomor"
                  type="text"
                  placeholder="cth: BL 1234 AB"
                  class="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600 uppercase"
                />
              </div>
            </div>

            <!-- Ongkos Servis -->
            <div>
              <label class="block text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Ongkos Servis (Rp)</label>
              <input
                v-model="form.ongkosServis"
                type="number"
                min="0"
                placeholder="0"
                class="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
              />
            </div>

            <!-- Sparepart Items -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="text-xs text-gray-500 font-medium uppercase tracking-wider">Item Sparepart / Oli</label>
                <button
                  @click="addSparepartRow"
                  class="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                  </svg>
                  Tambah Item
                </button>
              </div>

              <div v-if="form.sparepartItems.length === 0" class="text-center py-6 bg-white/3 rounded-xl border border-dashed border-white/10">
                <p class="text-gray-600 text-xs">Belum ada item sparepart</p>
              </div>

              <div v-else class="space-y-2">
                <!-- Header row -->
                <div class="grid grid-cols-12 gap-2 px-2">
                  <span class="col-span-4 text-[10px] text-gray-600 uppercase font-semibold tracking-wider">Nama Item</span>
                  <span class="col-span-2 text-[10px] text-gray-600 uppercase font-semibold tracking-wider">Kategori</span>
                  <span class="col-span-2 text-[10px] text-gray-600 uppercase font-semibold tracking-wider text-center">Jml</span>
                  <span class="col-span-3 text-[10px] text-gray-600 uppercase font-semibold tracking-wider">Harga/Satuan</span>
                  <span class="col-span-1"></span>
                </div>

                <div
                  v-for="(item, idx) in form.sparepartItems"
                  :key="idx"
                  class="grid grid-cols-12 gap-2 items-center bg-white/3 rounded-xl p-2 border border-white/5"
                >
                  <input
                    v-model="item.nama"
                    type="text"
                    placeholder="nama item..."
                    class="col-span-4 bg-white/5 border border-white/10 focus:border-orange-500/40 rounded-lg px-3 py-2 text-white text-xs outline-none placeholder:text-gray-600"
                  />
                  <select
                    v-model="item.kategori"
                    class="col-span-2 bg-[#1a1a1a] border border-white/10 focus:border-orange-500/40 rounded-lg px-2 py-2 text-white text-xs outline-none cursor-pointer"
                  >
                    <option v-for="k in SPAREPART_KATEGORI_OPTIONS" :key="k" :value="k">{{ SPAREPART_LABEL[k] }}</option>
                  </select>
                  <input
                    v-model="item.jumlah"
                    @input="recalcSubtotal(idx)"
                    type="number" min="1"
                    class="col-span-2 bg-white/5 border border-white/10 focus:border-orange-500/40 rounded-lg px-2 py-2 text-white text-xs outline-none text-center"
                  />
                  <input
                    v-model="item.hargaSatuan"
                    @input="recalcSubtotal(idx)"
                    type="number" min="0"
                    placeholder="0"
                    class="col-span-3 bg-white/5 border border-white/10 focus:border-orange-500/40 rounded-lg px-2 py-2 text-white text-xs outline-none"
                  />
                  <button
                    @click="removeSparepartRow(idx)"
                    class="col-span-1 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-colors mx-auto"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                  <!-- Subtotal row display -->
                  <div class="col-span-12 text-right text-[10px] text-gray-500 px-2">
                    Subtotal: <span class="text-blue-400 font-semibold">{{ formatRp(item.subtotal) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Totals summary -->
            <div class="bg-white/3 rounded-xl border border-white/5 p-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Ongkos Servis</span>
                <span class="text-white font-semibold">{{ formatRp(Number(form.ongkosServis) || 0) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Total Sparepart</span>
                <span class="text-blue-400 font-semibold">{{ formatRp(totalSparepartCalc) }}</span>
              </div>
              <div class="border-t border-white/5 pt-2 flex justify-between">
                <span class="text-white font-bold">Total Keseluruhan</span>
                <span class="text-emerald-400 font-black text-lg">{{ formatRp(totalBiayaCalc) }}</span>
              </div>
            </div>

            <!-- Catatan -->
            <div>
              <label class="block text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Catatan (opsional)</label>
              <textarea
                v-model="form.catatan"
                rows="2"
                placeholder="Catatan tambahan..."
                class="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600 resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              @click="closeModal"
              class="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all duration-300 text-sm"
            >
              Batal
            </button>
            <button
              @click="submitForm"
              :disabled="isLoading"
              class="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 text-sm shadow-lg shadow-orange-500/25"
            >
              {{ isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Catatan') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <div v-if="deleteConfirmId" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="deleteConfirmId = null"></div>
        <div class="relative w-full max-w-sm bg-[#111111] border border-white/8 rounded-2xl shadow-2xl p-6 z-10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-white font-bold">Hapus Catatan?</h3>
              <p class="text-gray-500 text-sm">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              @click="deleteConfirmId = null"
              class="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all text-sm"
            >
              Batal
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all text-sm"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </DashboardLayout>
</template>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5);
  cursor: pointer;
}
select option {
  background-color: #1a1a1a;
  color: white;
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
</style>
