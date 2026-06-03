import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../lib/auth.js'
import { adminOnly } from '../lib/adminGuard.js'
import { catalogItemSchema, catalogUpdateSchema } from '../lib/validators.js'
import type { Request, Response } from 'express'

const router = Router()

// All catalog routes require authentication
router.use(authMiddleware)

// GET /api/catalog — List all items (with search & filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, kategori } = req.query

    const where: any = { isActive: true }

    if (search && typeof search === 'string') {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { merk: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (kategori && typeof kategori === 'string' && kategori !== 'Semua') {
      where.kategori = kategori
    }

    const items = await prisma.catalogItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Also fetch distinct categories for filter
    const categories = await prisma.catalogItem.findMany({
      where: { isActive: true },
      select: { kategori: true },
      distinct: ['kategori'],
      orderBy: { kategori: 'asc' },
    })

    res.json({
      items,
      categories: categories.map((c) => c.kategori),
    })
  } catch (error) {
    console.error('Catalog list error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/catalog/:id — Get single item detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.catalogItem.findUnique({
      where: { id: req.params.id },
    })

    if (!item || !item.isActive) {
      res.status(404).json({ error: 'Barang tidak ditemukan.' })
      return
    }

    res.json({ item })
  } catch (error) {
    console.error('Catalog detail error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/catalog — Create new item (ADMIN only)
router.post('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const result = catalogItemSchema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message)
      res.status(400).json({ error: errors[0], errors })
      return
    }

    const item = await prisma.catalogItem.create({
      data: result.data,
    })

    res.status(201).json({ message: 'Barang berhasil ditambahkan.', item })
  } catch (error) {
    console.error('Catalog create error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// PUT /api/catalog/:id — Update item (ADMIN only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.catalogItem.findUnique({
      where: { id: req.params.id },
    })

    if (!existing) {
      res.status(404).json({ error: 'Barang tidak ditemukan.' })
      return
    }

    const result = catalogUpdateSchema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message)
      res.status(400).json({ error: errors[0], errors })
      return
    }

    const item = await prisma.catalogItem.update({
      where: { id: req.params.id },
      data: result.data,
    })

    res.json({ message: 'Barang berhasil diperbarui.', item })
  } catch (error) {
    console.error('Catalog update error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// DELETE /api/catalog/:id — Soft delete item (ADMIN only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.catalogItem.findUnique({
      where: { id: req.params.id },
    })

    if (!existing) {
      res.status(404).json({ error: 'Barang tidak ditemukan.' })
      return
    }

    await prisma.catalogItem.update({
      where: { id: req.params.id },
      data: { isActive: false },
    })

    res.json({ message: 'Barang berhasil dihapus.' })
  } catch (error) {
    console.error('Catalog delete error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
