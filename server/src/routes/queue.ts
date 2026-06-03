import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../lib/auth.js'
import { adminOnly } from '../lib/adminGuard.js'
import { queueCreateSchema, queueUpdateStatusSchema } from '../lib/validators.js'
import type { Request, Response } from 'express'

const router = Router()

// All queue routes require authentication
router.use(authMiddleware)

// POST /api/queue — Book a new queue (Pelanggan only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    
    // Check if user already has an active queue (status MENUNGGU or PROSES)
    const activeQueue = await prisma.queue.findFirst({
      where: {
        userId: user.userId,
        status: {
          in: ['MENUNGGU', 'PROSES']
        }
      }
    })

    if (activeQueue) {
      res.status(400).json({ error: 'Anda masih memiliki antrian aktif. Silakan selesaikan atau batalkan terlebih dahulu.' })
      return
    }

    const result = queueCreateSchema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message)
      res.status(400).json({ error: errors[0], errors })
      return
    }

    // Calculate nomor antrian for today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const todayCount = await prisma.queue.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    const nomorAntrian = todayCount + 1

    const queue = await prisma.queue.create({
      data: {
        nomorAntrian,
        userId: user.userId,
        kategoriServis: result.data.kategoriServis,
        merkMotor: result.data.merkMotor,
        platNomor: result.data.platNomor.toUpperCase(),
        keluhan: result.data.keluhan,
        status: 'MENUNGGU'
      },
      include: {
        user: {
          select: {
            nama: true,
            email: true,
            noHp: true
          }
        }
      }
    })

    res.status(201).json({ message: 'Antrian berhasil diambil.', queue })
  } catch (error) {
    console.error('Create queue error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil antrian.' })
  }
})

// GET /api/queue/active — Get current customer's active queue
router.get('/active', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user

    const activeQueue = await prisma.queue.findFirst({
      where: {
        userId: user.userId,
        status: {
          in: ['MENUNGGU', 'PROSES']
        }
      },
      include: {
        user: {
          select: {
            nama: true,
            email: true,
            noHp: true
          }
        }
      }
    })

    if (!activeQueue) {
      res.json({ activeQueue: null })
      return
    }

    // Calculate estimated wait time / queues ahead
    // Count how many queues are still MENUNGGU and have a lower nomorAntrian today
    const startOfDay = new Date(activeQueue.createdAt)
    startOfDay.setHours(0, 0, 0, 0)

    const queuesAhead = await prisma.queue.count({
      where: {
        status: 'MENUNGGU',
        createdAt: {
          gte: startOfDay,
          lt: activeQueue.createdAt
        }
      }
    })

    // Fetch what number is currently processing
    const currentServing = await prisma.queue.findFirst({
      where: {
        status: 'PROSES',
        createdAt: {
          gte: startOfDay,
          lte: new Date()
        }
      },
      orderBy: {
        nomorAntrian: 'asc'
      }
    })

    res.json({ 
      activeQueue, 
      queuesAhead,
      currentServingNumber: currentServing ? currentServing.nomorAntrian : null
    })
  } catch (error) {
    console.error('Get active queue error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/queue/history — Get customer's queue history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user

    const history = await prisma.queue.findMany({
      where: {
        userId: user.userId,
        status: {
          in: ['SELESAI', 'BATAL']
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({ history })
  } catch (error) {
    console.error('Get queue history error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/queue/admin/all — Get all queues for admin monitoring (ADMIN only)
router.get('/admin/all', adminOnly, async (req: Request, res: Response) => {
  try {
    const { status, date } = req.query

    const where: any = {}

    // Filter by date (defaults to today if not provided)
    const targetDate = date ? new Date(date as string) : new Date()
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status
    }

    const queues = await prisma.queue.findMany({
      where,
      include: {
        user: {
          select: {
            nama: true,
            email: true,
            noHp: true
          }
        }
      },
      orderBy: {
        nomorAntrian: 'asc'
      }
    })

    res.json({ queues })
  } catch (error) {
    console.error('Admin get all queues error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/queue/admin/scan/:qrToken — Scan & retrieve queue detail (ADMIN only)
router.get('/admin/scan/:qrToken', adminOnly, async (req: Request, res: Response) => {
  try {
    const { qrToken } = req.params

    const queue = await prisma.queue.findUnique({
      where: { qrToken: qrToken as string },
      include: {
        user: {
          select: {
            nama: true,
            email: true,
            noHp: true
          }
        }
      }
    })

    if (!queue) {
      res.status(404).json({ error: 'Tiket antrian tidak valid atau tidak ditemukan.' })
      return
    }

    res.json({ queue })
  } catch (error) {
    console.error('Scan queue error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// PATCH /api/queue/admin/status/:id — Update queue status (ADMIN only)
router.patch('/admin/status/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = queueUpdateStatusSchema.safeParse(req.body)
    
    if (!result.success) {
      res.status(400).json({ error: result.error.errors[0].message })
      return
    }

    const existingQueue = await prisma.queue.findUnique({
      where: { id: id as string }
    })

    if (!existingQueue) {
      res.status(404).json({ error: 'Antrian tidak ditemukan.' })
      return
    }

    const updatedQueue = await prisma.queue.update({
      where: { id: id as string },
      data: {
        status: result.data.status
      },
      include: {
        user: {
          select: {
            nama: true,
            email: true,
            noHp: true
          }
        }
      }
    })

    res.json({ message: `Status antrian berhasil diubah menjadi ${result.data.status}.`, queue: updatedQueue })
  } catch (error) {
    console.error('Update queue status error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// PATCH /api/queue/cancel — Customer cancels their active queue
router.patch('/cancel', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user

    const activeQueue = await prisma.queue.findFirst({
      where: {
        userId: user.userId,
        status: 'MENUNGGU'
      }
    })

    if (!activeQueue) {
      res.status(400).json({ error: 'Tidak ada antrian yang bisa dibatalkan.' })
      return
    }

    const queue = await prisma.queue.update({
      where: { id: activeQueue.id },
      data: { status: 'BATAL' }
    })

    res.json({ message: 'Antrian berhasil dibatalkan.', queue })
  } catch (error) {
    console.error('Cancel queue error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server saat membatalkan antrian.' })
  }
})

export default router
