import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import catalogRoutes from './routes/catalog.js'
import queueRoutes from './routes/queue.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://2rservice.vercel.app'
  ],
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/catalog', catalogRoutes)
app.use('/api/queue', queueRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
})
