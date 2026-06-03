<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useCatalog } from '@/composables/useCatalog'
import type { CatalogItem, CatalogFormData } from '@/composables/useCatalog'
import DashboardLayout from '@/components/DashboardLayout.vue'

const router = useRouter()
const { user, isAuthenticated, isAdmin, fetchMe } = useAuth()
const {
  items,
  categories,
  isLoading: catalogLoading,
  searchQuery,
  selectedKategori,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  formatRupiah,
  getStokStatus,
  getKategoriIcon,
} = useCatalog()

// Modal state
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingItem = ref<CatalogItem | null>(null)
const modalError = ref('')
const modalLoading = ref(false)
const showDeleteConfirm = ref(false)
const deletingItem = ref<CatalogItem | null>(null)

const emptyForm: CatalogFormData = {
  nama: '',
  kategori: '',
  merk: '',
  harga: '',
  stok: '',
  satuan: 'pcs',
  deskripsi: '',
  gambar: '',
}

const formData = ref<CatalogFormData>({ ...emptyForm })
const kategoriOptions = ['Oli', 'Rem', 'Busi', 'Ban', 'Rantai', 'Sparepart', 'Aksesoris']

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  await fetchMe()
  await fetchItems()
})

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchItems(), 300)
})

watch(selectedKategori, () => fetchItems())

function openCreate() {
  modalMode.value = 'create'
  editingItem.value = null
  formData.value = { ...emptyForm }
  modalError.value = ''
  showModal.value = true
}

function openEdit(item: CatalogItem) {
  modalMode.value = 'edit'
  editingItem.value = item
  formData.value = {
    nama: item.nama,
    kategori: item.kategori,
    merk: item.merk || '',
    harga: item.harga,
    stok: item.stok,
    satuan: item.satuan,
    deskripsi: item.deskripsi || '',
    gambar: item.gambar || '',
  }
  modalError.value = ''
  showModal.value = true
}

async function handleSubmit() {
  modalLoading.value = true
  modalError.value = ''

  let result: { success: boolean; error?: string }

  if (modalMode.value === 'create') {
    result = await createItem(formData.value)
  } else {
    result = await updateItem(editingItem.value!.id, formData.value)
  }

  modalLoading.value = false

  if (result.success) {
    showModal.value = false
  } else {
    modalError.value = result.error || 'Terjadi kesalahan.'
  }
}

function confirmDelete(item: CatalogItem) {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingItem.value) return
  modalLoading.value = true
  const result = await deleteItem(deletingItem.value.id)
  modalLoading.value = false
  showDeleteConfirm.value = false
  deletingItem.value = null
  if (!result.success) {
    modalError.value = result.error || 'Gagal menghapus.'
  }
}
</script>

<template>
  <DashboardLayout>
    <!-- Catalog Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-black text-white flex items-center gap-3">
          <div class="w-11 h-11 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
            </svg>
          </div>
          Katalog Suku Cadang & Barang
        </h1>
        <p class="text-gray-400 text-sm mt-1.5 lg:ml-[56px]">
          {{ isAdmin ? 'Kelola stok, harga, dan rincian barang bengkel' : 'Cek ketersediaan suku cadang dan harga suku cadang secara real-time' }}
        </p>
      </div>

      <!-- Add Button (Admin only) -->
      <button
        v-if="isAdmin"
        @click="openCreate"
        id="btn-tambah-barang"
        class="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 self-start lg:self-center"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Tambah Barang
      </button>
    </div>

    <!-- Search & Filter Area -->
    <div class="bg-[#0e0e0e] border border-white/5 rounded-2xl p-4 mb-8">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search bar -->
        <div class="relative flex-1">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            id="search-katalog"
            placeholder="Cari suku cadang, merek, deskripsi..."
            class="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
          />
        </div>

        <!-- Filter Categories -->
        <div class="flex flex-wrap gap-2 items-center">
          <button
            @click="selectedKategori = 'Semua'"
            :class="[
              'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer',
              selectedKategori === 'Semua'
                ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                : 'bg-[#0a0a0a] border-white/5 text-gray-400 hover:border-white/15 hover:text-white'
            ]"
          >
            Semua
          </button>
          <button
            v-for="kat in categories"
            :key="kat"
            @click="selectedKategori = kat"
            :class="[
              'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer',
              selectedKategori === kat
                ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                : 'bg-[#0a0a0a] border-white/5 text-gray-400 hover:border-white/15 hover:text-white'
            ]"
          >
            {{ getKategoriIcon(kat) }} {{ kat }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="modalError && !showModal && !showDeleteConfirm" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex justify-between items-center">
      <span>{{ modalError }}</span>
      <button @click="modalError = ''" class="text-red-400 hover:text-white">✕</button>
    </div>

    <!-- Loading State -->
    <div v-if="catalogLoading" class="flex items-center justify-center py-24">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p class="text-gray-500 text-sm">Memuat katalog suku cadang...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="flex items-center justify-center py-24 border border-dashed border-white/5 rounded-2xl bg-[#0c0c0c]/50">
      <div class="text-center px-4">
        <div class="text-5xl mb-4 opacity-40">📦</div>
        <h3 class="text-white font-bold mb-1">Barang Tidak Ditemukan</h3>
        <p class="text-gray-500 text-sm max-w-sm mx-auto">
          {{ searchQuery || selectedKategori !== 'Semua' ? 'Tidak ada barang yang cocok dengan pencarian atau filter Anda.' : 'Belum ada barang terdaftar di katalog saat ini.' }}
        </p>
      </div>
    </div>

    <!-- Catalog Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="item in items"
        :key="item.id"
        class="group bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5 flex flex-col"
      >
        <!-- Card Header & Stock Status -->
        <div class="relative px-5 pt-5 pb-3">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/10 rounded-xl flex items-center justify-center text-2xl">
              {{ getKategoriIcon(item.kategori) }}
            </div>
            
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border',
                getStokStatus(item.stok).bgColor,
                getStokStatus(item.stok).color,
                getStokStatus(item.stok).borderColor,
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="item.stok === 0 ? 'bg-red-400' : item.stok <= 5 ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'"></span>
              {{ getStokStatus(item.stok).label }}
            </span>
          </div>

          <h3 class="text-white font-bold text-base leading-snug mb-1 line-clamp-2">{{ item.nama }}</h3>
          
          <div class="flex items-center gap-2 mb-3">
            <span class="text-gray-400 text-[10px] font-bold px-2 py-0.5 bg-white/5 rounded">{{ item.kategori }}</span>
            <span v-if="item.merk" class="text-gray-500 text-xs font-medium">{{ item.merk }}</span>
          </div>

          <p v-if="item.deskripsi" class="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-2">{{ item.deskripsi }}</p>
        </div>

        <!-- Spacer to push price/actions to bottom -->
        <div class="flex-1"></div>

        <!-- Price & Info Footer -->
        <div class="px-5 pb-5 pt-3 border-t border-white/5 bg-[#0b0b0b]/50">
          <div class="flex items-end justify-between mb-4">
            <div>
              <span class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Harga</span>
              <p class="text-orange-400 font-black text-lg leading-none mt-1">{{ formatRupiah(item.harga) }}</p>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Stok</span>
              <p class="text-white font-extrabold text-base leading-none mt-1">
                {{ item.stok }}
                <span class="text-gray-500 text-xs font-medium ml-0.5">{{ item.satuan }}</span>
              </p>
            </div>
          </div>

          <!-- Admin Actions (Admin only) -->
          <div v-if="isAdmin" class="flex gap-2 pt-3 border-t border-white/5">
            <button
              @click="openEdit(item)"
              class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/20 text-gray-400 hover:text-blue-400 rounded-xl transition-all duration-200 text-xs font-semibold cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
              </svg>
              Edit
            </button>
            <button
              @click="confirmDelete(item)"
              class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all duration-200 text-xs font-semibold cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
              </svg>
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== CREATE/EDIT MODAL ===================== -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

          <!-- Modal Content -->
          <div class="relative w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-[#111111] border-b border-white/5 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 class="text-lg font-bold text-white">
                {{ modalMode === 'create' ? '➕ Tambah Barang Baru' : '✏️ Edit Barang' }}
              </h3>
              <button @click="showModal = false" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
              <!-- Error -->
              <div v-if="modalError" class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {{ modalError }}
              </div>

              <!-- Nama Barang -->
              <div>
                <label class="block text-sm font-semibold text-gray-300 mb-1.5">Nama Barang <span class="text-red-400">*</span></label>
                <input
                  v-model="formData.nama"
                  type="text"
                  required
                  id="input-nama-barang"
                  placeholder="e.g. Oli Yamalube Super 4T 1L"
                  class="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                />
              </div>

              <!-- Kategori & Merk -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-1.5">Kategori <span class="text-red-400">*</span></label>
                  <select
                    v-model="formData.kategori"
                    required
                    id="select-kategori"
                    class="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Pilih kategori</option>
                    <option v-for="kat in kategoriOptions" :key="kat" :value="kat">{{ kat }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-1.5">Merek</label>
                  <input
                    v-model="formData.merk"
                    type="text"
                    id="input-merk"
                    placeholder="e.g. Yamalube"
                    class="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>

              <!-- Harga & Stok & Satuan -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-1.5">Harga (Rp) <span class="text-red-400">*</span></label>
                  <input
                    v-model="formData.harga"
                    type="number"
                    required
                    min="0"
                    id="input-harga"
                    placeholder="45000"
                    class="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-1.5">Stok <span class="text-red-400">*</span></label>
                  <input
                    v-model="formData.stok"
                    type="number"
                    required
                    min="0"
                    id="input-stok"
                    placeholder="10"
                    class="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-1.5">Satuan</label>
                  <select
                    v-model="formData.satuan"
                    id="select-satuan"
                    class="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all cursor-pointer"
                  >
                    <option value="pcs">pcs</option>
                    <option value="botol">botol</option>
                    <option value="set">set</option>
                    <option value="liter">liter</option>
                    <option value="pasang">pasang</option>
                    <option value="meter">meter</option>
                  </select>
                </div>
              </div>

              <!-- Deskripsi -->
              <div>
                <label class="block text-sm font-semibold text-gray-300 mb-1.5">Deskripsi</label>
                <textarea
                  v-model="formData.deskripsi"
                  rows="3"
                  id="input-deskripsi"
                  placeholder="Deskripsi singkat tentang barang..."
                  class="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none"
                ></textarea>
              </div>

              <!-- Submit -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  @click="showModal = false"
                  class="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold rounded-xl transition-all text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  :disabled="modalLoading"
                  class="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <div v-if="modalLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {{ modalMode === 'create' ? 'Tambahkan' : 'Simpan Perubahan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===================== DELETE CONFIRMATION MODAL ===================== -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showDeleteConfirm = false">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

          <!-- Modal Content -->
          <div class="relative w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-6">
            <div class="text-center">
              <div class="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
              </div>
              <h3 class="text-white font-bold text-lg mb-2">Hapus Barang?</h3>
              <p class="text-gray-400 text-sm mb-6">
                Anda yakin ingin menghapus <span class="text-white font-medium">{{ deletingItem?.nama }}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div class="flex gap-3">
                <button
                  @click="showDeleteConfirm = false"
                  class="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold rounded-xl transition-all text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  @click="handleDelete"
                  :disabled="modalLoading"
                  class="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-semibold rounded-xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <div v-if="modalLoading" class="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>
