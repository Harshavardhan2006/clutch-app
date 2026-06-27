import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export async function sendMessage(userId, message, goalId = null) {
  const url = goalId ? `/chat/goal/${goalId}` : '/chat'
  const res = await api.post(url, { userId, message })
  return res.data.reply
}

export async function getGoals(userId) {
  const res = await api.get(`/goals/${userId}`)
  return res.data.goals
}

export async function getGoal(goalId) {
  const res = await api.get(`/goals/single/${goalId}`)
  return res.data.goal
}

export async function updateTask(goalId, taskId, status) {
  const res = await api.patch(`/goals/${goalId}/tasks/${taskId}`, { status })
  return res.data
}

export async function getCalendarAuthUrl(userId) {
  const res = await api.get('/auth/google/login-url')
  return res.data.url
}

export async function exchangeCalendarCode(userId, code) {
  const res = await api.post('/auth/google/callback', { userId, code })
  return res.data
}

export async function syncToCalendar(userId, tasks, goalTitle, goalId) {
  const res = await api.post('/auth/calendar/sync', { userId, tasks, goalTitle, goalId })
  return res.data
}

export async function getCalendarStatus(userId) {
  const res = await api.get(`/auth/calendar/status/${userId}`)
  return res.data
}

export async function clearHistory(userId, goalId = null) {
  if (goalId) {
    await api.delete(`/chat/goal/${goalId}/history/${userId}`)
  } else {
    await api.delete(`/chat/history/${userId}`)
  }
}
