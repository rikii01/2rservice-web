import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../lib/auth.js'
import { adminOnly } from '../lib/adminGuard.js'
import type { Request, Response } from 'express'

const router = Router()

router.use(authMiddleware)
router.use(adminOnly)

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/finance/summary — Ringkasan keuangan per periode
// ─────────────────────────────────────────────────────────────────────────────
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query

    const where: any = {}

    if (dateFrom || dateTo) {
      where.tanggal = {}
      if (dateFrom) {
        const from = new Date(dateFrom as string)
        from.setHours(0, 0, 0, 0)
        where.tanggal.gte = from
      }
      if (dateTo) {
        const to = new Date(dateTo as string)
        to.setHours(23, 59, 59, 999)
        where.tanggal.lte = to
      }
    }

    const records = await prisma.financialRecord.findMany({
      where,
      include: { sparepartItems: true },
    })

    const totalOngkos = records.reduce((s, r) => s + r.ongkosServis, 0)
    const totalSparepart = records.reduce((s, r) => s + r.totalSparepart, 0)
    const totalKeseluruhan = records.reduce((s, r) => s + r.totalBiaya, 0)
    const jumlahTransaksi = records.length

    // Per kategori sparepart
    const perKategori: Record<string, number> = {}
    for (const rec of records) {
      for (const item of rec.sparepartItems) {
        perKategori[item.kategori] = (perKategori[item.kategori] || 0) + item.subtotal
      }
    }

    res.json({
      totalOngkos,
      totalSparepart,
      totalKeseluruhan,
      jumlahTransaksi,
      perKategori,
    })
  } catch (error) {
    console.error('Finance summary error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/finance — List catatan keuangan (filter tanggal)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query

    const where: any = {}

    if (dateFrom || dateTo) {
      where.tanggal = {}
      if (dateFrom) {
        const from = new Date(dateFrom as string)
        from.setHours(0, 0, 0, 0)
        where.tanggal.gte = from
      }
      if (dateTo) {
        const to = new Date(dateTo as string)
        to.setHours(23, 59, 59, 999)
        where.tanggal.lte = to
      }
    }

    const records = await prisma.financialRecord.findMany({
      where,
      include: {
        sparepartItems: true,
        queue: {
          select: { nomorAntrian: true, user: { select: { nama: true } } },
        },
      },
      orderBy: { tanggal: 'desc' },
    })

    res.json({ records })
  } catch (error) {
    console.error('Finance list error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/finance/:id — Detail satu catatan
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const record = await prisma.financialRecord.findUnique({
      where: { id },
      include: {
        sparepartItems: true,
        queue: {
          select: { nomorAntrian: true, user: { select: { nama: true } } },
        },
      },
    })

    if (!record) {
      res.status(404).json({ error: 'Catatan tidak ditemukan.' })
      return
    }

    res.json({ record })
  } catch (error) {
    console.error('Finance detail error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/finance — Buat catatan keuangan baru
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      queueId,
      merkMotor,
      platNomor,
      kategoriServis,
      ongkosServis,
      catatan,
      tanggal,
      sparepartItems,
    } = req.body

    // Validasi wajib
    if (!merkMotor || !platNomor || !kategoriServis) {
      res.status(400).json({ error: 'Merk motor, plat nomor, dan kategori servis wajib diisi.' })
      return
    }

    const items: Array<{
      nama: string
      kategori: string
      jumlah: number
      hargaSatuan: number
      subtotal: number
    }> = Array.isArray(sparepartItems) ? sparepartItems : []

    const totalSparepart = items.reduce((s: number, i: any) => s + (i.subtotal || 0), 0)
    const ongkos = Number(ongkosServis) || 0
    const totalBiaya = ongkos + totalSparepart

    const record = await prisma.financialRecord.create({
      data: {
        queueId: queueId || null,
        merkMotor,
        platNomor: (platNomor as string).toUpperCase(),
        kategoriServis,
        ongkosServis: ongkos,
        totalSparepart,
        totalBiaya,
        catatan: catatan || null,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        sparepartItems: {
          create: items.map((item: any) => ({
            nama: item.nama,
            kategori: item.kategori,
            jumlah: Number(item.jumlah) || 1,
            hargaSatuan: Number(item.hargaSatuan) || 0,
            subtotal: Number(item.subtotal) || 0,
          })),
        },
      },
      include: { sparepartItems: true },
    })

    res.status(201).json({ message: 'Catatan keuangan berhasil disimpan.', record })
  } catch (error) {
    console.error('Finance create error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/finance/:id — Update catatan
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      merkMotor,
      platNomor,
      kategoriServis,
      ongkosServis,
      catatan,
      tanggal,
      sparepartItems,
    } = req.body

    const existing = await prisma.financialRecord.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Catatan tidak ditemukan.' })
      return
    }

    const items: Array<any> = Array.isArray(sparepartItems) ? sparepartItems : []
    const totalSparepart = items.reduce((s: number, i: any) => s + (Number(i.subtotal) || 0), 0)
    const ongkos = Number(ongkosServis) || 0
    const totalBiaya = ongkos + totalSparepart

    // Delete existing sparepart items and recreate
    await prisma.sparepartItem.deleteMany({ where: { financialRecordId: id } })

    const record = await prisma.financialRecord.update({
      where: { id },
      data: {
        merkMotor,
        platNomor: (platNomor as string).toUpperCase(),
        kategoriServis,
        ongkosServis: ongkos,
        totalSparepart,
        totalBiaya,
        catatan: catatan || null,
        tanggal: tanggal ? new Date(tanggal) : existing.tanggal,
        sparepartItems: {
          create: items.map((item: any) => ({
            nama: item.nama,
            kategori: item.kategori,
            jumlah: Number(item.jumlah) || 1,
            hargaSatuan: Number(item.hargaSatuan) || 0,
            subtotal: Number(item.subtotal) || 0,
          })),
        },
      },
      include: { sparepartItems: true },
    })

    res.json({ message: 'Catatan berhasil diperbarui.', record })
  } catch (error) {
    console.error('Finance update error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/finance/:id — Hapus catatan
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const existing = await prisma.financialRecord.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Catatan tidak ditemukan.' })
      return
    }

    await prisma.financialRecord.delete({ where: { id } })

    res.json({ message: 'Catatan berhasil dihapus.' })
  } catch (error) {
    console.error('Finance delete error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
