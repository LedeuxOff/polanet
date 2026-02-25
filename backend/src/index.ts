import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Импорт роутов
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import roleRoutes from './routes/roles.js'

// API роуты
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/roles', roleRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`)
  console.log(`📍 API доступно на http://localhost:${PORT}/api`)
})
