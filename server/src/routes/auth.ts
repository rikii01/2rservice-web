import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { generateToken, authMiddleware } from '../lib/auth.js'
import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } from '../lib/validators.js'
import type { Request, Response } from 'express'
import { OAuth2Client } from 'google-auth-library'
import crypto from 'crypto'

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

// PATCH /api/auth/profile - Update profile data
router.patch('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user

    const result = updateProfileSchema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message)
      res.status(400).json({ error: errors[0], errors })
      return
    }

    const { nama, noHp, avatar } = result.data

    const user = await prisma.user.update({
      where: { id: userId },
      data: { nama, noHp, avatar },
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

    res.json({ message: 'Profil berhasil diperbarui!', user })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// PATCH /api/auth/password - Change password
router.patch('/password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user

    const result = updatePasswordSchema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message)
      res.status(400).json({ error: errors[0], errors })
      return
    }

    const { currentPassword, newPassword } = result.data

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      res.status(404).json({ error: 'User tidak ditemukan.' })
      return
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      res.status(400).json({ error: 'Password saat ini tidak sesuai.' })
      return
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    res.json({ message: 'Password berhasil diubah!' })
  } catch (error) {
    console.error('Update password error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body

    if (!idToken) {
      res.status(400).json({ error: 'Token Google diperlukan.' })
      return
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Token Google tidak valid.' })
      return
    }

    const { email, name, picture } = payload

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Create a random password since User model requires one
      const tempPassword = crypto.randomBytes(32).toString('hex')
      const hashedPassword = await bcrypt.hash(tempPassword, 12)

      // Create new user with Google details
      user = await prisma.user.create({
        data: {
          nama: name || 'User Google',
          email,
          noHp: '-', // Placeholder since Google OAuth doesn't provide phone number
          password: hashedPassword,
          avatar: picture || null,
          emailVerified: true
        }
      })
    } else {
      // User exists, check if active
      if (!user.isActive) {
        res.status(403).json({ error: 'Akun Anda telah dinonaktifkan.' })
        return
      }

      // Update last login and optionally avatar
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          avatar: user.avatar || picture || null
        }
      })
    }

    // Generate JWT token
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
    console.error('Google login error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan server saat autentikasi Google.' })
  }
})

export default router
