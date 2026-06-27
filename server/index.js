import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRoutes from './routes/chat.js'
import goalsRoutes from './routes/goals.js'
import authRoutes from './routes/auth.js'

dotenv.config({ path: '../.env' })

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/chat', chatRoutes)
app.use('/api/goals', goalsRoutes)
app.use('/api/auth', authRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Clutch' }))

app.listen(PORT, () => {
  console.log(`Clutch server running on port ${PORT}`)
})
