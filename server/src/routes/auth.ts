import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { generateToken, authMiddleware } from '../lib/auth.js'
import { registerSchema, loginSchema } from '../lib/validators.js'
import type { Request, Response } from 'express'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message)
      res.status(400).json({ error: errors[0], errors })
      return
    }

    const { nama, email, noHp, password } = result.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      res.status(409).json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' })
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        nama,
        email,
        noHp,
        password: hashedPassword,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        noHp: true,
        role: true,
        createdAt: true,
      },
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.status(201).json({
      message: 'Registrasi berhasil!',
      user,
      token,
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message)
      res.status(400).json({ error: errors[0], errors })
      return
    }

    const { email, password } = result.data

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'Email atau password salah.' })
      return
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Akun Anda telah dinonaktifkan.' })
      return
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      res.status(401).json({ error: 'Email atau password salah.' })
      return
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.json({
      message: 'Login berhasil!',
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        noHp: user.noHp,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/auth/me - Get current user profile
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        email: true,
        noHp: true,
        role: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })

    if (!user) {
      res.status(404).json({ error: 'User tidak ditemukan.' })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
