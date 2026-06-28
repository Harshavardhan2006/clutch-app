import express from 'express'
import { getUserGoals, getGoal, updateTaskStatus, updateTaskDate } from '../services/firestore.js'

const router = express.Router()

router.get('/:userId', async (req, res) => {
  try {
    const goals = await getUserGoals(req.params.userId)
    res.json({ goals })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/single/:goalId', async (req, res) => {
  try {
    const goal = await getGoal(req.params.goalId)
    if (!goal) return res.status(404).json({ error: 'Goal not found' })
    res.json({ goal })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:goalId/tasks/:taskId', async (req, res) => {
  try {
    const { status } = req.body
    const result = await updateTaskStatus(req.params.goalId, req.params.taskId, status)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:goalId/tasks/:taskId/date', async (req, res) => {
  try {
    const { date } = req.body
    const result = await updateTaskDate(req.params.goalId, req.params.taskId, date)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
