import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthRequest extends Request {
  userId?: number
  user?: {
    id: number
    email: string
    roleId: number
  }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется аутентификация' })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    req.userId = decoded.userId
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      roleId: decoded.roleId,
    }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Неверный токен' })
  }
}

export function generateToken(user: { id: number; email: string; roleId: number }): string {
  return jwt.sign(
    { id: user.id, userId: user.id, email: user.email, roleId: user.roleId },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export interface JWTPayload {
  userId: number
  email: string
  roleId: number
  id?: number
}

export { JWT_SECRET }
