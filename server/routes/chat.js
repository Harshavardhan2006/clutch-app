import express from 'express'
import { runAgentChat } from '../services/gemini.js'
import { getConversationHistory, saveConversationHistory } from '../services/firestore.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { message, userId } = req.body
    if (!message || !userId) return res.status(400).json({ error: 'message and userId required' })

    const history = await getConversationHistory(userId)
    const { text, history: updatedHistory } = await runAgentChat(userId, message, history)
    await saveConversationHistory(userId, updatedHistory)

    res.json({ reply: text })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: 'Agent failed', details: err.message })
  }
})

router.post('/goal/:goalId', async (req, res) => {
  try {
    const { message, userId } = req.body
    const { goalId } = req.params
    if (!message || !userId) return res.status(400).json({ error: 'message and userId required' })

    const history = await getConversationHistory(userId, goalId)
    const { text, history: updatedHistory } = await runAgentChat(userId, message, history, goalId)
    await saveConversationHistory(userId, updatedHistory, goalId)

    res.json({ reply: text })
  } catch (err) {
    console.error('Goal Chat error:', err)
    res.status(500).json({ error: 'Agent failed', details: err.message })
  }
})

router.delete('/history/:userId', async (req, res) => {
  try {
    await saveConversationHistory(req.params.userId, [])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/goal/:goalId/history/:userId', async (req, res) => {
  try {
    await saveConversationHistory(req.params.userId, [], req.params.goalId)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
