import { ref, computed } from 'vue'
import { useAuth } from './useAuth'

const API_URL = 'http://localhost:3000/api'

export interface CatalogItem {
  id: string
  nama: string
  kategori: string
  merk: string | null
  harga: number
  stok: number
  satuan: string
  deskripsi: string | null
  gambar: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CatalogFormData {
  nama: string
  kategori: string
  merk: string
  harga: number | string
  stok: number | string
  satuan: string
  deskripsi: string
  gambar: string
}

const items = ref<CatalogItem[]>([])
const categories = ref<string[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedKategori = ref('Semua')

export function useCatalog() {
  const { token } = useAuth()

  const filteredItems = computed(() => items.value)

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    }
  }

  async function fetchItems() {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (searchQuery.value) params.set('search', searchQuery.value)
      if (selectedKategori.value && selectedKategori.value !== 'Semua') {
        params.set('kategori', selectedKategori.value)
      }

      const res = await fetch(`${API_URL}/catalog?${params}`, {
        headers: authHeaders(),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Gagal mengambil data katalog.')
      }

      const json = await res.json()
      items.value = json.items
      categories.value = json.categories
    } catch (err: any) {
      error.value = err.message || 'Tidak dapat terhubung ke server.'
    } finally {
      isLoading.value = false
    }
  }

  async function createItem(data: CatalogFormData): Promise<{ success: boolean; error?: string }> {
    try {
      const body = {
        ...data,
        harga: Number(data.harga),
        stok: Number(data.stok),
        merk: data.merk || null,
        deskripsi: data.deskripsi || null,
        gambar: data.gambar || null,
      }

      const res = await fetch(`${API_URL}/catalog`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error || 'Gagal menambahkan barang.' }
      }

      await fetchItems()
      return { success: true }
    } catch {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    }
  }

  async function updateItem(id: string, data: Partial<CatalogFormData>): Promise<{ success: boolean; error?: string }> {
    try {
      const body: any = { ...data }
      if (data.harga !== undefined) body.harga = Number(data.harga)
      if (data.stok !== undefined) body.stok = Number(data.stok)
      if ('merk' in data) body.merk = data.merk || null
      if ('deskripsi' in data) body.deskripsi = data.deskripsi || null
      if ('gambar' in data) body.gambar = data.gambar || null

      const res = await fetch(`${API_URL}/catalog/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error || 'Gagal memperbarui barang.' }
      }

      await fetchItems()
      return { success: true }
    } catch {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    }
  }

  async function deleteItem(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_URL}/catalog/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error || 'Gagal menghapus barang.' }
      }

      await fetchItems()
      return { success: true }
    } catch {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    }
  }

  function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function getStokStatus(stok: number): { label: string; color: string; bgColor: string; borderColor: string } {
    if (stok === 0) return { label: 'Habis', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' }
    if (stok <= 5) return { label: 'Menipis', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' }
    return { label: 'Tersedia', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' }
  }

  function getKategoriIcon(kategori: string): string {
    const icons: Record<string, string> = {
      'Oli': '🛢️',
      'Rem': '🔧',
      'Busi': '⚡',
      'Ban': '⭕',
      'Rantai': '🔗',
      'Sparepart': '⚙️',
      'Aksesoris': '🎨',
    }
    return icons[kategori] || '📦'
  }

  return {
    items,
    categories,
    filteredItems,
    isLoading,
    error,
    searchQuery,
    selectedKategori,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    formatRupiah,
    getStokStatus,
    getKategoriIcon,
  }
}
