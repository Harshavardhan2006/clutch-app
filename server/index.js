import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRoutes from './routes/chat.js'
import goalsRoutes from './routes/goals.js'
import authRoutes from './routes/auth.js'

dotenv.config({ path: '../.env' })

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = [
  'http://localhost:5173',
  'https://clutch-app-500518.web.app',
  'https://clutch-app-500518.firebaseapp.com',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

app.use(express.json())

app.use('/api/chat', chatRoutes)
app.use('/api/goals', goalsRoutes)
app.use('/api/auth', authRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Clutch' }))

app.listen(PORT, () => {
  console.log(`Clutch server running on port ${PORT}`)
})