import { ref } from 'vue'
import { useAuth } from './useAuth'

const API_URL = 'http://localhost:3000/api'

export type KategoriSparepart = 'SPAREPART' | 'OLI' | 'FILTER' | 'BATERAI' | 'LAINNYA'

export interface SparepartItem {
  id?: string
  nama: string
  kategori: KategoriSparepart
  jumlah: number
  hargaSatuan: number
  subtotal: number
}

export interface FinancialRecord {
  id: string
  queueId?: string | null
  merkMotor: string
  platNomor: string
  kategoriServis: string
  ongkosServis: number
  totalSparepart: number
  totalBiaya: number
  catatan?: string | null
  tanggal: string
  createdAt: string
  updatedAt: string
  sparepartItems: SparepartItem[]
  queue?: {
    nomorAntrian: number
    user?: { nama: string }
  } | null
}

export interface FinanceSummary {
  totalOngkos: number
  totalSparepart: number
  totalKeseluruhan: number
  jumlahTransaksi: number
  perKategori: Record<string, number>
}

export interface FinanceFormData {
  queueId?: string | null
  merkMotor: string
  platNomor: string
  kategoriServis: string
  ongkosServis: number
  catatan?: string
  tanggal: string
  sparepartItems: SparepartItem[]
}

// Global state
const records = ref<FinancialRecord[]>([])
const summary = ref<FinanceSummary | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useFinance() {
  const { token } = useAuth()

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    }
  }

  async function fetchRecords(dateFrom?: string, dateTo?: string): Promise<void> {
    if (!token.value) return
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      const res = await fetch(`${API_URL}/finance?${params.toString()}`, {
        headers: authHeaders(),
      })
      if (res.ok) {
        const json = await res.json()
        records.value = json.records
      } else {
        const json = await res.json()
        error.value = json.error || 'Gagal memuat catatan keuangan.'
      }
    } catch (e) {
      error.value = 'Tidak dapat terhubung ke server.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSummary(dateFrom?: string, dateTo?: string): Promise<void> {
    if (!token.value) return
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      const res = await fetch(`${API_URL}/finance/summary?${params.toString()}`, {
        headers: authHeaders(),
      })
      if (res.ok) {
        const json = await res.json()
        summary.value = json
      }
    } catch (e) {
      // silent
    }
  }

  async function createRecord(data: FinanceFormData): Promise<{ success: boolean; error?: string }> {
    if (!token.value) return { success: false, error: 'Unauthorized' }
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/finance`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (res.ok) {
        records.value.unshift(json.record)
        return { success: true }
      }
      return { success: false, error: json.error || 'Gagal menyimpan catatan.' }
    } catch (e) {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  async function updateRecord(id: string, data: FinanceFormData): Promise<{ success: boolean; error?: string }> {
    if (!token.value) return { success: false, error: 'Unauthorized' }
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/finance/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (res.ok) {
        const idx = records.value.findIndex(r => r.id === id)
        if (idx !== -1) records.value[idx] = json.record
        return { success: true }
      }
      return { success: false, error: json.error || 'Gagal memperbarui catatan.' }
    } catch (e) {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteRecord(id: string): Promise<{ success: boolean; error?: string }> {
    if (!token.value) return { success: false, error: 'Unauthorized' }
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/finance/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (res.ok) {
        records.value = records.value.filter(r => r.id !== id)
        return { success: true }
      }
      const json = await res.json()
      return { success: false, error: json.error || 'Gagal menghapus catatan.' }
    } catch (e) {
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    records,
    summary,
    isLoading,
    error,
    fetchRecords,
    fetchSummary,
    createRecord,
    updateRecord,
    deleteRecord,
  }
}
