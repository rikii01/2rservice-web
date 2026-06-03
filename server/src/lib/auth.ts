import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || '2r-service-secret'

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload as any, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

// Express middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token tidak ditemukan. Silakan login.' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)
    ;(req as any).user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa.' })
  }
}
