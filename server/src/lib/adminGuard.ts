import type { Request, Response, NextFunction } from 'express'
import prisma from './prisma.js'

/**
 * Middleware to restrict access to ADMIN role only.
 * Must be used AFTER authMiddleware.
 */
export async function adminOnly(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = (req as any).user

  if (!user) {
    res.status(403).json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' })
    return
  }

  try {
    // Fetch fresh user from DB to verify role dynamically
    const freshUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    if (!freshUser || freshUser.role !== 'ADMIN') {
      res.status(403).json({ error: 'Akses ditolak. Hanya admin yang diizinkan.' })
      return
    }

    next()
  } catch (error) {
    console.error('Error in adminOnly guard:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server saat memverifikasi akses.' })
  }
}

