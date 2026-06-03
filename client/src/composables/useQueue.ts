import { ref } from 'vue'
import { useAuth } from './useAuth'

const API_URL = 'http://localhost:3000/api'

export interface Queue {
  id: string
  nomorAntrian: number
  userId: string
  kategoriServis: string
  merkMotor: string
  platNomor: string
  keluhan?: string | null
  status: 'MENUNGGU' | 'PROSES' | 'SELESAI' | 'BATAL'
  qrToken: string
  createdAt: string
  updatedAt: string
  user?: {
    nama: string
    email: string
    noHp: string
  }
}

const activeQueue = ref<Queue | null>(null)
const queuesAhead = ref(0)
const currentServingNumber = ref<number | null>(null)
const queueHistory = ref<Queue[]>([])
const adminQueues = ref<Queue[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useQueue() {
  const { token } = useAuth()

  async function createQueue(data: {
    kategoriServis: string
    merkMotor: string
    platNomor: string
    keluhan?: string | null
  }): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error || 'Gagal mengambil antrian.' }
      }

      activeQueue.value = json.queue
      await fetchActiveQueue() // Refresh to get estimates
      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchActiveQueue(): Promise<void> {
    if (!token.value) return
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/queue/active`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      if (res.ok) {
        const json = await res.json()
        activeQueue.value = json.activeQueue
        queuesAhead.value = json.queuesAhead || 0
        currentServingNumber.value = json.currentServingNumber
      } else {
        const json = await res.json()
        error.value = json.error
      }
    } catch (err) {
      console.error(err)
      error.value = 'Gagal memuat antrian aktif.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchHistory(): Promise<void> {
    if (!token.value) return
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/queue/history`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      if (res.ok) {
        const json = await res.json()
        queueHistory.value = json.history
      }
    } catch (err) {
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function cancelQueue(): Promise<{ success: boolean; error?: string }> {
    if (!token.value) return { success: false, error: 'Unauthorized' }
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/queue/cancel`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      const json = await res.json()

      if (res.ok) {
        activeQueue.value = null
        await fetchHistory()
        return { success: true }
      } else {
        return { success: false, error: json.error || 'Gagal membatalkan antrian.' }
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  // Admin specific APIs
  async function fetchAdminQueues(date?: string, status: string = 'ALL'): Promise<void> {
    if (!token.value) return
    isLoading.value = true
    try {
      const queryParams = new URLSearchParams()
      if (date) queryParams.append('date', date)
      if (status) queryParams.append('status', status)

      const res = await fetch(`${API_URL}/queue/admin/all?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      if (res.ok) {
        const json = await res.json()
        adminQueues.value = json.queues
      }
    } catch (err) {
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function scanQueueTicket(qrToken: string): Promise<{ success: boolean; queue?: Queue; error?: string }> {
    if (!token.value) return { success: false, error: 'Unauthorized' }
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/queue/admin/scan/${qrToken}`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      const json = await res.json()
      if (res.ok) {
        return { success: true, queue: json.queue }
      } else {
        return { success: false, error: json.error || 'Tiket antrian tidak valid.' }
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: 'Terjadi kesalahan koneksi server.' }
    } finally {
      isLoading.value = false
    }
  }

  async function updateQueueStatus(id: string, newStatus: 'MENUNGGU' | 'PROSES' | 'SELESAI' | 'BATAL'): Promise<{ success: boolean; error?: string }> {
    if (!token.value) return { success: false, error: 'Unauthorized' }
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/queue/admin/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (res.ok) {
        // Refresh local admin queue list
        adminQueues.value = adminQueues.value.map(q => q.id === id ? json.queue : q)
        return { success: true }
      } else {
        return { success: false, error: json.error || 'Gagal mengubah status antrian.' }
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    activeQueue,
    queuesAhead,
    currentServingNumber,
    queueHistory,
    adminQueues,
    isLoading,
    error,
    createQueue,
    fetchActiveQueue,
    fetchHistory,
    cancelQueue,
    fetchAdminQueues,
    scanQueueTicket,
    updateQueueStatus,
  }
}
