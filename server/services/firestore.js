import { Firestore } from '@google-cloud/firestore'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'

dotenv.config({ path: '../.env' })

const keyPath = resolve('../serviceAccountKey.json')
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'))

const db = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key
  }
})

export async function createGoal(userId, goal) {
  const ref = db.collection('goals').doc()
  const data = {
    id: ref.id,
    userId,
    title: goal.title,
    deadline: goal.deadline,
    context: goal.context || '',
    status: 'active',
    streak: 0,
    createdAt: new Date().toISOString(),
    tasks: []
  }
  await ref.set(data)
  return data
}

export async function saveTaskPlan(goalId, tasks) {
  await db.collection('goals').doc(goalId).update({ tasks })
  return tasks
}

export async function getGoal(goalId) {
  const doc = await db.collection('goals').doc(goalId).get()
  if (!doc.exists) return null
  return doc.data()
}

export async function getUserGoals(userId) {
  const snapshot = await db.collection('goals')
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .get()
  return snapshot.docs.map(d => d.data())
}

export async function updateTaskStatus(goalId, taskId, status) {
  const goal = await getGoal(goalId)
  if (!goal) return null

  const tasks = goal.tasks.map(t =>
    t.id === taskId ? { ...t, status, completedAt: status === 'done' ? new Date().toISOString() : null } : t
  )

  const doneTasks = tasks.filter(t => t.status === 'done').length
  const totalTasks = tasks.length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  let streak = goal.streak || 0
  let lastActivityDate = goal.lastActivityDate

  if (status === 'done') {
    const today = new Date().toDateString()
    if (lastActivityDate !== today) {
      if (lastActivityDate === new Date(Date.now() - 86400000).toDateString()) {
        streak += 1
      } else {
        streak = 1
      }
      lastActivityDate = today
    }
  }

  await db.collection('goals').doc(goalId).update({
    tasks,
    progress,
    streak,
    lastActivityDate
  })

  return { tasks, progress, streak }
}

export async function replanGoal(goalId, newTasks) {
  await db.collection('goals').doc(goalId).update({
    tasks: newTasks,
    replannedAt: new Date().toISOString()
  })
  return newTasks
}

export async function getConversationHistory(userId, goalId = null) {
  const docId = goalId ? `${userId}_${goalId}` : userId
  const doc = await db.collection('conversations').doc(docId).get()
  if (!doc.exists) return []
  return doc.data().history || []
}

export async function saveConversationHistory(userId, history, goalId = null) {
  const docId = goalId ? `${userId}_${goalId}` : userId
  await db.collection('conversations').doc(docId).set({ history, updatedAt: new Date().toISOString() })
}

export async function saveCalendarToken(userId, tokens) {
  await db.collection('calendarTokens').doc(userId).set({ tokens, updatedAt: new Date().toISOString() })
}

export async function getCalendarToken(userId) {
  const doc = await db.collection('calendarTokens').doc(userId).get()
  if (!doc.exists) return null
  return doc.data().tokens
}


export async function saveUser(userId, userData) {
  await db.collection('users').doc(userId).set({ ...userData, updatedAt: new Date().toISOString() })
}

export async function getUser(userId) {
  const doc = await db.collection('users').doc(userId).get()
  if (!doc.exists) return null
  return doc.data()
}

export async function markGoalSynced(goalId) {
  await db.collection('goals').doc(goalId).update({ calendarSynced: true })
}